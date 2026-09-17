from django.conf import settings
from django.db import models
from django.utils import timezone


class VotingSettings(models.Model):
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'voting settings'
        verbose_name_plural = 'voting settings'

    def __str__(self):
        return f'Voting: {self.status}'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance

    @property
    def status(self):
        now = timezone.now()
        if not self.starts_at or not self.ends_at or now < self.starts_at:
            return 'upcoming'
        if now < self.ends_at:
            return 'active'
        return 'finished'

    @property
    def is_open(self):
        return self.status == 'active'


class Vote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='votes')
    nomination = models.ForeignKey('nominations.Nomination', on_delete=models.CASCADE, related_name='votes')
    candidate = models.ForeignKey('nominations.Candidate', on_delete=models.CASCADE, related_name='votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'nomination'], name='unique_vote_per_nomination'),
        ]

    def __str__(self):
        return f'{self.user} -> {self.candidate}'


class Event(models.Model):
    class Kind(models.TextChoices):
        VOTE = 'vote'
        UNVOTE = 'unvote'
        FIRST_LOGIN = 'first_login'
        BAN = 'ban'
        UNBAN = 'unban'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    kind = models.CharField(max_length=20, choices=Kind.choices)
    nomination = models.ForeignKey('nominations.Nomination', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    candidate = models.ForeignKey('nominations.Candidate', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    details = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at'], name='event_created_at_idx'),
            models.Index(fields=['user', 'kind'], name='event_user_kind_idx'),
        ]

    def __str__(self):
        return f'{self.user} {self.kind}'
