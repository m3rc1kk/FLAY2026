from django.conf import settings
from rest_framework import serializers

from apps.voting.models import Prediction, Vote, VotingSettings


class VotingSettingsSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    predictions_enabled = serializers.SerializerMethodField()

    class Meta:
        model = VotingSettings
        fields = ['starts_at', 'ends_at', 'status', 'predictions_enabled']

    def get_predictions_enabled(self, obj):
        return settings.PREDICTIONS_ENABLED


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['nomination', 'candidate', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        if attrs['candidate'].nomination_id != attrs['nomination'].id:
            raise serializers.ValidationError({'candidate': 'Candidate does not belong to this nomination.'})
        return attrs


class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['nomination', 'candidate', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        if attrs['candidate'].nomination_id != attrs['nomination'].id:
            raise serializers.ValidationError({'candidate': 'Candidate does not belong to this nomination.'})
        return attrs
