// src/pages/WelcomePage.jsx - صفحة الترحيب الاحترافية
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentDate } from '../utils/dateUtils';

function WelcomePage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDate());
  const navigate = useNavigate();

  const quranQuotes = [
    "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
    "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾",
    "﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾",
    "﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾"
  ];

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
      return;
    }

    // تدوير الآيات
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quranQuotes.length);
    }, 4000);

    // تحديث التاريخ والوقت
    const dateInterval = setInterval(() => {
      setCurrentDateTime(getCurrentDate());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(dateInterval);
    };
  }, [navigate]);

  return (
    <div className="welcome-page">
      {/* Header Section */}
      <header className="welcome-header">
        <div className="header-content">
          <img src="/quran-logo.png" alt="القرآن الكريم" className="welcome-logo" />
          <h1 className="welcome-title">برنامج حفظ القرآن الكريم</h1>
          <p className="welcome-subtitle">رفيقك الأمين في رحلة حفظ كتاب الله</p>
        </div>
      </header>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="quote-container">
          <div className="quote-text" key={currentQuote}>
            {quranQuotes[currentQuote]}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>مميزات البرنامج</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>تتبع الحفظ</h3>
              <p>سجل تقدمك في حفظ السور والآيات بطريقة منظمة ومرئية</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>نظام المراجعة</h3>
              <p>تذكيرات ذكية للمراجعة وتتبع آخر مراجعة لكل سورة</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>نظام الإنجازات</h3>
              <p>احصل على نقاط وإنجازات عند إكمال حفظ السور</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎧</div>
              <h3>استماع وقراءة</h3>
              <p>روابط مباشرة للاستماع وقراءة وتفسير السور</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🕌</div>
              <h3>أذكار المسلم</h3>
              <p>مجموعة شاملة من الأذكار اليومية والمناسبات</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>إحصائيات مفصلة</h3>
              <p>تقارير شاملة عن تقدمك ونشاطك في الحفظ</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>ابدأ رحلتك في حفظ القرآن الكريم</h2>
            <p>انضم إلى آلاف المسلمين الذين يستخدمون برنامجنا لحفظ كتاب الله</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary large">
                إنشاء حساب جديد
              </Link>
              <Link to="/login" className="btn-secondary large">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="container">
          <div className="footer-dates">
            <div className="footer-date-item">
              <span className="date-icon">📅</span>
              <span>{currentDateTime.gregorian}</span>
            </div>
            <div className="footer-date-item">
              <span className="date-icon">🌙</span>
              <span>{currentDateTime.hijri}</span>
            </div>
            <div className="footer-date-item">
              <span className="date-icon">🕐</span>
              <span>{currentDateTime.time}</span>
            </div>
          </div>
          <p>&copy; 2024 برنامج حفظ القرآن الكريم - جميع الحقوق محفوظة</p>
        </div>
      </footer>

      <style jsx>{`
        .welcome-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          overflow-x: hidden;
        }

        .welcome-header {
          padding: 80px 20px 60px;
          text-align: center;
          position: relative;
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .welcome-logo {
          width: 120px;
          height: 120px;
          object-fit: contain;
          margin-bottom: 30px;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .welcome-title {
          font-size: 3.5rem;
          font-weight: bold;
          margin: 0 0 20px 0;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          background: linear-gradient(45deg, #fff, #f8f9fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-subtitle {
          font-size: 1.4rem;
          margin: 0;
          opacity: 0.9;
          font-weight: 300;
        }

        .quote-section {
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .quote-container {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .quote-text {
          font-size: 2rem;
          font-family: 'Amiri', 'Times New Roman', serif;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .features-section {
          padding: 80px 20px;
          background: white;
          color: #333;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 60px;
          color: #2c3e50;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .feature-card {
          background: white;
          padding: 40px 30px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .feature-card p {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .cta-section {
          padding: 80px 20px;
          background: linear-gradient(135deg, #2c3e50, #34495e);
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin: 0 0 20px 0;
          font-weight: bold;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin: 0 0 40px 0;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          padding: 15px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: inline-block;
          min-width: 200px;
        }

        .btn-primary.large {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
        }

        .btn-primary.large:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(39, 174, 96, 0.4);
        }

        .btn-secondary.large {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary.large:hover {
          background: white;
          color: #2c3e50;
          transform: translateY(-3px);
        }

        .welcome-footer {
          padding: 40px 20px;
          background: rgba(0, 0, 0, 0.2);
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-dates {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .footer-date-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 15px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .date-icon {
          font-size: 1.1rem;
        }

        .welcome-footer p {
          margin: 0;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .welcome-title {
            font-size: 2.5rem;
          }

          .welcome-subtitle {
            font-size: 1.2rem;
          }

          .quote-text {
            font-size: 1.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .feature-card {
            padding: 30px 20px;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-primary.large, .btn-secondary.large {
            width: 100%;
            max-width: 300px;
          }
          
          .footer-dates {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default WelcomePage;