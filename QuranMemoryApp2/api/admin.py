# D:\QuranMemoryApp2\api\admin.py (النسخة النهائية والمصححة)

from django.contrib import admin
from .models import Surah, Memorization

@admin.register(Surah)
class SurahAdmin(admin.ModelAdmin):
    # استخدام الأسماء الصحيحة من ملف models.py
    list_display = ('number', 'name', 'type', 'total_verses')
    list_filter = ('type',)
    search_fields = ('name',)

@admin.register(Memorization)
class MemorizationAdmin(admin.ModelAdmin):
    # استخدام الأسماء الصحيحة من ملف models.py
    list_display = ('user', 'surah', 'start_ayah', 'end_ayah')
    list_filter = ('user', 'surah')
    search_fields = ('user__username', 'surah__name')

