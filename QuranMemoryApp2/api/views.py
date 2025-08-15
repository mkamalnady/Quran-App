# api/views.py (النسخة الكاملة والنهائية)

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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
    
    def perform_update(self, serializer):
        # التأكد من أن المستخدم يحدث سجلاته فقط
        if serializer.instance.user != self.request.user:
            raise PermissionError("ليس لديك صلاحية لتعديل هذا السجل")
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """إضافة مراجعة لسجل الحفظ"""
        memorization = self.get_object()
        if memorization.user != request.user:
            return Response(
                {'error': 'ليس لديك صلاحية لمراجعة هذا السجل'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from datetime import datetime
        now = datetime.now()
        
        # إضافة المراجعة للتاريخ
        review_entry = {
            'date': now.isoformat(),
            'type': 'مراجعة',
            'surah_name': memorization.surah.name
        }
        
        if memorization.review_history:
            memorization.review_history.append(review_entry)
        else:
            memorization.review_history = [review_entry]
        
        memorization.last_review_date = now
        memorization.save()
        
        return Response({
            'message': 'تم تسجيل المراجعة بنجاح',
            'last_review_date': memorization.last_review_date,
            'review_count': len(memorization.review_history)
        })

# --- بوابة API الجديدة والآمنة للمشرفين فقط ---
class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for admins to view user list.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # يسمح للمشرفين فقط
