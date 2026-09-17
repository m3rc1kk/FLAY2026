from django.urls import path

from apps.nominations import views

urlpatterns = [
    path('nominations/', views.NominationListView.as_view(), name='nomination-list'),
]
