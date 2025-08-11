# api/serializers.py (النسخة الكاملة والنهائية)

from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth.models import User
from .models import Surah, Memorization

# --- المترجم الجديد لعرض قائمة المستخدمين للمشرفين ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']

# --- المترجم الخاص بعرض السور (مع كل الحقول المطلوبة) ---
class SurahSerializer(serializers.ModelSerializer):
    class Meta:
        model = Surah
        fields = ['number', 'name', 'total_verses', 'type']

# --- المترجم الخاص بعرض سجلات الحفظ (مع إضافة حقول المراجعة) ---
class MemorizationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    surah_name = serializers.ReadOnlyField(source='surah.name')

    class Meta:
        model = Memorization
        fields = ['id', 'user', 'surah', 'surah_name', 'start_ayah', 'end_ayah', 'last_review_date', 'review_history']

# --- "المُصلح" الذي قمنا بإنشائه سابقاً لمشكلة التسجيل ---
class CustomRegisterSerializer(RegisterSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._has_phone_field = False
