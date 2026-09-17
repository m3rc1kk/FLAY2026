from django.contrib import admin

from apps.nominations.models import Candidate, Nomination


class CandidateInline(admin.TabularInline):
    model = Candidate
    extra = 1
    fields = ('name', 'photo', 'order')


@admin.register(Nomination)
class NominationAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'created_at')
    list_editable = ('order',)
    inlines = [CandidateInline]
