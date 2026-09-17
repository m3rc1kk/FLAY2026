from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.auth.models import AllowedTelegramId, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'telegram_id', 'first_name', 'last_name', 'telegram_username', 'is_banned', 'is_superuser', 'last_seen')
    list_filter = ('is_banned', 'is_superuser', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'telegram_username', 'telegram_id')
    ordering = ('-date_joined',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Telegram', {'fields': ('telegram_id', 'telegram_username', 'photo_url', 'last_seen')}),
        ('Ban', {'fields': ('is_banned', 'ban_reason', 'banned_at')}),
    )


@admin.register(AllowedTelegramId)
class AllowedTelegramIdAdmin(admin.ModelAdmin):
    list_display = ('telegram_id', 'name', 'created_at')
    search_fields = ('telegram_id', 'name')
