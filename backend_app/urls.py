from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    url(r'^users/$', views.UserList.as_view()),
    url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
    url(r'^expenses/$', views.ExpensesList.as_view()),
    url(r'^expenses/(?P<pk>[0-9]+)/$', views.ExpensesDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)