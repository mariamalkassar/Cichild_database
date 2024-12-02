import datetime
import json
import os
from django.db.models import Q
from django.contrib import auth
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from app_cichild_database.models import *
from cichild_database_server import settings


def fix_all_clutches_dates():
    # for c in Clutch.objects.all():
    #     if c.dof != '':
    #         dof = c.dof.replace('.', '-')
    #         dof_data = dof.split('-')
    #         dof_data.reverse()
    #         c.dof = '-'.join(item for item in dof_data)
    #         c.save()

    for c in Clutch.objects.all():
        if c.dof != '':
            c.dof = c.dof.replace('.', '-')

            dof_data = c.dof.split('-')
            if len(dof_data[2]) == 2:
                dof_data[2] = '20' + dof_data[2]

            dof_data.reverse()
            c.dof = '-'.join(i for i in dof_data)
            c.save()


def standardize_date(date):
    if date and date != '':
        date = date.replace('.', '-')

        date_data = date.split('-')
        # 2022-02-28
        # 28-02-2022

        if len(date_data[0]) == 2:
            date_data.reverse()

        date = '-'.join(i for i in date_data)
    return date


def standardize_all_clutches_dates():
    for clutch in Clutch.objects.all():
        clutch.dof = standardize_date(clutch.dof)
        clutch.switch_to_father_date = standardize_date(clutch.switch_to_father_date)
        clutch.death_date = standardize_date(clutch.death_date)
        clutch.save()


def various(request):
    ## Read comments.csv
    # comment_file = open('comments.csv', 'r')
    # comments.csv = comment_file.readlines()
    # all_fish = Fish.objects.all().order_by('id')
    # for i, comment_line in enumerate(comments.csv):
    #     comment = comment_line.replace('\n', '')
    #     if comment == '':
    #         continue
    #     new_comment = Comment(comment=comment)
    #     new_comment.save()
    #     fish = all_fish[i]
    #     fish.comment.add(new_comment)

    # name_str = 'Y_Y_'
    # t_name = 'SB5-6'
    # name = FishName.objects.get(name=name_str)
    # f = Fish.objects.get(name=name, is_dead=False)
    # tankFragment = TankFragment.objects.get(name=t_name)
    #
    # f.location = tankFragment
    # f.save()

    # Create users
    # nawwar = User(username='nawwar', password='sdf', email='nmokayes@neuro.mpg.de',
    #               first_name='Nouwar', last_name='Mokayes')
    # nawwar.save()
    # nawwar.set_password('federer')
    # nawwar.save()
    #
    # ash = User(username='ash', password='ash', email='ashparker@neuro.mpg.de',
    #            first_name='Ashley', last_name='Parker')
    # ash.save()
    # ash.set_password('ash')
    # ash.save()
    #
    # manuel = User(username='manuel', password='manuel', email='stemmer@neuro.mpg.de',
    #               first_name='Manuel', last_name='Stemmer')
    # manuel.save()
    # manuel.set_password('manuel')
    # manuel.save()
    #
    # swantje = User(username='swantje', password='swantje', email='graetsch@neuro.mpg.de',
    #                first_name='Swantje', last_name='Graetsch')
    # swantje.save()
    # swantje.set_password('swantje')
    # swantje.save()

    for c in Clutch.objects.all():
        c.switch_to_father_size = ''
        c.save()
    pass


def serialize_as_list(serializable_objects_list):
    return [obj.serialize() for obj in serializable_objects_list]


def serialize_as_dictionary(serializable_objects_list):
    data = {}
    for obj in serializable_objects_list:
        data[obj.id] = obj.serialize()
    return data


def get_all_data():
    return {
        'fish': serialize_as_dictionary(Fish.objects.filter(deleted=False)),
        'tanks_systems': serialize_as_list(TankSystem.objects.all()),
        'tanks': serialize_as_dictionary(Tank.objects.all()),
        'tanks_fragments': serialize_as_dictionary(TankFragment.objects.all().order_by('name')),
        'free_fish_name': serialize_as_list(FishName.get_free_names()),
        'species': serialize_as_dictionary(Specie.objects.all()),
        'clutches': serialize_as_dictionary(Clutch.objects.filter(deleted=False))
    }


