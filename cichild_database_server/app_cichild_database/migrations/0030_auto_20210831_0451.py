# Generated by Django 3.1.2 on 2021-08-31 04:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0029_auto_20210831_0448'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clutch',
            name='female',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clutch_female', to='app_cichild_database.fish'),
        ),
        migrations.AlterField(
            model_name='clutch',
            name='male',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clutch_male', to='app_cichild_database.fish'),
        ),
    ]
