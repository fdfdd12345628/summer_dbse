# Generated by Django 2.2.2 on 2019-07-20 05:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_user_sign_count'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='sign_count',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