@csrf_exempt
def load_data(request):
    # user = User.objects.create_user(username='martin', password='martin12345')
    #
    # # Optional: set other fields
    # user.first_name = 'Martin'
    # user.last_name = 'Privat'
    # user.email = 'martin.privat@bi.mpg.de'
    # user.save()
    #
    # user = User.objects.create_user(username='vaishnavi', password='vaishnavi12345')
    #
    # # Optional: set other fields
    # user.first_name = 'Vaishnavi'
    # user.last_name = 'Agarwal'
    # user.email = 'vaishnavi.agarwal@bi.mpg.de'
    # user.save()

    backup_manager = BackupManager.instance()
    if backup_manager.should_create_backup():
        backup_manager.create_database_backup()

    data = get_all_data()
    load_actions_log(request)

    return JsonResponse({'data': data})


@csrf_exempt
def load_actions_log(request):
    fish_actions = list(FishAction.objects.all())
    clutches_actions = list(ClutchAction.objects.all())
    tank_actions = list(TankFragmentAction.objects.all())

    all_actions = []
    all_actions.extend(fish_actions)
    all_actions.extend(clutches_actions)
    all_actions.extend(tank_actions)

    all_actions.sort(key=lambda action: action.date, reverse=True)

    all_actions = [action.serialize() for action in all_actions]

    return JsonResponse({'actionsLog': all_actions})


@csrf_exempt
def merge_tank_fragments(request):
    data = JSONParser().parse(request)

    tank_fragment_1_id = int(data['tankFragment_1_ID'])
    tank_fragment_2_id = int(data['tankFragment_2_ID'])
    user_id = int(data['userID'])

    tank_fragment_1 = TankFragment.objects.get(pk=tank_fragment_1_id)
    tank_fragment_2 = TankFragment.objects.get(pk=tank_fragment_2_id)

    new_tank_fragment = TankFragment.merge_fragments(tank_fragment_1, tank_fragment_2)
    MergeSplitTankFragmentAction.create_merge_action(user_id=user_id, tank_1=tank_fragment_1,
                                                     tank_2=tank_fragment_2, new_tank=new_tank_fragment)

    return JsonResponse({'success': True})


@csrf_exempt
def split_tank_fragment(request):
    data = JSONParser().parse(request)
    fragment_id = int(data['tankFragmentID'])
    split_option_id = int(data['splitOptionID'])
    user_id = int(data['userID'])

    fragment = TankFragment.objects.get(pk=fragment_id)
    split_option = None
    for s in fragment.get_splitting_options():
        if s['id'] == split_option_id:
            split_option = s
            break

    if split_option:
        fragment_1_data = split_option['fragment_1']
        fragment_2_data = split_option['fragment_2']
        tank_1, tank_2 = TankFragment.split_fragment(fragment, fragment_1_data, fragment_2_data)
        MergeSplitTankFragmentAction.create_split_action(user_id=user_id, tank_1=tank_1,
                                                         tank_2=tank_2, old_tank=fragment)

    return JsonResponse({'success': True})


