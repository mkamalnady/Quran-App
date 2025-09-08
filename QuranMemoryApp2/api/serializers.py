from rest_framework import serializers
from dj_rest_auth.registration import serializers as reg_serializers
from dj_rest_auth.serializers import LoginSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Surah, Memorization


class CustomLoginSerializer(LoginSerializer):
    username = None
    email = serializers.EmailField(required=True)
    password = serializers.CharField(style={'input_type': 'password'})

    def authenticate(self, **kwargs):
        return authenticate(self.context['request'], **kwargs)

    def _validate_email(self, email, password):
        if email and password:
            try:
                user = User.objects.get(email__iexact=email)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError({"non_field_errors": ["البريد الإلكتروني أو كلمة المرور غير صحيحة."]})
            user = self.authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError({"non_field_errors": ["حساب المستخدم معطل."]})
                return user
            else:
                raise serializers.ValidationError({"non_field_errors": ["البريد الإلكتروني أو كلمة المرور غير صحيحة."]})
        raise serializers.ValidationError({"non_field_errors": ["يجب إدخال البريد الإلكتروني وكلمة المرور."]})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if not email or not password:
            raise serializers.ValidationError({"non_field_errors": ["يجب إدخال البريد الإلكتروني وكلمة المرور."]})
        user = self._validate_email(email, password)
        attrs['user'] = user
        return attrs


class SurahSerializer(serializers.ModelSerializer):
    class Meta:
        model = Surah
        fields = ['number', 'name', 'total_verses', 'type']


class MemorizationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    surah_name = serializers.ReadOnlyField(source='surah.name')
    progress_percent = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Memorization
        fields = [
            'id',
            'user',
            'surah',
            'surah_name',
            'start_ayah',
            'end_ayah',
            'last_review_date',
            'review_history',
            'progress_percent',
            'status',
        ]


class UserSerializer(serializers.ModelSerializer):
    # 🔹 حقول إضافية تفيد الداشبورد
    total_memorizations = serializers.SerializerMethodField()
    completed_memorizations = serializers.SerializerMethodField()
    in_progress_memorizations = serializers.SerializerMethodField()
    overall_progress = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'is_staff',
            'total_memorizations',
            'completed_memorizations',
            'in_progress_memorizations',
            'overall_progress',
        ]

    def get_total_memorizations(self, obj):
        return Memorization.objects.filter(user=obj).count()

    def get_completed_memorizations(self, obj):
        return Memorization.objects.filter(user=obj, status='completed').count()

    def get_in_progress_memorizations(self, obj):
        return Memorization.objects.filter(user=obj, status='in_progress').count()

    def get_overall_progress(self, obj):
        memos = Memorization.objects.filter(user=obj)
        if not memos.exists():
            return 0
        total = sum(m.progress_percent for m in memos)
        return round(total / memos.count(), 2)


class CustomRegisterSerializer(reg_serializers.RegisterSerializer):
    email = serializers.EmailField(required=True)

    @property
    def _has_phone_field(self):
        # لا يوجد حقل هاتف لذا نرجع False دائماً
        return False

    def validate_email(self, email):
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مستخدم بالفعل.")
        return email

    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("اسم المستخدم هذا مستخدم بالفعل.")
        return username
