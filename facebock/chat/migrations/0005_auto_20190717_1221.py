# Generated by Django 2.2.2 on 2019-07-17 04:21

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('chat', '0004_auto_20190717_1216'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification_2',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(max_length=1000)),
                ('date', models.DateTimeField()),
                ('seen', models.BooleanField()),
                ('from_user', models.ForeignKey(on_delete=None, related_name='notification_from_user_2',
                                                to=settings.AUTH_USER_MODEL)),
                ('to_user',
                 models.ForeignKey(on_delete=None, related_name='notification_to_user_2', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='Notification_test',
        ),
    ]