@csrf_exempt
def update_fish(request):

    data = JSONParser().parse(request)

    user_id = int(data['userID'])
    fish_id = int(data['fishID'])
    fragment_id = int(data['fragmentID'])
    name_id = int(data['fishNameID'])
    is_dead = data['isDead']
    is_missing = data['isMissing']
    gender = data['gender']
    transgene = data['transgene']
    date = data['date']
    dof = data['dof']
    usage = data['usage']

    dof = dof.replace('-', '.')
    dof_data = dof.split('.')
    dof_data.reverse()
    dof = '.'.join(item for item in dof_data)

    success = True
    result_message = 'Your updates have been submitted successfully!'

    fish = Fish.objects.get(pk=fish_id)
    old_tank = fish.location

    if fragment_id != fish.location.id:
        action = FishActionMove(fish=fish, user_id=user_id,
                                old_location=fish.location,
                                new_location_id=fragment_id)
        action.save()

        fish.move(TankFragment.objects.get(pk=fragment_id))

    if fish.is_dead != is_dead:
        if is_dead:
            fish.kill()
            description = 'The fish was flagged as <b>"DEAD"</b>!'
            action = FishAction(fish=fish, user_id=user_id, type_id=10, description=description)
            action.save()
        else:
            if not fish.name.in_use:
                fish.bring_alive()
                description = 'The fish was flagged as <b>"ALIVE"</b>!'
                action = FishAction(fish=fish, user_id=user_id, type_id=9, description=description)
                action.save()
                if fragment_id != fish.location.id:
                    action = FishActionMove(fish=fish, user_id=user_id,
                                            old_location=fish.location,
                                            new_location_id=fragment_id)
                    action.save()
                    fish.move(TankFragment.objects.get(pk=fragment_id))
            else:
                success = False
                result_message = 'Another alive fish has the same name. \nYou will not be able to flag this fish as alive as long as the other fish is alive too.\nYour changes are not saved. If you refresh the page you will lose your changes.\nPlease click save again to save your other changes.'

    if success:
        if fish.name.id != name_id:
            action = FishActionRename(fish=fish, user_id=user_id,
                                      old_name=fish.name, new_name_id=name_id)
            action.save()

            new_name = FishName.objects.get(pk=name_id)
            fish.name = new_name
            fish.generation = fish.name.get_next_generation()
            fish.save()

        if gender != fish.gender:
            description = 'The gender has been changed from "<b>' + fish.gender + '</b>" to "<b>' + gender + '</b>"'
            action = FishAction(fish=fish, user_id=user_id, type_id=6,
                                description=description)
            action.save()
            fish.gender = gender

        if transgene != fish.transgene:
            description = 'The transgene has been changed from "<b>' + fish.transgene + '</b>" to "<b>' + transgene + '</b>"'
            action = FishAction(fish=fish, user_id=user_id, type_id=6,
                                description=description)
            action.save()
            fish.transgene = transgene

        if date != fish.date:
            description = 'The date has been changed from "<b>' + fish.date + '</b>" to "<b>' + date + '</b>"'
            action = FishAction(fish=fish, user_id=user_id, type_id=6,
                                description=description)
            action.save()
            fish.date = date

        if dof != fish.dof:
            description = 'The DOF has been changed from "<b>' + fish.dof + '</b>" to "<b>' + dof + '</b>"'
            action = FishAction(fish=fish, user_id=user_id, type_id=6,
                                description=description)
            action.save()
            fish.dof = dof

        if usage != fish.usage:
            description = 'The Usage has been changed from "<b>' + fish.usage + '</b>" to "<b>' + usage + '</b>"'
            action = FishAction(fish=fish, user_id=user_id, type_id=6,
                                description=description)
            action.save()
            fish.usage = usage

        fish.save()

        if fish.is_missing is not is_missing:
            fish.is_missing = is_missing
            fish.save()
            if fish.is_missing:
                description = 'The fish was flagged as <b>"MISSING"</b>!'
                action = FishAction(fish=fish, user_id=user_id, type_id=7,
                                    description=description)
                action.save()
                fish.move(TankFragment.objects.get(pk=101))

    new_tank = fish.location

    return JsonResponse({'success': success, 'fish': fish.serialize(),
                         'old_tank_fragment': old_tank.serialize(),
                         'new_tank_fragment': new_tank.serialize(),
                         'message': result_message,
                         'free_fish_names': serialize_as_list(FishName.get_free_names())})


