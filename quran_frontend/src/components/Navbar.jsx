import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Navbar.jsx
 * - ملف واحد: أزرار (الصفحة الرئيسية، تسجيل الخروج)
 * - آية قرآنية متغيرة مع تأثير
 * - التاريخ الميلادي والهجري (يحاول جلب من aladhan API، وفيه بديل Intl)
 *
 * - نقلت هنا كامل كود الإعدادات (المنقول من DashboardPage)
 */

const VERSES = [
  "﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا ﴾ — الإسراء 9",
  "﴿ وَرَتِّلِ ٱلۡقُرۡءَانَ تَرۡتِيلًا ﴾ — المزمل 4",
  "﴿ إِنَّهُۥ لَقُرۡءَانٞ كَرِيمٞ ﴾ — الواقعة 77",
  "﴿ لَا يَمَسُّهُۥٓ إِلَّا ٱلۡمُطَهَّرُونَ ﴾ — الواقعة 79",
];

export default function Navbar() {
  const [verseIndex, setVerseIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [gregorian, setGregorian] = useState("");
  const [hijri, setHijri] = useState("");
  const navigate = useNavigate();
  const verseTimerRef = useRef(null);

  // أول حرفين من الاسم الحقيقي
  const [initials, setInitials] = useState("؟");
  const [showMenu, setShowMenu] = useState(false);



  useEffect(() => {
    const fullName = (localStorage.getItem("fullName") || "").trim();
    if (fullName) {
      const parts = fullName.split(/\s+/);
      const first = parts[0] && parts[0].length > 0 ? parts[0][0] : "";
      const second = parts[1] && parts[1].length > 0 ? parts[1][0] : "";
      const inits = (first + second) || first || "؟";
      setInitials(inits.toUpperCase());
    }
  }, []);

  // تبديل الآية مع تأثير fade
  useEffect(() => {
    verseTimerRef.current = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setVerseIndex((v) => (v + 1) % VERSES.length);
        setFadeIn(true);
      }, 300);
    }, 8000);

    return () => {
      clearInterval(verseTimerRef.current);
    };
  }, []);

  // جلب التاريخ الميلادي والهجري مع بدائل
  useEffect(() => {
    const updateDates = async () => {
      try {
        const today = new Date();
        const gOpts = { day: "numeric", month: "long", year: "numeric" };
        setGregorian(today.toLocaleDateString("ar-EG", gOpts));

        const isoDate = today.toISOString().slice(0, 10);
        const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${isoDate}`);
        if (res.ok) {
          const json = await res.json();
          const h = json && json.data && json.data.hijri && json.data.hijri.date;
          if (h) {
            setHijri(h);
            return;
          }
        }

        // إن لم ينجح: استخدام Intl
        try {
          const intl = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", gOpts);
          setHijri(intl.format(new Date()));
        } catch (e) {
          setHijri("—");
        }
      } catch (err) {
        try {
          const today = new Date();
          const gOpts = { day: "numeric", month: "long", year: "numeric" };
          const intl = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", gOpts);
          setGregorian(today.toLocaleDateString("ar-EG", gOpts));
          setHijri(intl.format(today));
        } catch (e) {
          setGregorian("—");
          setHijri("—");
        }
      }
    };

    updateDates();

    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const midnightTimeout = setTimeout(() => {
      updateDates();
      setInterval(updateDates, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(midnightTimeout);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    // اختياري: لا أمسح fullName تلقائياً، لو تحب أضيفه قلّي
    navigate("/");
  };

  const onEditProfile = () => {
    try {
      const editUrl = `${window.location.origin}/edit-profile`;
      window.open(editUrl, "_self");
    } catch (error) {
      window.location.href = "/edit-profile";
    }
  };

  const onChangePassword = () => {
    try {
      const changePassUrl = `${window.location.origin}/change-password`;
      window.open(changePassUrl, "_self");
    } catch (error) {
      window.location.href = "/change-password";
    }
  };

  // نقلت هنا من Dashboard: تصدير تقرير الحفظ — يجيب البيانات من الـ API ويصدر CSV (نفس منطق الداشبورد)
  const handleExportMemorizationReport = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Token ${token}` } : {};

      const [surahsRes, memosRes] = await Promise.all([
        fetch("https://quran-app-8ay9.onrender.com/api/surahs/", { headers }),
        fetch("https://quran-app-8ay9.onrender.com/api/memorization/", { headers }),
      ]);

      if (!surahsRes.ok || !memosRes.ok) {
        throw new Error("فشل جلب البيانات من الخادم");
      }

      const surahs = await surahsRes.json();
      const memorizations = await memosRes.json();

      const reportData = surahs.map((surah, index) => {
        const memo = memorizations.find((m) => m.surah === surah.number);
        const progressPercentage = memo
          ? ((memo.end_ayah / (surah.total_verses || 1)) * 100).toFixed(1)
          : "0";
        const reviewCount =
          (memo && memo.reviews && memo.reviews.length) ||
          (memo && memo.review_count) ||
          0;
        let statusText = "لم يبدأ";
        if (memo) {
          if (memo.end_ayah >= surah.total_verses) {
            statusText = "مُكتمل بحمد الله ✨";
          } else {
            statusText = `الآية ${memo.end_ayah} من ${surah.total_verses}`;
          }
        }
        return [
          index + 1,
          surah.number,
          surah.name,
          surah.type,
          surah.total_verses,
          memo ? memo.end_ayah : 0,
          `${progressPercentage}%`,
          reviewCount,
          statusText,
        ];
      });

      const headersCSV = [
        "التسلسل",
        "رقم السورة",
        "اسم السورة",
        "النوع",
        "عدد الآيات",
        "الآيات المحفوظة",
        "نسبة الإنجاز",
        "عدد المراجعات",
        "الحالة",
      ];

      const csvContent = [
        headersCSV.join(","),
        ...reportData.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
      const timeStr = `${now.getHours().toString().padStart(2, "0")}-${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const filename = `quran_memorization_report_${dateStr}_${timeStr}.csv`;

      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`تم تصدير تقرير الحفظ بنجاح! 📊\nالملف: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      alert("حدث خطأ أثناء تصدير التقرير. تأكد من أن السيرفر يعمل وصلة الانترنت جيدة.");
    }
  };

  return (
    <header role="banner" className="quran-navbar">
      <div className="nav-top">
        <div className="left">
          <Link to="/" className="btn home-btn" aria-label="الصفحة الرئيسية">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M12 3l8 7h-3v8h-4v-5H11v5H7v-8H4z" />
            </svg>
            <span className="btn-text">الصفحة الرئيسية</span>
          </Link>
        </div> 

        <div className="center" aria-hidden>
          <div className={`verse ${fadeIn ? "fade-in" : "fade-out"}`}>{VERSES[verseIndex]}</div>
        </div>

        <div className="right">
          <div className="dates">
            <div className="gregorian">📅 {gregorian || "—"}</div>
            <div className="hijri">🕌 {hijri || "—"}</div>
          </div>
<br></br>
          <div className="profile-wrapper"> 
            <button
              className="profile-circle"
              onClick={() => setShowMenu((p) => !p)}
              aria-label="الملف الشخصي"
              title="الملف الشخصي"
            >
              {initials}
            </button>

            {showMenu && (
              <div className="profile-menu" role="menu">
               

                {/* --- هنا قائمة الإعدادات المنقولة من Dashboard --- */}
                <div className="settings-panel" aria-label="الإعدادات السريعة">
                 

                  <div className="setting-item">
                    <button onClick={handleExportMemorizationReport}>📊 تصدير تقرير الحفظ</button>
                  </div>

                  <div className="setting-item">
                    <button onClick={onEditProfile}>👤 تعديل البيانات </button>
                  </div>

                  <div className="setting-item">
                    <button onClick={onChangePassword}>🔐 تغيير كلمة المرور</button>
                  </div>
                 
                 <div className="setting-item">
                                 <button onClick={handleLogout} className="menu-item">تسجيل الخروج </button>
                  </div>
               

                </div>
                {/* --- نهاية الإعدادات المنقولة --- */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ستايل داخلي — حفاظاً على التنسيق الأصلي */}
      <style>{`
        .quran-navbar {
          font-family: "Segoe UI", Tahoma, Arial, "Noto Naskh Arabic", sans-serif;
          direction: rtl;
          color: #fff;
          background: linear-gradient(90deg, #08331b 0%, #0b5a34 50%, #08331b 100%);
          box-shadow: 0 4px 18px rgba(2, 20, 10, 0.45);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .left, .center, .right {
          display: flex;
          align-items: center;
        }
        .left { flex: 0 0 auto; }
        .center { flex: 1 1 auto; justify-content: center; text-align: center; }
        .right { flex: 0 0 auto; gap: 12px; align-items: center; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 8px 12px;
          border-radius: 10px;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          transition: transform .14s ease, background .14s ease, box-shadow .14s ease;
          font-weight: 600;
        }
        .btn svg { opacity: .95; }
        .btn:hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); box-shadow: 0 8px 22px rgba(3,37,20,0.35); }

        .home-btn .btn-text,
        .logout-btn .btn-text { display:inline-block; }

        .verse {
          padding: 10px 18px;
          border-radius: 12px;
          max-width: 850px;
          font-size: 1.05rem;
          line-height: 1.45;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 6px 18px rgba(2, 20, 10, 0.25);
          backdrop-filter: blur(2px);
        }
        .fade-in { animation: fadeIn .45s ease both; }
        .fade-out { animation: fadeOut .28s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0);} to { opacity: 0; transform: translateY(-6px); } }

        .dates { text-align: right; font-size: 0.9rem; color: rgba(255,255,255,0.95); }
        .dates .gregorian, .dates .hijri { line-height: 1.1; }

        @media (max-width: 860px) {
          .btn-text { display: none; }
          .verse { font-size: 0.95rem; padding: 8px 12px; }
          .nav-top { padding: 10px 12px; }
        }
        @media (max-width: 480px) {
          .dates { display: none; }
        }

        /* Profile menu & settings (منقول من Dashboard بنفس التنسيق) */
        .profile-wrapper { position: relative; }
        .profile-circle {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #fff;
          color: #08331b;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.5);
          cursor: pointer;
          user-select: none;
        }
        .profile-menu {
          position: absolute;
          top: 48px;
          right: 0;
          background: #fff;
          color: #08331b;
          border-radius: 8px;
          box-shadow: 0 8px 22px rgba(3,37,20,0.25);
          min-width: 200px;
          overflow: hidden;
          z-index: 1000;
        }
        .menu-item {
          display: block;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          text-align: right;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap; /* يخلي "تسجيل الخروج" في سطر واحد */
        }
        .menu-item:hover { background: #f2f2f2; }

        .settings-panel {
          margin-top: 6px;
          padding: 10px 12px;
          border-top: 1px solid #eee;
        }
        .settings-panel .setting-item {
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .settings-panel .setting-item label {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .settings-panel .setting-item input {
          width: 80px;
          padding: 6px;
        }
        .settings-panel .setting-item button {
          background: #7F00FF;
          border: 1px solid #e1e8ed;
          padding: 8px 10px;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          text-align: right;
        }
        .settings-panel .setting-item button:hover {
          background: #f5f5f5;
        }
      `}</style>
    </header>
  );
}
