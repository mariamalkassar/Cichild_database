import datetime
from django.contrib.auth.models import User
from django.db import models
from datetime import date
import cichild_database_server.settings as settings
import os
import shutil


def get_empty_string_of_length(length):
    s = ''
    for i in range(0, length):
        s += ' '
    return s


class BackupManager(models.Model):
    last_backup_date = models.DateField(null=False, blank=False)

    def should_create_backup(self):
        return date.today().strftime('%Y-%m-%d') != self.last_backup_date

    def create_database_backup(self):
        backup_file_name = str(date.today().strftime('%Y-%m-%d')) + '.sqlite3'
        backup_file_path = os.path.join(settings.DATABASE_BACKUP_DIR_PATH, backup_file_name)
        shutil.copy(settings.DATABASE_FILE_PATH, backup_file_path)
        self.last_backup_date = date.today().strftime('%Y-%m-%d')
        self.save()

    @staticmethod
    def instance():
        if len(BackupManager.objects.all()) == 0:
            manager = BackupManager(last_backup_date=date.today().strftime('%Y-%m-%d'))
            manager.save()
            return manager
        return BackupManager.objects.all()[0]


class CustomDateTimeField(models.DateTimeField):
    def value_to_string(self, obj):
        val = self.value_from_object(obj)
        if val:
            val.replace(microsecond=0)
            return val.isoformat()
        return ''


class Comment(models.Model):
    comment = models.TextField(null=True, blank=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    date = models.CharField(max_length=100, null=True, blank=True)

    def serialize(self):
        user = 'N/A'
        if self.user:
            user = self.user.username

        date = 'N/A'
        if self.date:
            date = self.date

        return {
            'id': self.id,
            'user': user,
            'date': date,
            'comment': self.comment
        }


class Specie(models.Model):
    name = models.CharField(max_length=10, null=False, blank=False)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
        }


class TankSystem(models.Model):
    name = models.CharField(max_length=10, null=True, blank=True)
    color = models.CharField(max_length=7, null=True, blank=True)
    landmark = models.CharField(max_length=20, null=True, blank=True)

    def serialize(self):
        tanks_ids = [tank.id for tank in self.tank_set.all().order_by('order')]
        return {
            'id': self.id,
            'name': self.name,
            'tanks_ids': tanks_ids,
            'color': self.color,
            'landmark': self.landmark
        }


class Tank(models.Model):
    name = models.CharField(max_length=10, null=True, blank=True)
    system = models.ForeignKey(TankSystem, null=True, blank=True, on_delete=models.DO_NOTHING)
    comment = models.ManyToManyField(Comment)
    total_slots_num = models.IntegerField(null=True, blank=True, default=12)
    order = models.IntegerField(null=True, blank=True)

    def get_ordered_fragments(self):
        fragments = list(self.tankfragment_set.filter(is_active=True))
        fragments.sort(key=lambda x: x.get_numbers()[0], reverse=False)
        return fragments

    def __str__(self):
        section_length = 15

        fragments = self.get_ordered_fragments()
        names_line = ''
        species_lines = ''
        fish_line = ''

        for fragment in fragments:
            names_line += fragment.name + get_empty_string_of_length(section_length - len(fragment.name))
            species_lines += fragment.specie.name + get_empty_string_of_length(
                section_length - len(fragment.specie.name))

        names_line += '\n'
        species_lines += '\n'

        return names_line + species_lines

    def serialize(self):
        comments = [comment.serialize() for comment in self.comment.all()]
        fragments_ids = [fragment.id for fragment in self.get_ordered_fragments()]

        return {
            'id': self.id,
            'name': self.name,
            'system_id': self.system.id,
            'comments': comments,
            'fragments_ids': fragments_ids,
            'slots_num': self.total_slots_num
        }


