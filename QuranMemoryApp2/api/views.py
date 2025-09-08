from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Count, Avg
from .models import Surah, Memorization
from .serializers import SurahSerializer, MemorizationSerializer, UserSerializer


# --- بوابة API لعرض السور ---
class SurahViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Surah.objects.all().order_by('number')
    serializer_class = SurahSerializer
    permission_classes = [IsAuthenticated]


# --- بوابة API لإدارة سجلات الحفظ ---
class MemorizationViewSet(viewsets.ModelViewSet):
    serializer_class = MemorizationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Memorization.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            return Response(
                {"error": "ليس لديك صلاحية لتعديل هذا السجل"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        memorization = self.get_object()
        if memorization.user != request.user:
            return Response(
                {'error': 'ليس لديك صلاحية لمراجعة هذا السجل'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from datetime import datetime
        now = datetime.now()
        
        review_entry = {
            'date': now.strftime('%Y-%m-%d %H:%M:%S'),
            'timestamp': now.isoformat(),
            'type': 'مراجعة',
            'surah_name': memorization.surah.name,
            'surah_number': memorization.surah.number,
            'user': request.user.username,
            'verses_reviewed': memorization.end_ayah,
            'total_verses': memorization.surah.total_verses,
            'completion_percentage': round((memorization.end_ayah / memorization.surah.total_verses) * 100, 1),
            'gregorian_date': now.strftime('%d %B %Y'),
            'arabic_date': now.strftime('%d %B %Y')
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
            'review_count': len(memorization.review_history),
            'review_entry': review_entry
        })


# --- بوابة API للمشرفين فقط ---
class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    # ✅ إضافة Dashboard Endpoint للمشرف
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        total_users = User.objects.count()
        total_memorizations = Memorization.objects.count()

        # متوسط نسبة الحفظ
        avg_completion = Memorization.objects.aggregate(
            avg_progress=Avg('end_ayah')
        )['avg_progress']

        # أكتر 5 مستخدمين نشطين
        top_users = (
            Memorization.objects.values('user__username')
            .annotate(records=Count('id'))
            .order_by('-records')[:5]
        )

        return Response({
            "total_users": total_users,
            "total_memorizations": total_memorizations,
            "average_completion": round(avg_completion, 1) if avg_completion else 0,
            "top_users": list(top_users)
        })
