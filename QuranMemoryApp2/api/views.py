# api/views.py (النسخة الكاملة والنهائية)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from .models import Surah, Memorization
from .serializers import SurahSerializer, MemorizationSerializer, UserSerializer

# --- بوابة API لعرض السور ---
class SurahViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows surahs to be viewed.
    """
    queryset = Surah.objects.all().order_by('number')
    serializer_class = SurahSerializer
    permission_classes = [IsAuthenticated]

# --- بوابة API لإدارة سجلات الحفظ ---
class MemorizationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows memorization records to be viewed or edited.
    """
    serializer_class = MemorizationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # كل مستخدم يرى سجلاته فقط
        return Memorization.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # عند إنشاء سجل جديد، نحفظه باسم المستخدم الحالي
        serializer.save(user=self.request.user)

# --- بوابة API الجديدة والآمنة للمشرفين فقط ---
class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for admins to view user list.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # يسمح للمشرفين فقط
