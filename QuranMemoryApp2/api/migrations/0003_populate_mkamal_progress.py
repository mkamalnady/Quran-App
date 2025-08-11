# api/migrations/xxxx_populate_mkamal_progress.py (النسخة النهائية والمصححة)

from django.db import migrations
# لا تقم باستيراد User من هنا، سنستخدم apps.get_model

def populate_data(apps, schema_editor):
    # هذه هي الطريقة الصحيحة للحصول على الموديلات داخل ملف الهجرة
    User = apps.get_model('auth', 'User')
    Surah = apps.get_model('api', 'Surah')
    Memorization = apps.get_model('api', 'Memorization')
    
    # ابحث عن المستخدم أو أنشئه إذا لم يكن موجوداً
    user_obj, created = User.objects.get_or_create(username='mkamal')
    if created:
        user_obj.set_password('a_strong_password_123') # استبدل بكلمة مرور قوية
        user_obj.save()

    # حذف أي سجلات حفظ قديمة لهذا المستخدم لضمان عدم التكرار
    # الآن نحن نستخدم كائن المستخدم الصحيح (user_obj)
    Memorization.objects.filter(user=user_obj).delete()
    
    # تسجيل الحفظ للسور من 25 إلى 114
    for i in range(25, 115):
        try:
            surah_obj = Surah.objects.get(number=i)
            Memorization.objects.create(
                user=user_obj,
                surah=surah_obj,
                start_ayah=1,
                end_ayah=surah_obj.total_verses # تم حفظ السورة كاملة
            )
        except Surah.DoesNotExist:
            # هذا السطر سيتجاهل أي سور غير موجودة (للأمان)
            print(f"Warning: Surah with number {i} not found. Skipping.")

class Migration(migrations.Migration):

    dependencies = [
        # تأكد من أن هذا هو اسم ملف الهجرة الذي يضيف السور
        ('api', '0002_populate_surahs'), 
    ]

    operations = [
        migrations.RunPython(populate_data),
    ]
