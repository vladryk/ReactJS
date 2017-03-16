import django_filters
from rest_framework import filters
from models import Expense


class ExpenseFilter(filters.FilterSet):
    date = django_filters.DateRangeFilter(name='date')
    time = django_filters.TimeRangeFilter(name='time')
    text = django_filters.CharFilter(name='text')

    class Meta:
        model = Expense
        fields = ('date', 'time', 'text')
