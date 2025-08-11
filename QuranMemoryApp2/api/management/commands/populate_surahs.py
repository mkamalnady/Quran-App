import json
from django.core.management.base import BaseCommand
from api.models import Surah # استيراد نموذج السورة من تطبيق api
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Loads surahs from a JSON file into the database'

    def handle(self, *args, **options):
        # مسح البيانات القديمة لمنع التكرار عند إعادة التشغيل
        self.stdout.write(self.style.WARNING('Deleting old Surah data...'))
        Surah.objects.all().delete()
        
        # تحديد مسار ملف JSON
        file_path = os.path.join(settings.BASE_DIR, 'quran_data.json')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                surahs_data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found at {file_path}. Please create quran_data.json in the root directory.'))
            return

        self.stdout.write(self.style.SUCCESS('Starting to populate Surah data...'))

        for surah_data in surahs_data:
            surah, created = Surah.objects.get_or_create(
                number=surah_data['number'],
                defaults={
                    'name': surah_data['name'],
                    'english_name': surah_data['englishName'],
                    'revelation_type': surah_data['revelationType'],
                    'number_of_ayahs': surah_data['numberOfAyahs'],
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created Surah: {surah.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Surah already exists: {surah.name}'))

        self.stdout.write(self.style.SUCCESS('Database has been populated with all Surahs!'))

