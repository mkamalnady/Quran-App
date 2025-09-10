# api/migrations/0003_populate_mkamal_progress.py

from django.db import migrations
from django.contrib.auth.hashers import make_password

def populate_data(apps, schema_editor):
    # الحصول على الموديلات من apps.get_model
    User = apps.get_model('auth', 'User')
    Surah = apps.get_model('api', 'Surah')
    Memorization = apps.get_model('api', 'Memorization')
    
    # ابحث عن المستخدم أو أنشئه إذا لم يكن موجوداً
    user_obj, created = User.objects.get_or_create(username='mkamal')
    if created:
        # تخزين الباسوورد مشفرًا بدون استخدام set_password
        user_obj.password = make_password('a_strong_password_123')  # استبدل بكلمة مرور قوية
        user_obj.save()

    # حذف أي سجلات حفظ قديمة لهذا المستخدم لضمان عدم التكرار
    Memorization.objects.filter(user=user_obj).delete()
    
    # تسجيل الحفظ للسور من 25 إلى 114
    for i in range(25, 115):
        try:
            surah_obj = Surah.objects.get(number=i)
            Memorization.objects.create(
                user=user_obj,
                surah=surah_obj,
                start_ayah=1,
                end_ayah=surah_obj.total_verses  # تم حفظ السورة كاملة
            )
        except Surah.DoesNotExist:
            print(f"Warning: Surah with number {i} not found. Skipping.")

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_populate_surahs'),  # تأكد من صحة اسم الهجرة السابقة
    ]

    operations = [
        migrations.RunPython(populate_data),
    ]
