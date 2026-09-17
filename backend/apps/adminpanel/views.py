from django.db import transaction
from django.db.models import Count, Exists, F, Max, OuterRef, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.adminpanel.serializers import (
    AdminCandidateSerializer, AdminEventSerializer, AdminNominationSerializer, AdminUserSerializer,
    AdminVotingSerializer, AllowedTelegramIdSerializer, BanSerializer, ReorderSerializer,
)
from apps.auth.models import AllowedTelegramId, User
from apps.auth.permissions import IsSuperUser
from apps.nominations.models import Candidate, Nomination
from apps.voting.models import Event, Vote, VotingSettings


class AdminMixin:
    permission_classes = [IsSuperUser]
    pagination_class = None


def apply_order(queryset, ids):
    items = {item.id: item for item in queryset}
    if set(ids) != set(items) or len(ids) != len(items):
        return Response({'detail': 'The list of ids must contain every item exactly once.'}, status=status.HTTP_400_BAD_REQUEST)

    for position, item_id in enumerate(ids):
        items[item_id].order = position
    queryset.model.objects.bulk_update(items.values(), ['order'])
    return Response(status=status.HTTP_204_NO_CONTENT)


class NominationListView(AdminMixin, generics.ListCreateAPIView):
    queryset = Nomination.objects.prefetch_related('candidates', 'votes')
    serializer_class = AdminNominationSerializer

    def perform_create(self, serializer):
        last = Nomination.objects.aggregate(value=Max('order'))['value']
        serializer.save(order=0 if last is None else last + 1)


class NominationDetailView(AdminMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Nomination.objects.prefetch_related('candidates', 'votes')
    serializer_class = AdminNominationSerializer

    def perform_destroy(self, instance):
        for candidate in instance.candidates.all():
            candidate.photo.delete(save=False)
        instance.delete()


class NominationReorderView(AdminMixin, APIView):
    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return apply_order(Nomination.objects.all(), serializer.validated_data['ids'])


class CandidateCreateView(AdminMixin, generics.CreateAPIView):
    serializer_class = AdminCandidateSerializer

    def perform_create(self, serializer):
        nomination = get_object_or_404(Nomination, pk=self.kwargs['pk'])
        last = nomination.candidates.aggregate(value=Max('order'))['value']
        serializer.save(nomination=nomination, order=0 if last is None else last + 1)


class CandidateReorderView(AdminMixin, APIView):
    def post(self, request, pk):
        nomination = get_object_or_404(Nomination, pk=pk)
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return apply_order(nomination.candidates.all(), serializer.validated_data['ids'])


class CandidateDetailView(AdminMixin, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Candidate.objects.all()
    serializer_class = AdminCandidateSerializer

    def perform_update(self, serializer):
        old_photo = serializer.instance.photo.name
        candidate = serializer.save()
        if old_photo and 'photo' in serializer.validated_data and candidate.photo.name != old_photo:
            candidate.photo.storage.delete(old_photo)

    def perform_destroy(self, instance):
        instance.photo.delete(save=False)
        instance.delete()


class UserListView(AdminMixin, generics.ListAPIView):
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return (
            User.objects.filter(telegram_id__isnull=False)
            .annotate(
                revokes=Count('events', filter=Q(events__kind=Event.Kind.UNVOTE)),
                allowed=Exists(AllowedTelegramId.objects.filter(telegram_id=OuterRef('telegram_id'))),
            )
            .order_by(F('last_seen').desc(nulls_last=True))
        )


class UserEventListView(AdminMixin, generics.ListAPIView):
    serializer_class = AdminEventSerializer

    def get_queryset(self):
        return Event.objects.filter(user_id=self.kwargs['pk']).select_related('user', 'nomination', 'candidate')


class UserBanView(AdminMixin, APIView):
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = BanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data['reason'].strip()

        with transaction.atomic():
            user.is_banned = True
            user.ban_reason = reason
            user.banned_at = timezone.now()
            user.save(update_fields=['is_banned', 'ban_reason', 'banned_at'])
            if serializer.validated_data['with_votes']:
                user.votes.all().delete()
            Event.objects.create(user=user, kind=Event.Kind.BAN, details=reason)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserUnbanView(AdminMixin, APIView):
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        with transaction.atomic():
            user.is_banned = False
            user.ban_reason = ''
            user.banned_at = None
            user.save(update_fields=['is_banned', 'ban_reason', 'banned_at'])
            Event.objects.create(user=user, kind=Event.Kind.UNBAN)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserVotesView(AdminMixin, APIView):
    def delete(self, request, pk, nomination_id=None):
        user = get_object_or_404(User, pk=pk)
        votes = Vote.objects.filter(user=user)
        if nomination_id is not None:
            votes = votes.filter(nomination_id=nomination_id)
        votes.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventListView(AdminMixin, generics.ListAPIView):
    serializer_class = AdminEventSerializer

    def get_queryset(self):
        return Event.objects.select_related('user', 'nomination', 'candidate')[:30]


class VotingView(AdminMixin, generics.RetrieveUpdateAPIView):
    serializer_class = AdminVotingSerializer

    def get_object(self):
        return VotingSettings.load()


class AllowedTelegramIdListView(AdminMixin, generics.ListCreateAPIView):
    queryset = AllowedTelegramId.objects.order_by('-created_at')
    serializer_class = AllowedTelegramIdSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        users = User.objects.filter(telegram_id__isnull=False)
        context['users_by_telegram_id'] = {user.telegram_id: user for user in users}
        return context


class AllowedTelegramIdDetailView(AdminMixin, generics.DestroyAPIView):
    queryset = AllowedTelegramId.objects.all()
