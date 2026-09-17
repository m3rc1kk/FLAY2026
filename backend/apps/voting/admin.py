from django.contrib import admin

from apps.voting.models import Event, Vote, VotingSettings


@admin.register(VotingSettings)
class VotingSettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'starts_at', 'ends_at')

    def has_add_permission(self, request):
        return not VotingSettings.objects.exists()


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'nomination', 'candidate', 'created_at')
    list_filter = ('nomination',)
    list_select_related = ('user', 'nomination', 'candidate')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('user', 'kind', 'nomination', 'candidate', 'created_at')
    list_filter = ('kind',)
    list_select_related = ('user', 'nomination', 'candidate')