class TankFragment(models.Model):
    name = models.CharField(max_length=10, null=True, blank=True)
    number = models.IntegerField(blank=True, null=True)
    start = models.IntegerField(blank=True, null=True)
    end = models.IntegerField(blank=True, null=True)
    tank = models.ForeignKey(Tank, null=True, blank=True, on_delete=models.DO_NOTHING)
    specie = models.ForeignKey('Specie', null=True, blank=True, on_delete=models.DO_NOTHING)
    comment = models.ManyToManyField(Comment)
    is_active = models.BooleanField(default=True)
    is_merged = models.BooleanField(default=False)
    merged_of = models.ManyToManyField('TankFragment')

    def create_name(self):
        self.name = TankFragment.get_tank_fragment_name(self.tank.name, self.get_numbers())
        self.save()

    @staticmethod
    def get_tank_fragment_name(tank_name, numbers):
        if len(numbers) == 1:
            return tank_name + str(numbers[0])
        else:
            numbers.sort()
            return tank_name + str(numbers[0]) + '-' + str(numbers[-1])

    @staticmethod
    def create_tank_fragment(tank, fragment_name, fragment_numbers, specie):
        if TankFragment.objects.filter(name=fragment_name).exists():
            fragment = TankFragment.objects.get(name=fragment_name)
            fragment.is_active = True
        else:
            fragment = TankFragment(name=fragment_name,
                                    is_active=True, tank=tank,
                                    is_merged=len(fragment_numbers) > 1,
                                    specie=specie)
        fragment.save()
        if len(fragment_numbers) > 1:
            fragment.number = None
            fragment_numbers.sort()
        else:
            fragment.number = fragment_numbers[0]

        fragment.start = fragment_numbers[0]
        fragment.end = fragment_numbers[-1]
        fragment.save()

        return fragment

    @staticmethod
    def merge_fragments(fragment_1, fragment_2):
        fragment_1.is_active = False
        fragment_2.is_active = False
        fragment_1.save()
        fragment_2.save()

        tank = fragment_1.tank

        tanks_numbers = []
        tanks_numbers.extend(fragment_1.get_numbers())
        tanks_numbers.extend(fragment_2.get_numbers())

        new_tank_name = TankFragment.get_tank_fragment_name(fragment_1.tank.name, tanks_numbers)

        tank_fragment = TankFragment.create_tank_fragment(tank, new_tank_name, tanks_numbers, fragment_1.specie)

        for tank_number in tanks_numbers:
            original_tank = tank.tankfragment_set.get(number=tank_number)
            tank_fragment.merged_of.add(original_tank)
        tank_fragment.save()

        for fish in fragment_1.fish_set.all():
            fish.move(tank_fragment)

        for fish in fragment_2.fish_set.all():
            fish.move(tank_fragment)

        return tank_fragment

    @staticmethod
    def split_fragment(fragment, fragment_1_data, fragment_2_data):
        fragment.is_active = False
        fragment.save()
        tank = fragment.tank

        fragment_1 = TankFragment.create_tank_fragment(tank,
                                                       fragment_1_data['name'],
                                                       fragment_1_data['numbers'],
                                                       fragment.specie)
        fragment_2 = TankFragment.create_tank_fragment(tank,
                                                       fragment_2_data['name'],
                                                       fragment_2_data['numbers'],
                                                       fragment.specie)

        for fish in fragment.fish_set.all():
            fish.move(fragment_1)

        return fragment_1, fragment_2

    def get_numbers(self):
        if not self.is_merged:
            return [self.start]
        else:
            return list(range(self.start, self.end + 1))

    def get_splitting_options(self):
        options = []
        start = self.start
        end = self.end
        counter = 0
        while start != end:
            counter += 1
            first_numbers = list(range(self.start, start + 1))
            second_numbers = list(range(start + 1, end + 1))
            option = {
                'id': counter,
                'type': 'split',
                'fragment_1': {
                    'name': TankFragment.get_tank_fragment_name(self.tank.name, first_numbers),
                    'numbers': first_numbers
                },
                'fragment_2': {
                    'name': TankFragment.get_tank_fragment_name(self.tank.name, second_numbers),
                    'numbers': second_numbers
                }
            }
            options.append(option)
            start += 1

        return options

    def get_merging_options(self):
        fragments_in_same_tanks = TankFragment.objects.filter(tank=self.tank, is_active=True).exclude(pk=self.id)
        options = []
        counter = 0
        for fragment in fragments_in_same_tanks:
            if fragment.start == self.end + 1 or fragment.end == self.start - 1:
                counter += 1
                numbers = []
                numbers.extend(self.get_numbers())
                numbers.extend(fragment.get_numbers())

                options.append({
                    'id': counter,
                    'type': 'merge',
                    'name': TankFragment.get_tank_fragment_name(self.tank.name, numbers),
                    'fragment_1_id': self.id,
                    'fragment_2_id': fragment.id
                })
        return options

    def serialize(self):
        comments = [comment.serialize() for comment in self.comment.all()]
        merged_of_ids = list(self.merged_of.all().values_list('id', flat=True))
        specie_id = None
        if self.specie:
            specie_id = self.specie.id
        return {
            'id': self.id,
            'name': self.name,
            'tank_id': self.tank.id,
            'comments': comments,
            'is_active': self.is_active,
            'is_merged': self.is_merged,
            'specie_id': specie_id,
            'primitive_fragments_ids': merged_of_ids,
            'start': self.start,
            'end': self.end,
            'splitting_options': self.get_splitting_options(),
            'merging_options': self.get_merging_options(),
            'fish_ids': list(self.fish_set.all().values_list('id', flat=True))
        }


