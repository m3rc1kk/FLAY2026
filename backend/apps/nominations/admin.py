from django import forms
from django.contrib import admin

from apps.nominations.images import PhotoError, compress_photo
from apps.nominations.models import Candidate, Nomination


class CandidateForm(forms.ModelForm):
    class Meta:
        model = Candidate
        fields = '__all__'

    def clean_photo(self):
        photo = self.cleaned_data['photo']
        if not photo or photo == self.instance.photo:
            return photo
        try:
            return compress_photo(photo)
        except PhotoError as error:
            raise forms.ValidationError(str(error))


class CandidateInline(admin.TabularInline):
    model = Candidate
    form = CandidateForm
    extra = 1
    fields = ('name', 'photo', 'order')


@admin.register(Nomination)
class NominationAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'created_at')
    list_editable = ('order',)
    inlines = [CandidateInline]
