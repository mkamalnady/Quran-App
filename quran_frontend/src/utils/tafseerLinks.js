// src/utils/tafseerLinks.js

/**
 * ترجّع رابط صفحة "التفسير الميسّر" (واجهة عربية) لسورة مُعيّنة على موقع Quran.com
 * تبدأ من الآية 1، كمصدر عربي بديل مؤقت لمختصر ابن كثير حتى يتوافر رابط عربي ثابت.
 *
 * @param {number|string} surahNumber - رقم السورة (1 إلى 114)
 * @returns {string} رابط صفحة التفسير (بالواجهة العربية)
 */
export function getIbnKathirShortUrl(surahNumber) {
  const n = Number(surahNumber);

  // التحقق من صحة الرقم
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    // رابط عام للتفسير الميسّر بالعربي
    return "https://quran.com/ar/tafsirs/ar-tafsir-muyassar";
  }

  // الصيغة: مثال لسورة الفاتحة:
  // https://quran.com/ar/1:1/tafsirs/ar-tafsir-muyassar
  return `https://quran.com/ar/${n}:1/tafsirs/ar-tafsir-muyassar`;
}
