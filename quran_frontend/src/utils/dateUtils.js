// src/utils/dateUtils.js - أدوات التاريخ الهجري والميلادي

/**
 * تحويل التاريخ الميلادي إلى هجري (تقريبي)
 */
export function gregorianToHijri(gregorianDate) {
  const gDate = new Date(gregorianDate);
  const gYear = gDate.getFullYear();
  const gMonth = gDate.getMonth() + 1;
  const gDay = gDate.getDate();
  
  // حساب عدد الأيام منذ بداية التقويم الميلادي
  const totalDays = Math.floor((gDate.getTime() - new Date(622, 6, 16).getTime()) / (1000 * 60 * 60 * 24));
  
  // حساب السنة الهجرية (354.37 يوم في السنة الهجرية)
  const hijriYear = Math.floor(totalDays / 354.37) + 1;
  
  // حساب الأيام المتبقية
  const remainingDays = totalDays % 354.37;
  
  // حساب الشهر الهجري (29.53 يوم في المتوسط)
  const hijriMonth = Math.floor(remainingDays / 29.53) + 1;
  
  // حساب اليوم الهجري
  const hijriDay = Math.floor(remainingDays % 29.53) + 1;
  
  return {
    year: Math.max(1, hijriYear),
    month: Math.min(12, Math.max(1, hijriMonth)),
    day: Math.min(30, Math.max(1, hijriDay))
  };
}

/**
 * أسماء الأشهر الهجرية
 */
export const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

/**
 * أسماء الأشهر الميلادية بالعربية
 */
export const GREGORIAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * أسماء أيام الأسبوع بالعربية
 */
export const WEEKDAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

/**
 * تنسيق التاريخ الميلادي بالعربية
 */
export function formatGregorianDate(date) {
  const d = new Date(date);
  const dayName = WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = GREGORIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  
  return `${dayName} ${day} ${month} ${year}م`;
}

/**
 * تنسيق التاريخ الهجري بالعربية
 */
export function formatHijriDate(date) {
  const hijri = gregorianToHijri(date);
  const month = HIJRI_MONTHS[hijri.month - 1];
  
  return `${hijri.day} ${month} ${hijri.year}هـ`;
}

/**
 * تنسيق الوقت بالعربية
 */
export function formatTime(date) {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * تنسيق التاريخ والوقت معاً
 */
export function formatDateTime(date) {
  return {
    gregorian: formatGregorianDate(date),
    hijri: formatHijriDate(date),
    time: formatTime(date),
    full: `${formatGregorianDate(date)} - ${formatTime(date)}`
  };
}

/**
 * الحصول على التاريخ الحالي بالتنسيقين
 */
export function getCurrentDate() {
  const now = new Date();
  return formatDateTime(now);
}

/**
 * تحويل التاريخ إلى نص قابل للقراءة (منذ كم يوم)
 */
export function getRelativeTime(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(now - targetDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) {
    return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
  } else if (diffHours > 0) {
    return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
  } else if (diffMinutes > 0) {
    return `منذ ${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  } else {
    return 'الآن';
  }
}