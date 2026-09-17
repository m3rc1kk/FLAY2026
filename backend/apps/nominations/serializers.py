from rest_framework import serializers

from apps.nominations.models import Candidate, Nomination


class CandidateSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = ['id', 'name', 'photo']

    def get_photo(self, obj):
        return obj.photo.url if obj.photo else None


class NominationSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)

    class Meta:
        model = Nomination
        fields = ['id', 'title', 'description', 'candidates']
