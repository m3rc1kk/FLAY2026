from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


LAST_SEEN_INTERVAL = timedelta(minutes=1)


class User(AbstractUser):
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True)
    telegram_username = models.CharField(max_length=32, blank=True)
    photo_url = models.URLField(max_length=500, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.CharField(max_length=255, blank=True)
    banned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['-last_seen'], name='user_last_seen_idx'),
        ]

    def __str__(self):
        name = self.get_full_name() or self.username
        return f'{name} ({self.telegram_id})' if self.telegram_id else name

    @property
    def is_allowed(self):
        if self.telegram_id is None:
            return False
        return AllowedTelegramId.objects.filter(telegram_id=self.telegram_id).exists()

    @property
    def vote_restriction(self):
        if self.is_banned:
            return 'banned'
        if not self.is_allowed:
            return 'not_allowed'
        return None

    def touch_last_seen(self):
        now = timezone.now()
        if self.last_seen and now - self.last_seen < LAST_SEEN_INTERVAL:
            return
        User.objects.filter(pk=self.pk).update(last_seen=now)
        self.last_seen = now


class AllowedTelegramId(models.Model):
    telegram_id = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name', 'telegram_id']
        verbose_name = 'allowed Telegram ID'
        verbose_name_plural = 'allowed Telegram IDs'

    def __str__(self):
        return f'{self.name} ({self.telegram_id})' if self.name else str(self.telegram_id)
