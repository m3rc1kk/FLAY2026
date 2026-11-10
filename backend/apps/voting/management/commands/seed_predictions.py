import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from apps.nominations.models import Nomination
from apps.voting.models import Prediction, Vote

PREFIX = 'seed_'
FIRST_TELEGRAM_ID = 9900000000
NAMES = [
    'Тест Первый', 'Тест Второй', 'Тест Третий', 'Тест Четвёртый', 'Тест Пятый',
    'Тест Шестой', 'Тест Седьмой', 'Тест Восьмой', 'Тест Девятый', 'Тест Десятый',
]


class Command(BaseCommand):
    help = 'Creates fake users with random predictions and votes for local testing. Use --clear to remove them.'

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=8)
        parser.add_argument('--clear', action='store_true')

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('This command works only with DEBUG=True.')

        User = get_user_model()
        deleted, _ = User.objects.filter(username__startswith=PREFIX).delete()
        if options['clear']:
            self.stdout.write(self.style.SUCCESS(f'Removed: {deleted}'))
            return

        nominations = list(Nomination.objects.prefetch_related('candidates'))
        for index in range(min(options['users'], len(NAMES))):
            first_name, last_name = NAMES[index].split()
            user = User.objects.create(username=f'{PREFIX}{index}', first_name=first_name, last_name=last_name, telegram_id=FIRST_TELEGRAM_ID + index)
            user.set_unusable_password()
            user.save(update_fields=['password'])

            for nomination in nominations:
                candidates = list(nomination.candidates.all())
                if not candidates:
                    continue
                favourites = candidates[:3]
                if random.random() < .85:
                    Prediction.objects.create(user=user, nomination=nomination, candidate=random.choice(favourites))
                if random.random() < .9:
                    Vote.objects.create(user=user, nomination=nomination, candidate=random.choice(favourites))

        self.stdout.write(self.style.SUCCESS(f'Fake users: {min(options["users"], len(NAMES))}'))