class FishNameCharacter(models.Model):
    char = models.CharField(max_length=1, null=False, blank=False)

    @staticmethod
    def create_new_name_character(char):
        if FishNameCharacter.objects.filter(char=char):
            return False

        new_char = FishNameCharacter(char=char)
        new_char.save()

        FishName.generate_names_for_new_char(new_char)
        return True


class FishName(models.Model):
    name = models.CharField(max_length=10, null=False, blank=False)

    @staticmethod
    def get_fish_name_possibilities(char_1, char_2):
        possible_names = []

        possible_names.append(char_1 + char_2 + '__')
        possible_names.append(char_1 + '_' + char_2 + '_')
        possible_names.append(char_1 + '_' + '_' + char_2)
        possible_names.append('_' + char_1 + char_2 + '_')
        possible_names.append('_' + char_1 + '_' + char_2)
        possible_names.append('__' + char_1 + char_2)

        return possible_names

    @staticmethod
    def generate_name_possibilities(char_1, char_2):
        possible_names = []

        possible_names.append(char_1.char + char_2.char + '__')
        possible_names.append(char_1.char + '_' + char_2.char + '_')
        possible_names.append(char_1.char + '_' + '_' + char_2.char)
        possible_names.append('_' + char_1.char + char_2.char + '_')
        possible_names.append('_' + char_1.char + '_' + char_2.char)
        possible_names.append('__' + char_1.char + char_2.char)

        return possible_names

    @staticmethod
    def generate_names_for_new_char(new_char):

        new_names = []
        for char in FishNameCharacter.objects.all():
            new_names.extend(FishName.generate_name_possibilities(new_char, char))
            if not new_char == char:
                new_names.extend(FishName.generate_name_possibilities(char, new_char))

        for name in new_names:
            if not FishName.objects.filter(name=name).exists():
                new_name = FishName(name=name)
                new_name.save()



    @staticmethod
    def generate_all_fish_names():
        all_namess = []
        all_namess.extend(FishName.get_fish_name_possibilities('B', 'B'))
        all_namess.extend(FishName.get_fish_name_possibilities('R', 'R'))
        all_namess.extend(FishName.get_fish_name_possibilities('O', 'O'))
        all_namess.extend(FishName.get_fish_name_possibilities('Y', 'Y'))
        all_namess.extend(FishName.get_fish_name_possibilities('B', 'R'))
        all_namess.extend(FishName.get_fish_name_possibilities('R', 'B'))
        all_namess.extend(FishName.get_fish_name_possibilities('B', 'O'))
        all_namess.extend(FishName.get_fish_name_possibilities('O', 'B'))
        all_namess.extend(FishName.get_fish_name_possibilities('B', 'Y'))
        all_namess.extend(FishName.get_fish_name_possibilities('Y', 'B'))
        all_namess.extend(FishName.get_fish_name_possibilities('R', 'O'))
        all_namess.extend(FishName.get_fish_name_possibilities('O', 'R'))
        all_namess.extend(FishName.get_fish_name_possibilities('R', 'Y'))
        all_namess.extend(FishName.get_fish_name_possibilities('Y', 'R'))
        all_namess.extend(FishName.get_fish_name_possibilities('O', 'Y'))
        all_namess.extend(FishName.get_fish_name_possibilities('Y', 'O'))
        for name in all_namess:
            if FishName.objects.filter(name=name):
                print(name)
                continue

            new_name = FishName(name=name)
            new_name.save()

    def get_next_generation(self):
        return len(Fish.objects.filter(name=self)) + 1

    @staticmethod
    def get_free_names():
        alive_fish_names_ids = Fish.objects.filter(is_dead=False).values_list('name_id', flat=True)
        return FishName.objects.exclude(pk__in=alive_fish_names_ids)

    @property
    def in_use(self):
        return Fish.objects.filter(is_dead=False, name=self).exists()

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'in_use': self.in_use
        }


