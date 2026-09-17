from rest_framework_simplejwt.authentication import JWTAuthentication


class ActivityJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            result[0].touch_last_seen()
        return result
