# Generated by Django 3.1.2 on 2021-06-23 15:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0013_remove_fish_tank'),
    ]

    operations = [
        migrations.AddField(
            model_name='specie',
            name='color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
    ]
