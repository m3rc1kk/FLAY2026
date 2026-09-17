import hashlib
import hmac
import time
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.auth.models import TelegramAuthNonce


CLOCK_SKEW = 60


def verify_telegram_login(data, bot_token):
    received_hash = data.get('hash')
    if not received_hash or not bot_token:
        return False

    check_string = '\n'.join(
        f'{key}={value}'
        for key, value in sorted(data.items())
        if key != 'hash' and value is not None
    )
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    expected_hash = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_hash, str(received_hash))


def is_fresh(auth_date, max_age):
    age = time.time() - auth_date
    return -CLOCK_SKEW <= age <= max_age


def remember_hash(value, max_age):
    TelegramAuthNonce.objects.filter(created_at__lt=timezone.now() - timedelta(seconds=max_age + CLOCK_SKEW)).delete()
    try:
        with transaction.atomic():
            TelegramAuthNonce.objects.create(hash=value)
    except IntegrityError:
        return False
    return True
