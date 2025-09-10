# D:\QuranMemoryApp2\api\admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.db.models import F

from .models import Surah, Memorization, MemorizationLog


# ---------------------------
# فلتر مخصص للحالة (status)
# ---------------------------
class MemorizationStatusFilter(admin.SimpleListFilter):
    title = "status"
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (
            ("completed", "Completed"),
            ("in_progress", "In progress"),
            ("not_started", "Not started"),
        )

    def queryset(self, request, queryset):
        val = self.value()
        if not val:
            return queryset
        if val == "completed":
            return queryset.filter(end_ayah__gte=F("surah__total_verses"))
        if val == "in_progress":
            return queryset.filter(end_ayah__gte=F("start_ayah")).exclude(end_ayah__gte=F("surah__total_verses"))
        if val == "not_started":
            return queryset.filter(end_ayah__lt=F("start_ayah"))
        return queryset


# ===============================
# Inline للحفظ داخل صفحة اليوزر (عرض فقط)
# ===============================
class MemorizationInline(admin.TabularInline):
    model = Memorization
    extra = 0
    fields = ("surah", "start_ayah", "end_ayah", "progress_display", "status_display", "last_review_date")
    readonly_fields = ("surah", "start_ayah", "end_ayah", "progress_display", "status_display", "last_review_date")
    show_change_link = True     # يظهر أيقونة القلم لفتح صفحة التعديل
    can_delete = False

    ordering = ("surah__number",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("surah").order_by("surah__number")

    def progress_display(self, obj):
        try:
            percent = float(obj.progress_percent or 0.0)
        except Exception:
            percent = 0.0
        width = max(0, min(int(round(percent)), 100))
        percent_label = f"{percent:.1f}"
        # اختيار اللون بناءً على النسبة
        if percent >= 75:
            color = "#28a745"
        elif percent >= 50:
            color = "#ffc107"
        else:
            color = "#dc3545"
        # نمرّر أرقام/سلاسل فقط إلى format_html لتجنب خطأ تنسيق
        return format_html(
            '<div style="width:120px; border:1px solid #ccc; background:#f1f1f1; border-radius:4px; overflow:hidden;">'
            '<div style="width: {}%; background:{}; color:white; text-align:center; font-size:11px; '
            'border-radius:4px; line-height:16px;">{}</div></div>',
            width,
            color,
            percent_label
        )
    progress_display.short_description = "Progress"

    def status_display(self, obj):
        try:
            return obj.status or "-"
        except Exception:
            return "-"
    status_display.short_description = "Status"

    def last_review_date(self, obj):
        dt = getattr(obj, "last_review_date", None)
        if not dt:
            return "-"
        return dt.strftime("%Y-%m-%d %H:%M")
    last_review_date.short_description = "Last review"


    def has_add_permission(self, request, obj=None):
        # منع الإضافة من صفحة اليوزر — التعديل/إضافة يتم عبر صفحة الـ Memorization
        return False


# ===============================
# تخصيص UserAdmin (مع ال inline)
# ===============================
class CustomUserAdmin(UserAdmin):
    inlines = [MemorizationInline]

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "date_joined",
        "total_memorized",
        "in_progress_count",
        "overall_progress",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("is_active", "is_staff", "is_superuser", "date_joined")
    ordering = ("-date_joined",)

    fieldsets = (
        ("Account Info", {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    def total_memorized(self, obj):
        # عدد السور المكتملة
        return Memorization.objects.filter(user=obj, end_ayah__gte=F("surah__total_verses")).count()
    total_memorized.short_description = "Completed Surahs"

    def in_progress_count(self, obj):
        # عدد السور قيد الحفظ
        return (
            Memorization.objects.filter(user=obj, end_ayah__gte=F("start_ayah"))
            .exclude(end_ayah__gte=F("surah__total_verses"))
            .count()
        )
    in_progress_count.short_description = "In progress"

    def overall_progress(self, obj):
        mems = Memorization.objects.filter(user=obj).select_related("surah")
        if not mems.exists():
            return "-"
        total = 0.0
        count = 0
        for m in mems:
            try:
                total += float(m.progress_percent or 0.0)
                count += 1
            except Exception:
                continue
        if count == 0:
            return "-"
        avg = total / count
        avg_int = max(0, min(int(round(avg)), 100))
        avg_label = f"{avg:.1f}"
        return format_html(
            '<div style="width:120px; border:1px solid #ccc; border-radius:5px; display:inline-block; margin-right:6px;">'
            '<div style="width:{}%; background-color:#2196F3; height:12px; border-radius:5px;"></div>'
            '</div><span>{}</span>',
            avg_int,
            avg_label,
        )
    overall_progress.short_description = "Overall Progress"


# إعادة تسجيل UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ===============================
# Surah admin (مرتب حسب number)
# ===============================
@admin.register(Surah)
class SurahAdmin(admin.ModelAdmin):
    list_display = ("number", "name", "type", "total_verses")
    ordering = ("number",)
    list_filter = ("type",)
    search_fields = ("name",)


# ===============================
# Memorization admin (قائمة مستقلة أيضاً)
# ===============================
@admin.register(Memorization)
class MemorizationAdmin(admin.ModelAdmin):
    list_display = ("user", "surah", "start_ayah", "end_ayah", "progress_bar", "status_display", "last_review_date")
    list_filter = ("user", "surah", MemorizationStatusFilter)
    search_fields = ("user__username", "surah__name")

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related("surah", "user").order_by("surah__number")
        return qs

    def progress_bar(self, obj):
        try:
            percent = float(obj.progress_percent or 0.0)
        except Exception:
            percent = 0.0
        width = max(0, min(int(round(percent)), 100))
        percent_label = f"{percent:.1f}"
        memorized = getattr(obj, "memorized_count", None)
        total = getattr(obj.surah, "total_verses", None) if obj.surah else None
        # choose color
        if percent >= 75:
            color = "#28a745"
        elif percent >= 50:
            color = "#ffc107"
        else:
            color = "#dc3545"
        return format_html(
            '<div style="width:150px; border:1px solid #ccc; background:#f1f1f1; border-radius:4px; overflow:hidden;">'
            '<div style="width:{}%; background:{}; color:white; text-align:center; font-size:12px; '
            'border-radius:4px; line-height:18px;">{}% ({} / {})</div></div>',
            width,
            color,
            percent_label,
            memorized or "-",
            total or "-"
        )
    progress_bar.short_description = "Progress"

    def status_display(self, obj):
        try:
            return obj.status or "-"
        except Exception:
            return "-"
    status_display.short_description = "Status"

    def last_review_date(self, obj):
        dt = getattr(obj, "last_review_date", None)
        if not dt:
            return "-"
        return dt.strftime("%Y-%m-%d %H:%M")
    last_review_date.short_description = "Last review"


# ===============================
# MemorizationLog admin
# ===============================
@admin.register(MemorizationLog)
class MemorizationLogAdmin(admin.ModelAdmin):
    list_display = ("memorization", "action", "start_ayah", "end_ayah", "timestamp", "note")
    list_filter = ("action", "timestamp")
    search_fields = ("memorization__user__username", "memorization__surah__name", "note")


# ===============================
# إعدادات عامة للـ admin
# ===============================
admin.site.site_header = "Quran Memorization Admin"
admin.site.site_title = "Quran Admin"
admin.site.index_title = "Quran Admin Dashboard"
