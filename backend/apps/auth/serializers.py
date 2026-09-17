from django.conf import settings
from rest_framework import serializers

from apps.auth.models import User
from apps.auth.telegram import is_fresh, remember_hash, verify_telegram_login
from apps.voting.models import Event


class UserSerializer(serializers.ModelSerializer):
    is_allowed = serializers.BooleanField(read_only=True)
    vote_restriction = serializers.CharField(read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'telegram_id', 'first_name', 'last_name', 'telegram_username', 'photo_url',
            'is_superuser', 'is_banned', 'is_allowed', 'vote_restriction',
        ]
        read_only_fields = fields


class TelegramAuthSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, default='')
    username = serializers.CharField(max_length=32, allow_blank=True, default='')
    photo_url = serializers.URLField(max_length=500, allow_blank=True, default='')
    auth_date = serializers.IntegerField()
    hash = serializers.CharField(max_length=64)

    def validate(self, attrs):
        if not settings.TELEGRAM_BOT_TOKEN:
            raise serializers.ValidationError('Telegram auth is not configured.')
        if not verify_telegram_login(self.initial_data, settings.TELEGRAM_BOT_TOKEN):
            raise serializers.ValidationError('Invalid Telegram authorization.')
        if not is_fresh(attrs['auth_date'], settings.TELEGRAM_AUTH_MAX_AGE):
            raise serializers.ValidationError('Telegram authorization has expired.')
        if not remember_hash(attrs['hash'], settings.TELEGRAM_AUTH_MAX_AGE):
            raise serializers.ValidationError('This Telegram authorization has already been used.')
        return attrs

    def save(self):
        data = self.validated_data
        user, created = User.objects.get_or_create(
            telegram_id=data['id'],
            defaults={'username': f'tg_{data["id"]}'},
        )
        if created:
            user.set_unusable_password()

        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.telegram_username = data['username']
        user.photo_url = data['photo_url']
        user.save()

        if created:
            Event.objects.create(user=user, kind=Event.Kind.FIRST_LOGIN)
        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
