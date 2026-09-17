from rest_framework import serializers

from apps.voting.models import Vote, VotingSettings


class VotingSettingsSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)

    class Meta:
        model = VotingSettings
        fields = ['starts_at', 'ends_at', 'status']


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['nomination', 'candidate', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        if attrs['candidate'].nomination_id != attrs['nomination'].id:
            raise serializers.ValidationError({'candidate': 'Candidate does not belong to this nomination.'})
        return attrs
