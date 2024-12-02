# Generated by Django 3.1.2 on 2021-06-23 13:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app_cichild_database', '0009_tankfragment_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='fishlocationhistory',
            name='location',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='app_cichild_database.tankfragment'),
        ),
        migrations.AddField(
            model_name='fishlocationhistory',
            name='move_out_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='fishlocationhistory',
            name='fish',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='app_cichild_database.fish'),
        ),
    ]