from django.urls import path

from apps.adminpanel import views

urlpatterns = [
    path('nominations/', views.NominationListView.as_view(), name='admin-nomination-list'),
    path('nominations/reorder/', views.NominationReorderView.as_view(), name='admin-nomination-reorder'),
    path('nominations/<int:pk>/', views.NominationDetailView.as_view(), name='admin-nomination-detail'),
    path('nominations/<int:pk>/candidates/', views.CandidateCreateView.as_view(), name='admin-candidate-create'),
    path('nominations/<int:pk>/candidates/reorder/', views.CandidateReorderView.as_view(), name='admin-candidate-reorder'),
    path('candidates/<int:pk>/', views.CandidateDetailView.as_view(), name='admin-candidate-detail'),
    path('users/', views.UserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/events/', views.UserEventListView.as_view(), name='admin-user-events'),
    path('users/<int:pk>/ban/', views.UserBanView.as_view(), name='admin-user-ban'),
    path('users/<int:pk>/unban/', views.UserUnbanView.as_view(), name='admin-user-unban'),
    path('users/<int:pk>/votes/', views.UserVotesView.as_view(), name='admin-user-votes'),
    path('users/<int:pk>/votes/<int:nomination_id>/', views.UserVotesView.as_view(), name='admin-user-vote'),
    path('events/', views.EventListView.as_view(), name='admin-event-list'),
    path('voting/', views.VotingView.as_view(), name='admin-voting'),
    path('allowed-ids/', views.AllowedTelegramIdListView.as_view(), name='admin-allowed-list'),
    path('allowed-ids/<int:pk>/', views.AllowedTelegramIdDetailView.as_view(), name='admin-allowed-detail'),
]
