from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.voting.models import Event, Vote, VotingSettings
from apps.voting.serializers import VoteSerializer, VotingSettingsSerializer


VOTE_ERRORS = {
    'banned': 'You are banned.',
    'not_allowed': 'Your Telegram ID is not in the allowed list.',
    'voting_closed': 'Voting is closed.',
    'already_voted': 'You have already voted in this nomination.',
}


def vote_error(code, status_code=status.HTTP_403_FORBIDDEN):
    return Response({'detail': VOTE_ERRORS[code], 'code': code}, status=status_code)


def check_can_vote(user):
    restriction = user.vote_restriction
    if restriction:
        return vote_error(restriction)
    if not VotingSettings.load().is_open:
        return vote_error('voting_closed')
    return None


class VotingSettingsView(generics.RetrieveAPIView):
    serializer_class = VotingSettingsSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return VotingSettings.load()


class VoteListView(generics.ListCreateAPIView):
    serializer_class = VoteSerializer
    pagination_class = None

    def get_queryset(self):
        return Vote.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        error = check_can_vote(request.user)
        if error:
            return error

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                vote = serializer.save(user=request.user)
        except IntegrityError:
            return vote_error('already_voted', status.HTTP_409_CONFLICT)

        Event.objects.create(user=request.user, kind=Event.Kind.VOTE, nomination=vote.nomination, candidate=vote.candidate)
        return Response(self.get_serializer(vote).data, status=status.HTTP_201_CREATED)


class VoteDetailView(generics.DestroyAPIView):
    def get_object(self):
        return get_object_or_404(Vote, user=self.request.user, nomination_id=self.kwargs['nomination_id'])

    def destroy(self, request, *args, **kwargs):
        error = check_can_vote(request.user)
        if error:
            return error

        vote = self.get_object()
        Event.objects.create(user=request.user, kind=Event.Kind.UNVOTE, nomination=vote.nomination, candidate=vote.candidate)
        vote.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
