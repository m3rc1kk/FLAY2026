import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.auth.models import AllowedTelegramId

LINE = re.compile(r'^(?P<name>.*?)\s*(?P<id>\d{6,})\s*(?P<mark>\+?)\s*$')


class Command(BaseCommand):
    help = 'Adds Telegram IDs from a text file with lines like "Name 123456789 +" to the list of allowed voters.'

    def add_arguments(self, parser):
        parser.add_argument('path')
        parser.add_argument('--only-plus', action='store_true', help='Import only lines that end with a plus.')

    def handle(self, *args, **options):
        path = Path(options['path'])
        if not path.is_file():
            raise CommandError(f'File not found: {path}')

        added = 0
        skipped = 0
        for raw in path.read_text(encoding='utf-8').splitlines():
            match = LINE.match(raw.strip())
            if not match:
                if raw.strip():
                    self.stdout.write(self.style.WARNING(f'No ID: {raw.strip()}'))
                continue
            if options['only_plus'] and not match['mark']:
                skipped += 1
                continue

            entry, created = AllowedTelegramId.objects.get_or_create(
                telegram_id=int(match['id']),
                defaults={'name': match['name'].strip()},
            )
            if not created and not entry.name and match['name'].strip():
                entry.name = match['name'].strip()
                entry.save(update_fields=['name'])
            added += created
            self.stdout.write(f'{"+" if created else "="} {match["name"].strip()} {match["id"]}')

        self.stdout.write(self.style.SUCCESS(f'Added: {added}, skipped without plus: {skipped}'))
