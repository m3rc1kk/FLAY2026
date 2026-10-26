import json
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Max

from apps.nominations.images import PHOTO_EXTENSIONS, PhotoError, compress_photo
from apps.nominations.models import Candidate, Nomination


def normalize(name):
    return ' '.join(name.upper().replace('Ё', 'Е').split())


class Command(BaseCommand):
    help = 'Imports nominations and candidates from a JSON file and a folder with photos.'

    def add_arguments(self, parser):
        parser.add_argument('spec', help='JSON file: {"Nomination": ["Name", {"name": "Name", "photo": "File stem"}]}')
        parser.add_argument('--photos', help='Folder with photos. Defaults to the folder of the JSON file.')

    def handle(self, *args, **options):
        spec_path = Path(options['spec'])
        if not spec_path.is_file():
            raise CommandError(f'File not found: {spec_path}')

        spec = json.loads(spec_path.read_text(encoding='utf-8'))
        photos = self.index_photos(Path(options['photos'] or spec_path.parent))

        with transaction.atomic():
            for title, candidates in spec.items():
                self.import_nomination(title, candidates, photos)

    def index_photos(self, folder):
        if not folder.is_dir():
            raise CommandError(f'Folder not found: {folder}')
        return {
            normalize(path.stem): path
            for path in folder.rglob('*')
            if path.is_file() and path.suffix.lower().lstrip('.') in PHOTO_EXTENSIONS
        }

    def import_nomination(self, title, candidates, photos):
        nomination = Nomination.objects.filter(title__iexact=title).first()
        if nomination is None:
            last_order = Nomination.objects.aggregate(value=Max('order'))['value']
            nomination = Nomination.objects.create(title=title, order=0 if last_order is None else last_order + 1)
            self.stdout.write(self.style.SUCCESS(f'+ {title}'))
        else:
            self.stdout.write(title)

        for order, item in enumerate(candidates):
            name, photo_name = (item, item) if isinstance(item, str) else (item['name'], item.get('photo', item['name']))
            candidate = Candidate.objects.filter(nomination=nomination, name__iexact=name).first()
            created = candidate is None
            if created:
                candidate = Candidate(nomination=nomination, name=name)
            candidate.order = order

            status = 'photo kept' if candidate.photo else 'no photo'
            path = photos.get(normalize(photo_name))
            if not candidate.photo and path is not None:
                try:
                    candidate.photo = compress_photo(ContentFile(path.read_bytes(), name=path.name))
                    status = 'photo added'
                except PhotoError as error:
                    status = f'photo error: {error}'

            candidate.save()
            line = f'    {"+" if created else "="} {name} ({status})'
            self.stdout.write(self.style.WARNING(line) if status == 'no photo' or status.startswith('photo error') else line)