def compareDatesStrings(c1=None, c2=None):
    if not c1 and not c2:
        return 0

    if not c1:
        return -1

    if not c2:
        return 1

    date_1 = c1.dof
    date_2 = c2.dof

    if date_1 == '' and date_2 == '':
        return 0
    if date_1 == '':
        return -1
    if date_2 == '':
        return 1

    date_1_data = date_1.split('.')
    date_2_data = date_1.split('.')

    year1 = int(date_1_data[2])
    year2 = int(date_2_data[2])
    if year1 < year2:
        return -1
    elif year2 < year1:
        return 1

    month1 = int(date_1_data[1])
    month2 = int(date_2_data[1])
    if month1 < month2:
        return -1
    elif month2 < month1:
        return 1

    day1 = int(date_1_data[0])
    day2 = int(date_2_data[0])
    if day1 < day2:
        return -1
    elif day2 < day1:
        return 1
    return 0


class Fish(models.Model):
    name = models.ForeignKey(FishName, null=False, blank=False, on_delete=models.DO_NOTHING)
    gender = models.CharField(max_length=10, null=True, blank=True)
    date = models.CharField(max_length=100, null=True, blank=True, default='')
    dof = models.CharField(max_length=100, null=True, blank=True, default='')
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    generation = models.IntegerField(null=False, blank=False)
    transgene = models.CharField(max_length=200, null=True, blank=True, default='')
    comment = models.ManyToManyField(Comment)
    usage = models.CharField(max_length=250, null=True, blank=True, default='')
    location = models.ForeignKey(TankFragment, null=True, blank=True, on_delete=models.DO_NOTHING)
    is_missing = models.BooleanField(default=False)
    is_dead = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    @staticmethod
    def fill_from_old_database(csv_file_path):
        csv_file = open(csv_file_path, 'r')
        fish_lines = csv_file.readlines()
        for line in fish_lines:
            data = line.split(';')
            name_str = data[1]
            is_missing = int(data[2])
            is_dead = int(data[3])
            gender = data[4]

            name = FishName.objects.get(name=name_str)
            generation = len(Fish.objects.filter(name=name)) + 1

            fish = Fish(name=name, gender=gender, is_dead=is_dead, is_missing=is_missing, generation=generation)
            fish.save()

    @staticmethod
    def fill_locations_from_old_database(csv_file_path):
        csv_file = open(csv_file_path, 'r')
        fish_lines = csv_file.readlines()
        for line in fish_lines:
            data = line.split(';')
            name_str = data[1]
            is_dead = int(data[3])
            location_name = data[5]

            if is_dead == 0:
                try:
                    name = FishName.objects.get(name=name_str)
                    fish = Fish.objects.get(is_dead=False, name=name)
                    location = TankFragment.objects.get(name=location_name)
                    fish.location = location
                    fish.save()
                except:
                    print('************', name_str, location_name)

    def move(self, new_tank_fragment):
        previous_location_history_entry = self.fishlocationhistory_set.get(is_current=True)
        previous_location_history_entry.is_current = False
        previous_location_history_entry.move_out_date = date.today().strftime('%Y-%m-%d')
        previous_location_history_entry.save()

        self.location = new_tank_fragment
        new_location_history_entry = FishLocationHistory(fish=self,
                                                         location=self.location,
                                                         is_current=True,
                                                         move_in_date=date.today().strftime('%Y-%m-%d'))
        new_location_history_entry.save()

        self.save()

    def kill(self):
        self.is_dead = True
        self.is_missing = False
        self.save()
        self.name.save()

        self.move(TankFragment.objects.get(pk=102))

    def bring_alive(self):
        self.is_dead = False
        self.is_missing = True
        self.save()
        self.move(TankFragment.objects.get(pk=101))

    def serialize(self):
        comments = [comment.serialize() for comment in self.comment.all()]

        location_history = [history.serialize() for history in self.fishlocationhistory_set.all()]
        location_id = None
        if self.location:
            location_id = self.location.id

        user = 'N/A'
        if self.user:
            user = self.user.username

        clutches = []
        if self.gender == 'male':
            clutches = [c for c in self.clutch_male.filter(deleted=False).order_by('dof')]
        elif self.gender == 'female':
            clutches = [c for c in self.clutch_female.filter(deleted=False).order_by('dof')]

        # clutches = sorted(clutches, key=compareDatesStrings)

        clutches_ids = [c.id for c in clutches]

        return {
            'id': self.id,
            'name': self.name.serialize(),
            'gender': self.gender,
            'is_missing': self.is_missing,
            'is_dead': self.is_dead,
            'transgene': self.transgene,
            'generation': self.generation,
            'date': self.date,
            'dof': self.dof,
            'comments': comments,
            'usage': self.usage,
            'tank_fragment_id': location_id,
            'location_history': location_history,
            'location_id': location_id,
            'clutches_ids': clutches_ids,
            'user': user
        }


