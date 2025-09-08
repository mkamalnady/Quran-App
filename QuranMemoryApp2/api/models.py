# D:\QuranMemoryApp2\api\models.py

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Surah(models.Model):
    number = models.IntegerField(primary_key=True, unique=True)
    name = models.CharField(max_length=100)
    total_verses = models.IntegerField()
    type = models.CharField(max_length=10)

    def __str__(self):
        return self.name


class Memorization(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memorizations")
    surah = models.ForeignKey(Surah, on_delete=models.CASCADE)
    start_ayah = models.IntegerField()
    end_ayah = models.IntegerField()

    # --- الحقول الجديدة لنظام المراجعة / تتبع ---
    last_review_date = models.DateTimeField(null=True, blank=True)
    review_history = models.JSONField(default=list, blank=True)

    # تواريخ إنشاء/تحديث
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'surah')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.surah.name}"

    @property
    def progress_percent(self):
        """نسبة الحفظ"""
        try:
            total = int(self.surah.total_verses) if self.surah and self.surah.total_verses else 0
            if total <= 0:
                return 0.0
            memorized = (int(self.end_ayah) - int(self.start_ayah)) + 1
            memorized = max(0, min(memorized, total))
            percent = (memorized / total) * 100
            return round(percent, 2)
        except Exception:
            return 0.0

    @property
    def memorized_count(self):
        """عدد الآيات المحفوظة فعليًا"""
        try:
            return max(0, min(int(self.end_ayah) - int(self.start_ayah) + 1, int(self.surah.total_verses)))
        except Exception:
            return 0

    @property
    def is_complete(self):
        """هل السورة مكتملة؟"""
        try:
            return int(self.end_ayah) >= int(self.surah.total_verses)
        except Exception:
            return False

    @property
    def status(self):
        """حالة السورة"""
        if self.is_complete:
            return "completed"
        if self.memorized_count > 0:
            return "in_progress"
        return "not_started"

    def add_log(self, start_ayah: int, end_ayah: int, action: str = "update", note: str = ""):
        """إضافة سجل جديد وربطه بالمراجعة"""
        log = MemorizationLog.objects.create(
            memorization=self,
            start_ayah=start_ayah,
            end_ayah=end_ayah,
            action=action,
            note=note,
            timestamp=timezone.now()
        )
        entry = {
            "action": action,
            "start_ayah": int(start_ayah),
            "end_ayah": int(end_ayah),
            "timestamp": log.timestamp.isoformat(),
            "note": note,
        }
        hist = list(self.review_history or [])
        hist.append(entry)
        self.review_history = hist
        self.last_review_date = log.timestamp
        self.save(update_fields=['review_history', 'last_review_date', 'updated_at'])
        return log

    def get_logs(self):
        """إرجاع جميع السجلات"""
        return self.logs.all()


class MemorizationLog(models.Model):
    """سجل كل تغيير/مراجعة"""
    ACTION_CHOICES = [
        ('create', 'create'),
        ('update', 'update'),
        ('review', 'review'),
        ('complete', 'complete'),
        ('other', 'other'),
    ]

    memorization = models.ForeignKey(Memorization, on_delete=models.CASCADE, related_name='logs')
    start_ayah = models.IntegerField()
    end_ayah = models.IntegerField()
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='update')
    note = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Memorization Log"
        verbose_name_plural = "Memorization Logs"

    def __str__(self):
        user = self.memorization.user.username if self.memorization and self.memorization.user else "—"
        surah = self.memorization.surah.name if self.memorization and self.memorization.surah else "—"
        ts = self.timestamp.strftime("%Y-%m-%d %H:%M")
        return f"{user} — {surah} [{self.start_ayah}-{self.end_ayah}] @ {ts}"
