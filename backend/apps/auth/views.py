from django.contrib.auth.models import update_last_login
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.auth.serializers import (
    LogoutSerializer, TelegramAuthSerializer, UserSerializer,
)


def token_response(user):
    update_last_login(None, user)
    user.touch_last_seen()
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }, status=status.HTTP_200_OK)


class AuthThrottleMixin:
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'


class TelegramAuthView(AuthThrottleMixin, generics.GenericAPIView):
    serializer_class = TelegramAuthSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return token_response(serializer.save())


class RefreshView(AuthThrottleMixin, TokenRefreshView):
    pass


class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data['refresh'])
            if str(token['user_id']) != str(request.user.pk):
                raise TokenError('Token belongs to another user.')
            token.blacklist()
        except TokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
