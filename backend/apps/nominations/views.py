from rest_framework import generics, permissions

from apps.nominations.models import Nomination
from apps.nominations.serializers import NominationSerializer


class NominationListView(generics.ListAPIView):
    queryset = Nomination.objects.prefetch_related('candidates')
    serializer_class = NominationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
