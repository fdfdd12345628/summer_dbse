# Generated by Django 2.2.2 on 2019-07-09 09:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='sign_count',
        ),
    ]