class FishLocationHistory(models.Model):
    fish = models.ForeignKey(Fish, null=True, blank=True, on_delete=models.CASCADE)
    location = models.ForeignKey(TankFragment, null=True, blank=True, on_delete=models.DO_NOTHING)
    move_in_date = models.TextField(null=True, blank=True)
    move_out_date = models.TextField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    def serialize(self):
        return {
            'id': self.id,
            'location_name': self.location.name,
            'move_out_date': self.move_out_date,
            'move_in_date': self.move_in_date,
            'is_current': self.is_current
        }


class Clutch(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    female = models.ForeignKey(Fish, related_name='clutch_female', null=True, blank=False, on_delete=models.CASCADE)
    male = models.ForeignKey(Fish, related_name='clutch_male', null=True, blank=False, on_delete=models.CASCADE)
    dof = models.CharField(max_length=100, null=True, blank=True)
    comment = models.ManyToManyField(Comment)
    is_dead = models.BooleanField(default=False)
    usage = models.CharField(max_length=250, null=True, blank=True)
    deleted = models.BooleanField(default=False)

    death_date = models.CharField(max_length=25, null=True, blank=True, default='')
    switch_to_father_date = models.CharField(max_length=25, null=True, blank=True, default='')
    switch_to_father_size = models.CharField(max_length=50, null=True, blank=True, default='')
    include_in_csv = models.BooleanField(default=True)

    def serialize(self):
        comments = [comment.serialize() for comment in self.comment.all()]

        return {
            'id': self.id,
            'female_id': self.female.id,
            'male_id': self.male.id,
            'comments': comments,
            'dof': self.dof,
            'usage': self.usage,
            'is_dead': self.is_dead,
            'include_in_csv': self.include_in_csv,
            'death_date': self.death_date,
            'switch_to_father_date': self.switch_to_father_date,
            'switch_to_father_size': self.switch_to_father_size,
            'user': self.user.username
        }

    @staticmethod
    def export_clutches_as_csv(output_file_path, separator):
        f = open(output_file_path, 'w', encoding='utf-8')
        header = 'Mom' + separator + 'Dad' + separator + 'DOF' + separator + 'Death Date' + separator + 'Switch to Father Date' + separator + 'Size at Switch Point' + separator + 'Usage' + separator + 'Comments' + '\n'
        f.write(header)
        for c in Clutch.objects.filter(include_in_csv=True):

            switch_to_father_size = c.switch_to_father_size
            if switch_to_father_size != '':
                switch_to_father_size = str(switch_to_father_size)

            line = ''
            line += c.female.name.name + separator
            line += c.male.name.name + separator
            line += c.dof + separator
            line += c.death_date + separator
            line += c.switch_to_father_date + separator
            line += switch_to_father_size + separator
            line += c.usage.replace(',', ';') + separator

            comments = ' **** '.join(com.comment.replace(',', ';') for com in c.comment.all())
            line += comments + '\n'
            f.write(line)

        f.close()


# region Action log

class ActionType(models.Model):
    type = models.CharField(max_length=25, null=False, blank=False)


class Action(models.Model):
    class Meta:
        abstract = True

    user = models.ForeignKey(User, null=False, blank=False, on_delete=models.DO_NOTHING)
    date = models.CharField(max_length=25, null=True, blank=True, default='')
    description = models.TextField(null=True, blank=True)
    type = models.ForeignKey(ActionType, null=False, on_delete=models.DO_NOTHING)

    def save(self, *args, **kwargs):
        self.date = str(datetime.datetime.now()).split('.')[0]

        super(Action, self).save(*args, **kwargs)

    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.username,
            'actionType': self.type.type,
            'date': self.date,
            'description': self.description
        }


