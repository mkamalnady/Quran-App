// src/utils/videoPaths.js
// روابط فيديوهات تلاوة الشيخ محمود خليل الحصري لكل سورة
// مع إمكانية الحفظ في الكاش

// قائمة روابط الفيديوهات لتلاوات الشيخ الحصري من YouTube
const SURAH_VIDEO_URLS = {
  1: "https://www.youtube.com/watch?v=V8AC2AKG1_M", // الفاتحة
  2: "https://www.youtube.com/watch?v=VnHNLNGwVIo", // البقرة
  3: "https://www.youtube.com/watch?v=zq5jGPv74kg", // آل عمران
  4: "https://www.youtube.com/watch?v=XJSpZgZkf0g", // النساء
  5: "https://www.youtube.com/watch?v=SYwZIM98hSw", // المائدة
  6: "https://www.youtube.com/watch?v=O9tVu9wbpEw", // الأنعام
  7: "https://www.youtube.com/watch?v=CYrfojq1VF0", // الأعراف
  8: "https://www.youtube.com/watch?v=ZqHmRaFyhbo", // الأنفال
  9: "https://www.youtube.com/watch?v=vqXZKUGXRIY", // التوبة
  10: "https://www.youtube.com/watch?v=8yQnBxZFSs8", // يونس
  11: "https://www.youtube.com/watch?v=7g0I3870q9U", // هود
  12: "https://www.youtube.com/watch?v=TW9R9NZyvOM", // يوسف
  13: "https://www.youtube.com/watch?v=GtDribsnP08", // الرعد
  14: "https://www.youtube.com/watch?v=IuBTcTRGR4g", // إبراهيم
  15: "https://www.youtube.com/watch?v=wkXEJ2xPRp4", // الحجر
  16: "https://www.youtube.com/watch?v=789ngQiTZfI", // النحل
  17: "https://www.youtube.com/watch?v=QpKD5RChtNY", // الإسراء
  18: "https://www.youtube.com/watch?v=arMs4hyn1SM", // الكهف
  19: "https://www.youtube.com/watch?v=vgoc0pgD0aw", // مريم
  20: "https://www.youtube.com/watch?v=i1L_-Uwzeeg", // طه
  21: "https://www.youtube.com/watch?v=mtdihSYS0-E", // الأنبياء
  22: "https://www.youtube.com/watch?v=a1JquhTYnhc", // الحج
  23: "https://www.youtube.com/watch?v=hJWg6-1t0dY", // المؤمنون
  24: "https://www.youtube.com/watch?v=lzYuXsftgTM", // النور
  25: "https://www.youtube.com/watch?v=rXz3BihSyWI", // الفرقان
  26: "https://www.youtube.com/watch?v=4QtPvwOIwHw", // الشعراء
  27: "https://www.youtube.com/watch?v=PBal84ZXDrM", // النمل
  28: "https://www.youtube.com/watch?v=6ADLmfwNvWA", // القصص
  29: "https://www.youtube.com/watch?v=kl8_5-Y232w", // العنكبوت
  30: "https://www.youtube.com/watch?v=ZbaQ2bD5qg0", // الروم
  31: "https://www.youtube.com/watch?v=4RH3CDP40JQ", // لقمان
  32: "https://www.youtube.com/watch?v=IRIfRqXLmPg", // السجدة
  33: "https://www.youtube.com/watch?v=unJOmDCRCY0", // الأحزاب
  34: "https://www.youtube.com/watch?v=aiXJF7YsxKE", // سبأ
  35: "https://www.youtube.com/watch?v=2IMOPuyqEU4", // فاطر
  36: "https://www.youtube.com/watch?v=MXrDDQTEs1U", // يس
  37: "https://www.youtube.com/watch?v=rk6huJTNsU4", // الصافات
  38: "https://www.youtube.com/watch?v=Re-WX66-MD8", // ص
  39: "https://www.youtube.com/watch?v=C3A9DbM8NFo", // الزمر
  40: "https://www.youtube.com/watch?v=vw3HUgOy5K4", // غافر
  41: "https://www.youtube.com/watch?v=bHuy5TF4jxk", // فصلت
  42: "https://www.youtube.com/watch?v=itN2G2mXoDo", // الشورى
  43: "https://www.youtube.com/watch?v=d2xpycX49NA", // الزخرف
  44: "https://www.youtube.com/watch?v=iBRGaUvBFhs", // الدخان
  45: "https://www.youtube.com/watch?v=RMd9_hX6PXY", // الجاثية
  46: "https://www.youtube.com/watch?v=fAIEqnwbyPM", // الأحقاف
  47: "https://www.youtube.com/watch?v=LZDDYSvkTZc", // محمد
  48: "https://www.youtube.com/watch?v=KaqI3ybr2eg", // الفتح
  49: "https://www.youtube.com/watch?v=Ce6QKJo_7io", // الحجرات
  50: "https://www.youtube.com/watch?v=eB9bqRphetk", // ق
  51: "https://www.youtube.com/watch?v=UI6fLmutevo", // الذاريات
  52: "https://www.youtube.com/watch?v=jVYxs8uFC0s", // الطور
  53: "https://www.youtube.com/watch?v=K5eHkF_tDfQ", // النجم
  54: "https://www.youtube.com/watch?v=ikWlyTO3xgc", // القمر
  55: "https://www.youtube.com/watch?v=pY1CnusoQbo", // الرحمن
  56: "https://www.youtube.com/watch?v=pN-UnN85M-w", // الواقعة
  57: "https://www.youtube.com/watch?v=K9lMyhXX3tY", // الحديد
  58: "https://www.youtube.com/watch?v=lKDMxSpWES8", // المجادلة
  59: "https://www.youtube.com/watch?v=772rLWGnq-E", // الحشر
  60: "https://www.youtube.com/watch?v=z7DoposTHmc", // الممتحنة
  61: "https://www.youtube.com/watch?v=uvS9rx9Huh4", // الصف
  62: "https://www.youtube.com/watch?v=495ByFkh24w", // الجمعة
  63: "https://www.youtube.com/watch?v=EveWwCwht5o", // المنافقون
  64: "https://www.youtube.com/watch?v=fWAvBEhIzUo", // التغابن
  65: "https://www.youtube.com/watch?v=1AZR154qviQ", // الطلاق
  66: "https://www.youtube.com/watch?v=UYE7yPzM7IQ", // التحريم
  67: "https://www.youtube.com/watch?v=Gk_9ILIu-fE", // الملك
  68: "https://www.youtube.com/watch?v=1dA5cv66rUM", // القلم
  69: "https://www.youtube.com/watch?v=eG239GNlk_g", // الحاقة
  70: "https://www.youtube.com/watch?v=D3RIBP5fmSk", // المعارج
  71: "https://www.youtube.com/watch?v=eAZgY5OKmyU", // نوح
  72: "https://www.youtube.com/watch?v=Twvv3k3yiBU", // الجن
  73: "https://www.youtube.com/watch?v=VK2m2Itx4d4", // المزمل
  74: "https://www.youtube.com/watch?v=LKcZN2_bY2Y", // المدثر
  75: "https://www.youtube.com/watch?v=rXJE3CGtnjs", // القيامة
  76: "https://www.youtube.com/watch?v=hjt32Tlap9c", // الإنسان
  77: "https://www.youtube.com/watch?v=aIP0teEtu5M", // المرسلات
  78: "https://www.youtube.com/watch?v=xp6AYsmjMP4", // النبأ
  79: "https://www.youtube.com/watch?v=DFDfpHLwVqA", // النازعات
  80: "https://www.youtube.com/watch?v=Yc93rBngyzE", // عبس
  81: "https://www.youtube.com/watch?v=KS98jdrpz7Q", // التكوير
  82: "https://www.youtube.com/watch?v=u4mPwOxqySc", // الانفطار
  83: "https://www.youtube.com/watch?v=IQS0J3aAb6U", // المطففين
  84: "https://www.youtube.com/watch?v=_wgk3_ijn_Q", // الانشقاق
  85: "https://www.youtube.com/watch?v=CX1MqWlWoEc", // البروج
  86: "https://www.youtube.com/watch?v=7YYo4V-MTnA", // الطارق
  87: "https://www.youtube.com/watch?v=0FOMlU2cVWc", // الأعلى
  88: "https://www.youtube.com/watch?v=dDEqKID7ous", // الغاشية
  89: "https://www.youtube.com/watch?v=5OuOGAHRKR4", // الفجر
  90: "https://www.youtube.com/watch?v=VsB1hSLRJtE", // البلد
  91: "https://www.youtube.com/watch?v=lLNYI_tQjxk", // الشمس
  92: "https://www.youtube.com/watch?v=nkGm1IhUo4g", // الليل
  93: "https://www.youtube.com/watch?v=eBDPcfZYH7k", // الضحى
  94: "https://www.youtube.com/watch?v=HFQXGTzOkas", // الشرح
  95: "https://www.youtube.com/watch?v=IXh7wQ_90fw", // التين
  96: "https://www.youtube.com/watch?v=ThbAx1Gdnko", // العلق
  97: "https://www.youtube.com/watch?v=ejjJJke1v_8", // القدر
  98: "https://www.youtube.com/watch?v=CQLjGU2F2nQ", // البينة
  99: "https://www.youtube.com/watch?v=_Ink3rRk_Q4", // الزلزلة
  100: "https://www.youtube.com/watch?v=54GQtu6LGus", // العاديات
  101: "https://www.youtube.com/watch?v=w7VwQw53C-w", // القارعة
  102: "https://www.youtube.com/watch?v=XsDE8i3omN4", // التكاثر
  103: "https://www.youtube.com/watch?v=VVu1gxdAsMU", // العصر
  104: "https://www.youtube.com/watch?v=k3aHkgJKSLs", // الهمزة
  105: "https://www.youtube.com/watch?v=o2ylVkgVQMQ", // الفيل
  106: "https://www.youtube.com/watch?v=upSX_B1K6Vo", // قريش
  107: "https://www.youtube.com/watch?v=Vp2CNA8jKho", // الماعون
  108: "https://www.youtube.com/watch?v=8QGq8ppAI4Y", // الكوثر
  109: "https://www.youtube.com/watch?v=yKl8q1bu2Go", // الكافرون
  110: "https://www.youtube.com/watch?v=b8Nz3c2NqhA", // النصر
  111: "https://www.youtube.com/watch?v=mkfF0FRvg0E", // المسد
  112: "https://www.youtube.com/watch?v=Kw0Z4mJaaFU", // الإخلاص
  113: "https://www.youtube.com/watch?v=aa9e_CqQFak", // الفلق
  114: "https://www.youtube.com/watch?v=8dUoUOCVPJk"  // الناس
};

