# Generated by Django 3.1.2 on 2021-06-21 13:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0003_specie'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clutch',
            name='comment',
        ),
        migrations.AddField(
            model_name='clutch',
            name='comment',
            field=models.ManyToManyField(to='app_cichild_database.Comment'),
        ),
        migrations.RemoveField(
            model_name='fish',
            name='comment',
        ),
        migrations.AddField(
            model_name='fish',
            name='comment',
            field=models.ManyToManyField(to='app_cichild_database.Comment'),
        ),
        migrations.RemoveField(
            model_name='tank',
            name='comment',
        ),
        migrations.AddField(
            model_name='tank',
            name='comment',
            field=models.ManyToManyField(to='app_cichild_database.Comment'),
        ),
        migrations.RemoveField(
            model_name='tankfragment',
            name='comment',
        ),
        migrations.AddField(
            model_name='tankfragment',
            name='comment',
            field=models.ManyToManyField(to='app_cichild_database.Comment'),
        ),
    ]
