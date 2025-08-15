# api/serializers.py (النسخة الكاملة والنهائية)

from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Surah, Memorization

# --- مترجم تسجيل الدخول المخصص للسماح بالإيميل ---
class CustomLoginSerializer(LoginSerializer):
    username = None
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(style={'input_type': 'password'})
    
    def authenticate(self, **kwargs):
        return authenticate(self.context['request'], **kwargs)
    
    def _validate_email(self, email, password):
        if email and password:
            # محاولة العثور على المستخدم بالإيميل
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
                raise serializers.ValidationError(msg)
            
            user = self.authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    msg = 'حساب المستخدم معطل.'
                    raise serializers.ValidationError(msg)
                return user
            else:
                msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
                raise serializers.ValidationError(msg)
        else:
            msg = 'يجب إدخال البريد الإلكتروني وكلمة المرور.'
            raise serializers.ValidationError(msg)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = self._validate_email(email, password)
        else:
            msg = 'يجب إدخال البريد الإلكتروني وكلمة المرور.'
            raise serializers.ValidationError(msg)
        
        attrs['user'] = user
        return attrs
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
    email = serializers.EmailField(required=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._has_phone_field = False
    
    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مستخدم بالفعل.")
        return email
    
    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("اسم المستخدم هذا مستخدم بالفعل.")
        return username
