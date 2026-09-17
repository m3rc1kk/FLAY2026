from datetime import timedelta

from rest_framework import serializers

from apps.auth.models import AllowedTelegramId, User
from apps.nominations.images import PhotoError, compress_photo
from apps.nominations.models import Candidate, Nomination
from apps.voting.models import Event, Vote, VotingSettings


class AdminCandidateSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Candidate
        fields = ['id', 'name', 'photo']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Name cannot be empty.')
        return value

    def validate_photo(self, value):
        if value is None:
            return value
        try:
            return compress_photo(value)
        except PhotoError as error:
            raise serializers.ValidationError(str(error))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['photo'] = instance.photo.url if instance.photo else None
        return data


class AdminVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'user', 'candidate', 'created_at']


class AdminNominationSerializer(serializers.ModelSerializer):
    candidates = AdminCandidateSerializer(many=True, read_only=True)
    votes = AdminVoteSerializer(many=True, read_only=True)

    class Meta:
        model = Nomination
        fields = ['id', 'title', 'description', 'candidates', 'votes']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Title cannot be empty.')
        return value


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=True)


class AdminUserSerializer(serializers.ModelSerializer):
    is_allowed = serializers.BooleanField(source='allowed', read_only=True)
    revokes = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'telegram_id', 'first_name', 'last_name', 'telegram_username', 'photo_url',
            'date_joined', 'last_seen', 'is_superuser', 'is_banned', 'ban_reason', 'banned_at',
            'is_allowed', 'revokes',
        ]
        read_only_fields = fields


class BanSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=255)
    with_votes = serializers.BooleanField(default=False)


class AdminEventSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    nomination_title = serializers.CharField(source='nomination.title', default=None, read_only=True)
    candidate_name = serializers.CharField(source='candidate.name', default=None, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'kind', 'user', 'user_name', 'nomination', 'nomination_title', 'candidate_name', 'details', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class AdminVotingSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)

    class Meta:
        model = VotingSettings
        fields = ['starts_at', 'ends_at', 'status']

    def validate(self, attrs):
        starts_at = attrs.get('starts_at', self.instance.starts_at if self.instance else None)
        ends_at = attrs.get('ends_at', self.instance.ends_at if self.instance else None)
        if starts_at and ends_at and ends_at - starts_at < timedelta(hours=1):
            raise serializers.ValidationError('Voting must last at least one hour.')
        return attrs


class AllowedTelegramIdSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = AllowedTelegramId
        fields = ['id', 'telegram_id', 'name', 'created_at', 'user']
        read_only_fields = ['created_at']

    def validate_name(self, value):
        return value.strip()

    def get_user(self, obj):
        user = self.context.get('users_by_telegram_id', {}).get(obj.telegram_id)
        if user is None:
            return None
        return {'id': user.id, 'name': user.get_full_name() or user.username}
