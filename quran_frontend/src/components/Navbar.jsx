import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hijriDate, setHijriDate] = useState('');
    const [quranQuote, setQuranQuote] = useState(0);
    const isAuthenticated = !!localStorage.getItem('authToken');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const quranQuotes = [
        "﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾",
        "﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾",
        "﴿ وَمَا عِندَ اللَّهِ خَيْرٌ وَأَبْقَىٰ ﴾",
        "﴿ فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ ﴾",
        "﴿ وَبَشِّرِ الصَّابِرِينَ ﴾"
    ];

    // الوقت
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // تغيير الآيات
    useEffect(() => {
        const quoteTimer = setInterval(() => {
            setQuranQuote(prev => (prev + 1) % quranQuotes.length);
        }, 5000);
        return () => clearInterval(quoteTimer);
    }, []);

    // التاريخ الهجري (تقريبي)
    useEffect(() => {
        const gregorianDate = new Date();
        const hijriYear = Math.floor((gregorianDate.getFullYear() - 622) * 1.030684) + 1;
        const months = [
            'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
            'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
            'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
        ];
        const monthIndex = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 29) + 1;
        setHijriDate(`${day} ${months[monthIndex]} ${hijriYear}هـ`);
    }, []);

    // جلب بيانات المستخدم
    useEffect(() => {
        if (isAuthenticated && !userInfo) {
            fetchUserInfo();
        }
    }, [isAuthenticated]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const config = { headers: { Authorization: `Token ${token}` } };
            const res = await axios.get('https://quran-app-8ay9.onrender.com/api/auth/user/', config);
            setUserInfo(res.data);
        } catch (err) {
            console.error('خطأ في جلب بيانات المستخدم:', err);
        }
    };

    // تسجيل الخروج
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAdmin');
        setUserInfo(null);
        setDropdownOpen(false);
        navigate('/login');
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };
    const closeDropdown = (e) => {
        e?.stopPropagation();
        setDropdownOpen(false);
    };

    // إغلاق القائمة بالنقر أو ESC
    useEffect(() => {
        const handleClose = () => dropdownOpen && setDropdownOpen(false);
        const handleEsc = (e) => e.key === 'Escape' && setDropdownOpen(false);
        if (dropdownOpen) {
            setTimeout(() => {
                document.addEventListener('click', handleClose);
                document.addEventListener('keydown', handleEsc);
            }, 100);
        }
        return () => {
            document.removeEventListener('click', handleClose);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [dropdownOpen]);

    const openExternalLink = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setDropdownOpen(false);
    };
    const handleMenuAction = (action) => {
        action();
        setDropdownOpen(false);
    };

    return (
        <>
            {/* شريط الآية */}
            <div className="quran-quote-banner">
                <div className="quote-container">
                    <span className="quote-text">
                        {quranQuotes[quranQuote]}
                    </span>
                </div>
            </div>

            {/* شريط التنقل */}
            <nav className="enhanced-navbar">
                <div className="navbar-container">
                    {/* يسار - العنوان */}
                    <div className="navbar-left">
                        <Link to="/" className="brand-title">
                            {isAuthenticated && userInfo
                                ? (userInfo.full_name || userInfo.username || userInfo.email)
                                : "حفظ القرآن الكريم"}
                        </Link>

                        {isAuthenticated && (
                            <div className="nav-links">
                                <Link to="/dashboard" className="nav-link">🏠 الرئيسية</Link>
                                <button onClick={() => openExternalLink('https://quran.com')} className="external-link">🎧 استماع</button>
                                <button onClick={() => openExternalLink('https://quran.ksu.edu.sa')} className="external-link">📖 مصحف</button>
                                <button onClick={() => openExternalLink('https://tafsir.app')} className="external-link">📚 تفسير</button>
                                {isAdmin && <Link to="/admin/dashboard" className="admin-link">⭐ لوحة المشرف</Link>}
                            </div>
                        )}
                    </div>

                    {/* الوسط - الوقت */}
                    <div className="navbar-center">
                        <div className="time-section">
                            <div className="current-time">
                                🕐 {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="hijri-date">📅 {hijriDate}</div>
                        </div>
                    </div>

                    {/* يمين - المستخدم */}
                    <div className="navbar-right">
                        {isAuthenticated && userInfo ? (
                            <div className="user-section">
                                <span className="welcome-text">
                                    السلام عليكم، <strong>{userInfo.full_name || userInfo.username || userInfo.email}</strong>
                                </span>
                                <div className="user-dropdown">
                                    <button className="user-avatar-btn" onClick={toggleDropdown}>
                                        <div className="user-avatar">
                                            {(userInfo.full_name || userInfo.username || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <span className="dropdown-arrow">{dropdownOpen ? '✖️' : '▼'}</span>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="mini-dropdown" onClick={(e) => e.stopPropagation()}>
                                            <button className="close-btn-big" onClick={closeDropdown}>❌ إغلاق</button>
                                            <div className="mini-actions-list">
                                                <button onClick={() => handleMenuAction(() => navigate('/dashboard'))}>🏠 الرئيسية</button>
                                                {isAdmin && <button onClick={() => handleMenuAction(() => navigate('/admin/dashboard'))}>⭐ لوحة المشرف</button>}
                                                <button onClick={() => handleMenuAction(() => openExternalLink('https://quran.com'))}>🎧 استماع</button>
                                                <button onClick={() => handleMenuAction(handleLogout)}>🚪 تسجيل الخروج</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login" className="auth-link login">🔐 تسجيل الدخول</Link>
                                <Link to="/register" className="auth-link register">📝 إنشاء حساب</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
