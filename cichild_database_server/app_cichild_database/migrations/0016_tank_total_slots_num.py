# Generated by Django 3.1.2 on 2021-06-24 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0015_auto_20210624_0651'),
    ]

    operations = [
        migrations.AddField(
            model_name='tank',
            name='total_slots_num',
            field=models.IntegerField(blank=True, default=12, null=True),
        ),
    ]