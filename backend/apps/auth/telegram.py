import hashlib
import hmac


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