@csrf_exempt
def update_clutch(request):
    data = JSONParser().parse(request)

    clutch_id = int(data['clutchID'])
    user_id = int(data['userID'])
    is_dead = data['isDead']
    usage = data['usage']
    dof = data['dof']

    include_in_csv = data['includeInCSV']
    switch_to_father_date = data['switchToFatherDate']
    death_date = data['deathDate']

    switch_to_father_size = data['switchToFatherSize']
    if switch_to_father_size and switch_to_father_size != '':
        switch_to_father_size = int(switch_to_father_size)
    else:
        switch_to_father_size = ''

    # dof = dof.replace('-', '.')
    # dof_data = dof.split('.')
    # dof_data.reverse()
    # dof = '.'.join(item for item in dof_data)

    dof = standardize_date(dof)
    switch_to_father_date = standardize_date(switch_to_father_date)
    death_date = standardize_date(death_date)

    success = True
    result_message = 'Your updates have been submitted successfully!'

    clutch = Clutch.objects.get(pk=clutch_id)

    if clutch.usage != usage:
        description = 'The usage of the clutch has been changed from "<b>' + clutch.usage + '</b>" to "<b>' + usage + '</b>"'
        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.usage = usage

    if clutch.dof != dof:
        description = 'The DOF of the clutch has been changed from "<b>' + clutch.dof + '</b>" to "<b>' + dof + '</b>"'
        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.dof = dof

    if clutch.death_date != death_date:
        description = 'The Death date of the clutch has been changed from "<b>' + clutch.death_date + '</b>" to "<b>' + death_date + '</b>"'
        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.death_date = death_date

    if clutch.switch_to_father_date != switch_to_father_date:
        description = 'The "Switch to father date" of the clutch has been changed from "<b>' + clutch.switch_to_father_date + '</b>" to "<b>' + switch_to_father_date + '</b>"'
        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.switch_to_father_date = switch_to_father_date

    if clutch.switch_to_father_size != switch_to_father_size:
        description = 'The "Switch to father size" of the clutch has been changed from "<b>' + str(
            clutch.switch_to_father_size) + '</b>" to "<b>' + str(switch_to_father_size) + '</b>"'
        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.switch_to_father_size = switch_to_father_size

    if clutch.is_dead != is_dead:
        if is_dead:
            description = 'The clutch has been flagged as <b>DEAD</b>'
        else:
            description = 'The clutch has been flagged as <b>ALIVE</b>'

        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.is_dead = is_dead

    if clutch.include_in_csv != include_in_csv:
        if include_in_csv:
            description = 'The clutch became <b>INCLUDED</b> in the CSV export'
        else:
            description = 'The clutch became <b>EXCLUDED</b> from the CSV export'

        action = ClutchAction(clutch=clutch, user_id=user_id, type_id=6, description=description)
        action.save()
        clutch.include_in_csv = include_in_csv

    clutch.save()

    return JsonResponse({'success': success, 'message': result_message})


@csrf_exempt
def create_new_fish(request):
    data = JSONParser().parse(request)

    fragment_id = int(data['fragmentID'])
    name_id = int(data['fishNameID'])
    is_dead = data['isDead']
    is_missing = data['isMissing']
    gender = data['gender']
    transgene = data['transgene']
    creation_date = data['date']
    dof = data['dof']
    usage = data['usage']
    user_id = int(data['userID'])

    if Fish.objects.filter(name_id=name_id, is_dead=False).exists():
        return JsonResponse({'success': False})

    success = True
    result_message = 'Your fish has been saved successfully!'

    name = FishName.objects.get(pk=name_id)
    generation = name.get_next_generation()

    fish = Fish(name=name, location_id=fragment_id, gender=gender,
                transgene=transgene, date=creation_date, dof=dof, user_id=user_id,
                is_dead=is_dead, is_missing=is_missing, generation=generation, usage=usage)
    fish.save()
    location_history = FishLocationHistory(fish=fish, location_id=fragment_id,
                                           move_in_date=date.today().strftime('%Y-%m-%d'),
                                           is_current=True)
    location_history.save()

    # description = 'A new fish was created: "<b>' + fish.name.name + ' (' + str(fish.generation) + ')</b>"'
    description = ''
    action = FishAction(fish=fish, user_id=user_id, type_id=1, description=description)
    action.save()

    return JsonResponse({'success': success, 'fish': fish.serialize(),
                         'tank_fragment': fish.location.serialize(),
                         'message': result_message,
                         'free_fish_name': serialize_as_list(FishName.get_free_names())})


