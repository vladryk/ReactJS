from __future__ import unicode_literals

from datetime import date
from django.utils import timezone

from django.db import models
from django.contrib.auth.models import User


class Expense(models.Model):
    date = models.DateField(default=date.today)
    time = models.TimeField(null=True, blank=True,
                            default=lambda: timezone.now().time())
    text = models.CharField(max_length=100, null=True, blank=True)
    cost = models.FloatField(default=0)
    user = models.ForeignKey(User)
