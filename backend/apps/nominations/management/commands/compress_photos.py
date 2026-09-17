from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.nominations.images import PhotoError, compress_photo
from apps.nominations.models import Candidate


class Command(BaseCommand):
    help = 'Compresses candidate photos that were uploaded before automatic compression.'

    def handle(self, *args, **options):
        compressed = 0
        for candidate in Candidate.objects.exclude(photo=''):
            old_name = candidate.photo.name
            if old_name.lower().endswith('.webp'):
                continue

            storage = candidate.photo.storage
            if not storage.exists(old_name):
                self.stderr.write(f'Missing file: {old_name}')
                continue

            old_size = candidate.photo.size
            with candidate.photo.open('rb') as file:
                source = ContentFile(file.read(), name=Path(old_name).name)

            try:
                candidate.photo = compress_photo(source)
            except PhotoError as error:
                self.stderr.write(f'{candidate.name}: {error}')
                continue

            candidate.save(update_fields=['photo'])
            storage.delete(old_name)
            compressed += 1
            self.stdout.write(f'{candidate.name}: {old_size // 1024} KB -> {candidate.photo.size // 1024} KB')

        self.stdout.write(self.style.SUCCESS(f'Compressed: {compressed}'))