@csrf_exempt
def create_new_clutch(request):
    data = JSONParser().parse(request)

    male_id = int(data['maleID'])
    female_id = int(data['femaleID'])
    dof = data['dof']
    usage = data['usage']
    is_dead = data['isDead']
    user_id = int(data['userID'])
    include_in_csv = data['includeInCSV']
    switch_to_father_date = data['switchToFatherDate']
    death_date = data['deathDate']

    switch_to_father_size = data['switchToFatherSize']
    if switch_to_father_size != '':
        switch_to_father_size = int(switch_to_father_size)
    else:
        switch_to_father_size = None

    dof = standardize_date(dof)
    switch_to_father_date = standardize_date(switch_to_father_date)
    death_date = standardize_date(death_date)

    male = Fish.objects.get(pk=male_id)
    female = Fish.objects.get(pk=female_id)

    user = User.objects.get(pk=user_id)

    clutch = Clutch(male=male, female=female, usage=usage, dof=dof,
                    is_dead=is_dead, user=user, include_in_csv=include_in_csv,
                    switch_to_father_date=switch_to_father_date,
                    switch_to_father_size=switch_to_father_size,
                    death_date=death_date)
    clutch.save()

    # description = 'A new clutch was created: "<b>' + clutch.male.name.name + ' (' + str(
    #     clutch.male.generation) + ')</b>" & "<b>' + clutch.female.name.name + ' (' + str(
    #     clutch.female.generation) + ')</b>" ' + clutch.dof
    description = ''
    action = ClutchAction(clutch=clutch, user_id=user_id, type_id=1, description=description)
    action.save()

    return JsonResponse({'success': True, 'clutch': clutch.serialize()})


@csrf_exempt
def move_fish(request):
    data = JSONParser().parse(request)

    fish_id = int(data['fishID'])
    user_id = int(data['userID'])
    destination_fragment_id = int(data['destinationFragmentID'])
    fish = Fish.objects.get(pk=fish_id)

    old_tank = None
    if fish.location:
        old_tank = fish.location

    destination_fragment = TankFragment.objects.get(pk=destination_fragment_id)

    action = FishActionMove(fish=fish, user_id=user_id,
                            old_location=old_tank, new_location=destination_fragment)
    action.save()
    fish.move(destination_fragment)

    return JsonResponse(
        {'success': True, 'fish': fish.serialize(), 'old_tank_fragment': old_tank.serialize(),
         'new_tank_fragment': destination_fragment.serialize()})


@csrf_exempt
def change_fragment_specie(request):
    try:
        data = JSONParser().parse(request)

        fragment_id = int(data['fragmentID'])
        user_id = int(data['userID'])
        specieID = int(data['specieID'])
        fragment = TankFragment.objects.get(pk=fragment_id)
        specie = Specie.objects.get(pk=specieID)

        action = ChangeTankFragmentSpecie(tank_fragment=fragment, user_id=user_id,
                                          old_specie=fragment.specie, new_specie=specie)
        action.save()

        fragment.specie = specie
        fragment.save()
        return JsonResponse({'success': True})
    except:
        return JsonResponse({'success': False})


@csrf_exempt
def save_new_comment(request):
    data = JSONParser().parse(request)

    item_id = int(data['commentItemID'])
    item_type = data['commentItemType']
    user_id = int(data['userID'])
    commentText = data['comment']

    item = None
    description = ''
    if item_type == 'fish':
        item = Fish.objects.get(pk=item_id)
        description = '(FISH - COMMENT - CREATE) A new comment on the fish'
    elif item_type == 'fragment':
        item = TankFragment.objects.get(pk=item_id)
        description = '(TANK - COMMENT - CREATE) A new comment on the tank'
    elif item_type == 'clutch':
        item = Clutch.objects.get(pk=item_id)
        description = '(CLUTCH - COMMENT - CREATE) A new comment on the clutch'

    if item:
        comment = Comment(comment=commentText, date=datetime.datetime.today().strftime('%Y-%m-%d'),
                          user_id=user_id)
        comment.save()

        item.comment.add(comment)
        item.save()

        action = CommentAction(comment=comment, user_id=user_id, description=description, type_id=1)
        action.save()

        return JsonResponse({'success': True, 'new_comment': comment.serialize()})

    return JsonResponse({'success': False})


@csrf_exempt
def update_comment(request):
    data = JSONParser().parse(request)

    user_id = int(data['userID'])
    comment_id = int(data['commentID'])
    commentText = data['comment']

    comment = Comment.objects.get(pk=comment_id)

    description = '(COMMENT - UPDATE) The comment has been edited from "' + comment.comment + '" to "' + commentText + '"'
    comment.comment = commentText
    comment.save()

    action = CommentAction(comment=comment, user_id=user_id, description=description, type_id=6)
    action.save()

    return JsonResponse({'success': True, 'comment': comment.serialize()})