// الحصول على رابط فيديو السورة
export function getSurahVideoUrl(surahNumber) {
  return SURAH_VIDEO_URLS[surahNumber] || null;
}

// التحقق من وجود الفيديو في الكاش
export function isVideoDownloaded(surahNumber) {
  return localStorage.getItem(`surah_video_cached_${surahNumber}`) === 'true';
}

// حفظ الفيديو في الكاش (معلومات المشاهدة)
export function markVideoAsViewed(surahNumber, surahName) {
  localStorage.setItem(`surah_video_cached_${surahNumber}`, 'true');
  localStorage.setItem(`surah_video_name_${surahNumber}`, surahName);
  localStorage.setItem(`surah_video_last_viewed_${surahNumber}`, new Date().toISOString());
}

// الحصول على معلومات الفيديو من الكاش
export function getCachedVideoInfo(surahNumber) {
  return {
    isCached: isVideoDownloaded(surahNumber),
    name: localStorage.getItem(`surah_video_name_${surahNumber}`),
    lastViewed: localStorage.getItem(`surah_video_last_viewed_${surahNumber}`)
  };
}

// الحصول على آخر وقت مشاهدة للفيديو
export function getLastViewedTime(surahNumber) {
  return localStorage.getItem(`surah_video_last_viewed_${surahNumber}`);
}

