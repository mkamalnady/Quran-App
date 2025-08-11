# D:\QuranMemoryApp2\api\models.py (النسخة النهائية المطورة)

from django.db import models
from django.contrib.auth.models import User

class Surah(models.Model):
    number = models.IntegerField(primary_key=True, unique=True)
    name = models.CharField(max_length=100)
    total_verses = models.IntegerField()
    type = models.CharField(max_length=10)

    def __str__(self):
        return self.name

class Memorization(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    surah = models.ForeignKey(Surah, on_delete=models.CASCADE)
    start_ayah = models.IntegerField()
    end_ayah = models.IntegerField()
    
    # --- الحقول الجديدة لنظام المراجعة ---
    last_review_date = models.DateTimeField(null=True, blank=True)
    review_history = models.JSONField(default=list, blank=True)

    class Meta:
        unique_together = ('user', 'surah')

    def __str__(self):
        return f"{self.user.username} - {self.surah.name}"
