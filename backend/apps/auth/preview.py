from django.conf import settings
from django.http import JsonResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


def is_preview_allowed(user):
    if not settings.PREVIEW_TELEGRAM_IDS:
        return True
    return bool(user and user.is_authenticated and user.telegram_id in settings.PREVIEW_TELEGRAM_IDS)


class PreviewMiddleware:
    open_prefixes = ('/api/v1/auth/',)

    def __init__(self, get_response):
        self.get_response = get_response
        self.authentication = JWTAuthentication()

    def __call__(self, request):
        if self.is_blocked(request):
            return JsonResponse({'detail': 'Site is closed.', 'code': 'preview_closed'}, status=403)
        return self.get_response(request)

    def is_blocked(self, request):
        if not settings.PREVIEW_TELEGRAM_IDS:
            return False
        if not request.path.startswith('/api/') or request.path.startswith(self.open_prefixes):
            return False

        try:
            result = self.authentication.authenticate(request)
        except AuthenticationFailed:
            return False

        return result is None or not is_preview_allowed(result[0])
