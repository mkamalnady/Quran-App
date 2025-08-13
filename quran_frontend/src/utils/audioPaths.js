// تحويل رقم السورة إلى 3 خانات
export function zeroPad(num, length = 3) {
  return String(num).padStart(length, "0");
}

// المصدر الأساسي: QuranicAudio — الحصري إذاعة
const QURANICAUDIO_BASE =
  "https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree_iza3a/";

// المصدر الاحتياطي: Internet Archive — الحصري مجوّد
const INTERNET_ARCHIVE_BASE =
  "https://archive.org/download/Alhusary_mjwd_128kbps/";

// رابط السورة من المصدر الأساسي
export function getPrimarySurahUrl(surahNumber) {
  return `${QURANICAUDIO_BASE}${zeroPad(surahNumber)}.mp3`;
}

// رابط السورة من المصدر الاحتياطي
export function getBackupSurahUrl(surahNumber) {
  return `${INTERNET_ARCHIVE_BASE}${zeroPad(surahNumber)}.mp3`;
}
