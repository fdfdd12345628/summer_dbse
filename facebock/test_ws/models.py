from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime

'''class Notification_test(models.Model):
    content = models.CharField(max_length=1000)
    date = models.DateTimeField()
    seen = models.BooleanField()
'''


class Notification_2_test(models.Model):
    content = models.CharField(max_length=1000)
    date = models.DateTimeField()
    seen = models.BooleanField()
