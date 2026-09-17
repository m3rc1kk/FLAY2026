from django.urls import path

from apps.voting import views

urlpatterns = [
    path('voting/', views.VotingSettingsView.as_view(), name='voting-settings'),
    path('votes/', views.VoteListView.as_view(), name='vote-list'),
    path('votes/<int:nomination_id>/', views.VoteDetailView.as_view(), name='vote-detail'),
]
