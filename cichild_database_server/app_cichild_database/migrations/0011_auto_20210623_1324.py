# Generated by Django 3.1.2 on 2021-06-23 13:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0010_auto_20210623_1322'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fishlocationhistory',
            name='fish',
        ),
        migrations.AddField(
            model_name='fish',
            name='location_hsitory',
            field=models.ManyToManyField(to='app_cichild_database.FishLocationHistory'),
        ),
    ]
