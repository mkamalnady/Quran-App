// src/utils/dateUtils.js - أدوات التاريخ الهجري والميلادي

/**
 * أسماء الأشهر الهجرية بالعربية
 */
export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',   // يمكن تغييره لـ"ربيع الثاني" حسب الحاجة
  'جمادى الأولى',
  'جمادى الآخرة', // يمكن تغييره لـ"جمادى الثانية"
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
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
 * تحويل التاريخ الميلادي إلى هجري (تقريبي دقيق للشهور والأيام)
 */
export function gregorianToHijri(gregorianDate) {
  const gDate = new Date(gregorianDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const GREGORIAN_EPOCH = 1721425.5;
  const ISLAMIC_EPOCH = 1948439.5;
  const year = gDate.getFullYear();
  const month = gDate.getMonth();
  const day = gDate.getDate();

  function julianDay(year, month, day) {
    return (GREGORIAN_EPOCH - 1) +
      (365 * (year - 1)) +
      Math.floor((year - 1) / 4) -
      Math.floor((year - 1) / 100) +
      Math.floor((year - 1) / 400) +
      Math.floor(((367 * (month + 1)) - 362) / 12) +
      (month < 2 ? 0 : (isLeapGregorian(year) ? -1 : -2)) + day;
  }

  function isLeapGregorian(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  }

  const jd = julianDay(year, month, day);
  const days = jd - ISLAMIC_EPOCH;

  // حساب السنة الهجرية
  const hijriYear = Math.floor((30 * days + 10646) / 10631);

  // حساب بداية السنة الهجرية بالجوليان
  const yearStart = hijriToJulian(hijriYear, 1, 1);

  // أيام منذ بداية السنة الهجرية
  let daysIntoYear = jd - yearStart + 1;

  // حساب الشهر الهجري
  let hijriMonth = Math.ceil(daysIntoYear / 29.5);
  if (hijriMonth > 12) hijriMonth = 12;
  if (hijriMonth < 1) hijriMonth = 1;

  // حساب اليوم الهجري في الشهر
  let hijriDay = daysIntoYear - Math.floor((hijriMonth - 1) * 29.5);
  if (hijriDay < 1) hijriDay = 1;
  if (hijriDay > 30) hijriDay = 30;

  function hijriToJulian(year, month, day) {
    return (day +
      Math.ceil(29.5 * (month - 1)) +
      (year - 1) * 354 +
      Math.floor((3 + 11 * year) / 30) +
      ISLAMIC_EPOCH - 1);
  }

  return {
    year: hijriYear,
    month: hijriMonth,
    day: hijriDay
  };
}

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
  const hijriMonthName = HIJRI_MONTHS[hijri.month - 1];
  return `${hijri.day} ${hijriMonthName} ${hijri.year}هـ`;
}

/**
 * تنسيق الوقت بالعربية (ساعة:دقيقة)
 */
export function formatTime(date) {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * تنسيق التاريخ والوقت معاً
 */
export function formatDateTime(date) {
  return {
    gregorian: formatGregorianDate(date),
    hijri: formatHijriDate(date),
    time: formatTime(date),
    full: `${formatGregorianDate(date)} - ${formatTime(date)}`,
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
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60)) % 24;
  const diffMinutes = Math.floor(diffTime / (1000 * 60)) % 60;
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
