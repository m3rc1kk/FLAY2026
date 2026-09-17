from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.auth.urls')),
    path('api/v1/', include('apps.nominations.urls')),
    path('api/v1/', include('apps.voting.urls')),
    path('api/v1/admin/', include('apps.adminpanel.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