class FishAction(Action):
    fish = models.ForeignKey(Fish, null=False, blank=False, on_delete=models.CASCADE)

    def serialize(self):
        serialized_data = super(FishAction, self).serialize()
        fish_name = self.fish.name.name + ' (' + str(self.fish.generation) + ')'
        serialized_data['itemName'] = fish_name
        serialized_data['itemType'] = 'FISH'

        return serialized_data


class FishActionMove(FishAction):
    old_location = models.ForeignKey(TankFragment, related_name='old_location', null=False, blank=False,
                                     on_delete=models.CASCADE)
    new_location = models.ForeignKey(TankFragment, related_name='new_location', null=False, blank=False,
                                     on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.type_id = 3
        self.description = 'The fish has been moved from "<b>' + self.old_location.name + '</b>" to "<b>' + self.new_location.name + '</b>"'

        super(FishActionMove, self).save(*args, **kwargs)


class FishActionRename(FishAction):
    old_name = models.ForeignKey(FishName, related_name='old_name', null=False, blank=False,
                                 on_delete=models.CASCADE)
    new_name = models.ForeignKey(FishName, related_name='new_name', null=False, blank=False,
                                 on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.type_id = 8
        self.description = 'The fish name has been changed from "<b>' + self.old_name.name + '</b>" to "<b>' + self.new_name.name + '</b>"'
        super(FishActionRename, self).save(*args, **kwargs)


class ClutchAction(Action):
    clutch = models.ForeignKey(Clutch, null=False, on_delete=models.CASCADE)

    def serialize(self):
        serialized_data = super(ClutchAction, self).serialize()
        item_name = self.clutch.male.name.name + ' (' + str(
            self.clutch.male.generation) + ')' + ' & ' + self.clutch.female.name.name + ' (' + str(
            self.clutch.female.generation) + ')' + ' | DOF = ' + self.clutch.dof
        serialized_data['itemName'] = item_name
        serialized_data['itemType'] = 'CLUTCH'

        return serialized_data


class CommentAction(Action):
    comment = models.ForeignKey(Comment, null=False, on_delete=models.CASCADE)


class TankFragmentAction(Action):
    tank_fragment = models.ForeignKey(TankFragment, related_name='TankFragment', null=False, on_delete=models.CASCADE)

    def serialize(self):
        serialized_data = super(TankFragmentAction, self).serialize()
        serialized_data['itemName'] = self.tank_fragment.name
        serialized_data['itemType'] = 'TANK'

        return serialized_data


class MergeSplitTankFragmentAction(TankFragmentAction):
    tank_1 = models.ForeignKey(TankFragment, related_name='Tank1', null=False, on_delete=models.CASCADE)
    tank_2 = models.ForeignKey(TankFragment, related_name='Tank2', null=False, on_delete=models.CASCADE)

    @staticmethod
    def create_merge_action(user_id, tank_1, tank_2, new_tank):
        description = '"<b>' + tank_1.name + '</b>" & "<b>' + tank_2.name + '</b>" has been merged into "<b>' + new_tank.name + '</b>"'
        action = MergeSplitTankFragmentAction(type_id=5,
                                              user_id=user_id,
                                              description=description,
                                              tank_fragment=new_tank,
                                              tank_1=tank_1,
                                              tank_2=tank_2)
        action.save()

    @staticmethod
    def create_split_action(user_id, tank_1, tank_2, old_tank):
        description = '"<b>' + old_tank.name + '</b>" has been split into "<b>' + tank_1.name + '</b>" & "<b>' + tank_2.name + '</b>"'

        action = MergeSplitTankFragmentAction(type_id=4,
                                              user_id=user_id,
                                              description=description,
                                              tank_fragment=old_tank,
                                              tank_1=tank_1,
                                              tank_2=tank_2)
        action.save()


class ChangeTankFragmentSpecie(TankFragmentAction):
    old_specie = models.ForeignKey(Specie, related_name='old_specie', null=False, on_delete=models.CASCADE)
    new_specie = models.ForeignKey(Specie, related_name='new_specie', null=False, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.type_id = 11
        self.description = 'The specie of this tank has been changed from "<b>' + self.old_specie.name + '</b>" into "<b>' + self.new_specie.name + '</b>"'
        super(ChangeTankFragmentSpecie, self).save(*args, **kwargs)

# endregion
