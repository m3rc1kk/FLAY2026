from django.conf import settings
from django.urls import path

from apps.auth import views

urlpatterns = [
    path('telegram/', views.TelegramAuthView.as_view(), name='auth-telegram'),
    path('token/refresh/', views.RefreshView.as_view(), name='auth-token-refresh'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('me/', views.MeView.as_view(), name='auth-me'),
]

if settings.TELEGRAM_DEV_AUTH:
    urlpatterns.append(
        path('telegram/dev/', views.DevTelegramAuthView.as_view(), name='auth-telegram-dev'),
    )
