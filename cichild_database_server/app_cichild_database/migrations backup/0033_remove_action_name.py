# Generated by Django 3.1.2 on 2021-08-31 09:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0032_action_actiontype_changetankfragmentspecie_clutchaction_commentaction_fishaction_fishactionmove_merg'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='action',
            name='name',
        ),
    ]