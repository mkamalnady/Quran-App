# api/urls.py (النسخة الكاملة والمصححة)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SurahViewSet, MemorizationViewSet, AdminUserViewSet

router = DefaultRouter()
router.register(r'surahs', SurahViewSet)
router.register(r'memorization', MemorizationViewSet, basename='memorization')  # <-- إضافة basename
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('', include(router.urls)),
]
