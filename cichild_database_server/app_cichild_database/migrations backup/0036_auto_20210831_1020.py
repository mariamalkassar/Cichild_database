# Generated by Django 3.1.2 on 2021-08-31 10:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0035_action_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='action',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
