# Generated by Django 3.1.2 on 2021-09-08 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0037_auto_20210901_1615'),
    ]

    operations = [
        migrations.CreateModel(
            name='BackupManager',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_backup_date', models.DateField()),
            ],
        ),
    ]