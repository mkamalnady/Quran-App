// src/pages/WelcomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentDate } from '../utils/dateUtils';
import { API_BASE } from '../config';

function WelcomePage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDate);
  const [fadeClass, setFadeClass] = useState('fade-in');

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const quranQuotes = [
    { arabic: "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾", translation: "وقل ربي زدني علماً", reference: "طه: 114" },
    { arabic: "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾", translation: "إن مع العسر يسراً", reference: "الشرح: 6" },
    { arabic: "﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾", translation: "فاذكروني أذكركم", reference: "البقرة: 152" },
    { arabic: "﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾", translation: "ألا بذكر الله تطمئن القلوب", reference: "الرعد: 28" }
  ];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
      return;
    }

    const interval = setInterval(() => {
      setFadeClass('fade-out');
      setTimeout(() => {
        setCurrentQuote(prev => (prev + 1) % quranQuotes.length);
        setFadeClass('fade-in');
      }, 500);
    }, 6000);

    const dateInterval = setInterval(() => {
      setCurrentDateTime(getCurrentDate());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(dateInterval);
    };
  }, [navigate]);

  const handleLogin = async e => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrors({ non_field_errors: ['يرجى إدخال البريد الإلكتروني وكلمة المرور.'] });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login/`, { email: email.trim(), password });
      localStorage.setItem('authToken', res.data.key);
      const cfg = { headers: { Authorization: `Token ${res.data.key}` } };
      const user = await axios.get(`${API_BASE}/api/auth/user/`, cfg);
      localStorage.setItem('isAdmin', user.data.is_staff);

      // ✅ تخزين الاسم الكامل لاستخدامه في النافبار (بدون تغيير أي إعدادات أخرى)
      const fullName =
        [user.data.first_name, user.data.last_name].filter(Boolean).join(' ').trim() ||
        user.data.username ||
        '';
      localStorage.setItem('fullName', fullName);

      navigate('/dashboard');
    } catch (err) {
      setErrors((err.response && err.response.data) ? err.response.data : { non_field_errors: ['فشل الاتصال بالخادم. تحقق من الشبكة.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page">
      <div className="main-container">
        {/* Login on right */}
        <div className="login-section">
          <div className="login-container">
            <h2 className="login-title">تسجيل الدخول</h2>
            {errors.non_field_errors && (
              <div className="error-message">{errors.non_field_errors[0]}</div>
            )}
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="البريد الإلكتروني"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="كلمة المرور"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="login-button">
                {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>

            {/* زر “نسيت كلمة المرور” */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Link to="/forgot-password" className="forgot-password-link">
                نسيت كلمة المرور ؟
              </Link>
            </div>

            <div className="divider"><span>أو</span></div>
            <Link to="/register" className="register-button">إنشاء حساب جديد</Link>
          </div>
        </div>

        {/* Info on left */}
        <div className="info-section">
          <div className="app-branding">
            <div className="app-logo">
              <div className="quran-icon">📖</div>
              <h1 className="app-title">حفظ القرآن الكريم</h1>
              <p className="app-tagline">رفيقك في رحلة حفظ كتاب الله</p>
            </div>
            <div className="verse-display">
              <div className={`verse-content ${fadeClass}`}>
                <p className="arabic-text">{quranQuotes[currentQuote].arabic}</p>
                <p className="translation">{quranQuotes[currentQuote].translation}</p>
                <span className="reference">{quranQuotes[currentQuote].reference}</span>
              </div>
            </div>
            <div className="app-features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <div className="feature-text">
                  <h3>حفظ منظم ودقيق</h3>
                  <p>تتبع تقدمك في حفظ القرآن الكريم</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div className="feature-text">
                  <h3>أهداف يومية</h3>
                  <p>حدد أهدافك واحصل على التحفيز</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <div className="feature-text">
                  <h3>مراجعة ذكية</h3>
                  <p>تذكير بالآيات التي تحتاج إلى مراجعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer bar with date */}
      <div className="footer-bar">
        {(currentDateTime && currentDateTime.gregorian) || ''} — {(currentDateTime && currentDateTime.hijri) || ''}
      </div>
      <style jsx>{`
        .welcome-page {
          display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f0f2f5;
        }
        .main-container { display: flex; flex: 1; }
        .login-section { flex: 1; max-width: 400px; background: #fff; box-shadow: 2px 0 8px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; padding: 60px; }
        .login-container { width: 100%; }
        .login-title { font-size: 24px; margin-bottom: 24px; text-align: center; }
        .error-message { background: #ffebee; color: #c62828; padding: 8px; border-radius: 6px; margin-bottom: 16px; text-align: center; }
        .form-group { margin-bottom: 16px; }
        .form-input { width: 100%; padding: 14px; font-size: 16px; border: 1px solid #dddfe2; border-radius: 6px; }
        .form-input:focus { outline: none; border-color: #1877f2; background: #fff; }
        .login-button, .register-button { width: 100%; padding: 14px; font-size: 18px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 16px; }
        .login-button { background: #c59d5f; color: #fff; }
        .login-button:disabled { background: #e4e6ea; color: #bcc0c4; }
        .register-button { background: #a58e67; color: #fff; }
        .divider { text-align: center; margin: 16px 0; position: relative; }
        .divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #dadde1; }
        .divider span { background: #fff; padding: 0 8px; color: #65676b; font-size: 14px; }
        .info-section { flex: 1; background: linear-gradient(135deg, #0d3b66 0%, #093545 100%); padding: 60px; color: #f0c674; display: flex; align-items: center; justify-content: center; }
        .app-branding { max-width: 600px; text-align: center; }
        .quran-icon { font-size: 48px; margin-bottom: 16px; animation: gentle-pulse 4s infinite; }
        .app-title { font-size: 36px; margin-bottom: 8px; }
        .app-tagline { font-size: 18px; margin-bottom: 24px; }
        .verse-display { margin-bottom: 24px; }
        .verse-content { transition: opacity 0.5s; padding: 16px; background: rgba(255,255,255,0.2); border-radius: 8px; }
        .fade-in { opacity:1; } .fade-out { opacity:0; }
        .arabic-text { font-size: 20px; margin-bottom: 8px; }
        .translation { font-size: 14px; margin-bottom: 4px; }
        .reference { font-size: 12px; }
        .app-features { margin-top: 24px; }
        .feature-item { display:flex; align-items:flex-start; margin-bottom:16px; }
        .feature-icon { font-size:20px; margin-right:12px; }
        .feature-text h3 { font-size:16px; margin-bottom:4px; }
        .feature-text p { font-size:14px; }
        .footer-bar { background: #fff; text-align:center; padding:12px 0; font-size:14px; color:#65676b; border-top:1px solid #dddfe2; }
        @keyframes gentle-pulse { 0%,100%{transform:scale(1);}50%{transform:scale(1.1);} }
      `}</style>
    </div>
  );
}

export default WelcomePage;