// مسح معلومات المشاهدة للفيديوهات
export function clearVideoCache(surahNumber = null) {
  if (surahNumber) {
    localStorage.removeItem(`surah_video_cached_${surahNumber}`);
    localStorage.removeItem(`surah_video_name_${surahNumber}`);
    localStorage.removeItem(`surah_video_last_viewed_${surahNumber}`);
  } else {
    // مسح جميع معلومات المشاهدة
    for (let i = 1; i <= 114; i++) {
      localStorage.removeItem(`surah_video_cached_${i}`);
      localStorage.removeItem(`surah_video_name_${i}`);
      localStorage.removeItem(`surah_video_last_viewed_${i}`);
    }
  }
}

// إحصائيات المشاهدة
export function getViewingStats() {
  const stats = {
    totalViewed: 0,
    recentlyViewed: [],
    lastWeekViewed: 0
  };

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (let i = 1; i <= 114; i++) {
    if (isVideoDownloaded(i)) {
      stats.totalViewed++;
      
      const lastViewed = getLastViewedTime(i);
      const videoName = localStorage.getItem(`surah_video_name_${i}`);
      
      if (lastViewed) {
        const viewedDate = new Date(lastViewed);
        if (viewedDate > oneWeekAgo) {
          stats.lastWeekViewed++;
        }
        
        stats.recentlyViewed.push({
          surahNumber: i,
          surahName: videoName,
          lastViewed: viewedDate
        });
      }
    }
  }

  // ترتيب السور المشاهدة مؤخراً حسب التاريخ
  stats.recentlyViewed.sort((a, b) => b.lastViewed - a.lastViewed);
  stats.recentlyViewed = stats.recentlyViewed.slice(0, 10); // أحدث 10 فيديوهات

  return stats;
}

export default {
  getSurahVideoUrl,
  isVideoDownloaded,
  markVideoAsViewed,
  getCachedVideoInfo,
  getLastViewedTime,
  clearVideoCache,
  getViewingStats
};