@csrf_exempt
def delete_fish(request):
    data = JSONParser().parse(request)
    user_id = int(data['userID'])
    fish_id = int(data['fishID'])
    fish = Fish.objects.get(pk=fish_id)

    clutches = Clutch.objects.filter(Q(male=fish) | Q(female=fish))
    affected_parents_list = []
    for clutch in clutches:
        if fish.gender == 'male':
            affected_parents_list.append(clutch.female)
        else:
            affected_parents_list.append(clutch.male)

    fish.deleted = True
    fish.save()

    new_parents_data = {}
    for parent in affected_parents_list:
        clutches = Clutch.objects.filter(Q(male=parent) | Q(female=parent))
        serialized_clutches = [c.serialize() for c in clutches]
        new_parents_data[parent.id] = serialized_clutches

    # description = 'The fish "<b>' + fish.name.name + ' (' + str(fish.generation) + ')</b>" has been deleted.'
    description = ''
    action = FishAction(fish=fish, user_id=user_id, type_id=2, description=description)
    action.save()

    return JsonResponse({'success': True,
                         'affected_parents_clutches': new_parents_data,
                         'free_fish_names': serialize_as_list(FishName.get_free_names())})


@csrf_exempt
def delete_comment(request):
    data = JSONParser().parse(request)
    comment_id = int(data['commentID'])
    Comment.objects.get(pk=comment_id).delete()

    return JsonResponse({'success': True})


@csrf_exempt
def delete_clutch(request):
    data = JSONParser().parse(request)
    clutch_id = int(data['clutchID'])
    user_id = int(data['userID'])
    clutch = Clutch.objects.get(pk=clutch_id)
    clutch.deleted = True
    clutch.save()

    # description = 'The clutch "<b>' + clutch.male.name.name + ' (' + str(
    #     clutch.male.generation) + ')</b>" & "<b>' + clutch.female.name.name + ' (' + str(
    #     clutch.female.generation) + ')</b>" ' + clutch.dof + 'has been deleted.'
    description = ''
    action = ClutchAction(clutch=clutch, user_id=user_id, type_id=2, description=description)
    action.save()

    return JsonResponse({'success': True})


@csrf_exempt
def user_login(request):
    login_data = json.loads(request.body)['loginData']

    username = login_data['username'].lower()
    password = login_data['password']
    user = auth.authenticate(username=username, password=password)

    if user is not None:
        serialized_user = {
            'id': user.id,
            'username': user.username,
        }

        return JsonResponse({'success': True, 'user': serialized_user}, content_type="application/json",
                            safe=False)

    return JsonResponse({'success': False}, content_type="application/json",
                        safe=False)


@csrf_exempt
def download_free_names(request):
    file_name = 'Free_fish_names.txt'
    file_url = os.path.join(settings.MEDIA_URL, file_name)
    file_path = os.path.join(settings.MEDIA_ROOT, file_name)
    file = open(file_path, 'w')
    for name in FishName.get_free_names():
        file.write(name.name + '\n')
    file.close()

    return JsonResponse({'success': True, 'filePath': file_url, 'fileName': file_name}, content_type="application/json",
                        safe=False)


@csrf_exempt
def export_clutches(request):
    csv_separator = json.loads(request.body)['csvSeparator'].lower()
    file_name = 'Cichild_database__clutches__' + str(datetime.datetime.now()).split('.')[0] + '.csv'
    file_path = os.path.join(settings.MEDIA_ROOT, 'clutches_csv_files', file_name)

    Clutch.export_clutches_as_csv(file_path, csv_separator)

    file_url = os.path.join(settings.MEDIA_URL, file_path.split('media/')[1])
    return JsonResponse(
        {
            'success': True,
            'filePath': file_url,
            'fileName': file_name},
        content_type="application/json", safe=False)


@csrf_exempt
def create_new_name_character(request):
    new_char = json.loads(request.body)['newChar']
    success = FishNameCharacter.create_new_name_character(new_char)

    return JsonResponse({'success': success,
                         'free_fish_name': serialize_as_list(FishName.get_free_names())
                         }, content_type="application/json", safe=False)


# Tests
def print_active_tanks():
    gold_system = TankSystem.objects.get(pk=1)
    silver_system = TankSystem.objects.get(pk=2)

    print('Golden System')
    for tank in Tank.objects.filter(system=gold_system):
        print(tank.__str__())

    print('Silver System')
    for tank in Tank.objects.filter(system=silver_system):
        print(tank.__str__())
