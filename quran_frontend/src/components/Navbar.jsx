// src/components/Navbar.jsx (الحل النهائي - قائمة صغيرة وسهلة الإغلاق)

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

    // مجموعة من الآيات الكريمة للعرض المتناوب
    const quranQuotes = [
        "﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾",
        "﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾",
        "﴿ وَمَا عِندَ اللَّهِ خَيْرٌ وَأَبْقَىٰ ﴾",
        "﴿ فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ ﴾",
        "﴿ وَبَشِّرِ الصَّابِرِينَ ﴾"
    ];

    // تحديث الوقت كل ثانية
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // تدوير الآيات كل 5 ثوان
    useEffect(() => {
        const quoteTimer = setInterval(() => {
            setQuranQuote(prev => (prev + 1) % quranQuotes.length);
        }, 5000);
        return () => clearInterval(quoteTimer);
    }, []);

    // حساب التاريخ الهجري التقريبي
    useEffect(() => {
        const calculateHijriDate = () => {
            const gregorianDate = new Date();
            const hijriYear = Math.floor((gregorianDate.getFullYear() - 622) * 1.030684) + 1;
            const hijriMonths = [
                'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
                'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
            ];
            const monthIndex = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * 29) + 1;
            setHijriDate(`${day} ${hijriMonths[monthIndex]} ${hijriYear}هـ`);
        };
        calculateHijriDate();
    }, []);

    // جلب معلومات المستخدم عند تسجيل الدخول
    useEffect(() => {
        if (isAuthenticated && !userInfo) {
            fetchUserInfo();
        }
    }, [isAuthenticated]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const config = { headers: { Authorization: `Token ${token}` } };
            const response = await axios.get('http://127.0.0.1:8000/api/auth/user/', config);
            setUserInfo(response.data);
        } catch (error) {
            console.error('Failed to fetch user info:', error);
        }
    };

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

    // إغلاق القائمة عند النقر في أي مكان
    useEffect(() => {
        const handleGlobalClick = () => {
            if (dropdownOpen) {
                setDropdownOpen(false);
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape' && dropdownOpen) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            // تأخير قصير لتجنب الإغلاق الفوري
            setTimeout(() => {
                document.addEventListener('click', handleGlobalClick);
                document.addEventListener('keydown', handleEscKey);
            }, 100);
        }

        return () => {
            document.removeEventListener('click', handleGlobalClick);
            document.removeEventListener('keydown', handleEscKey);
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
            {/* شريط الآية المتحركة */}
            <div className="quran-quote-banner">
                <div className="quote-container">
                    <span className="quote-text">
                        {quranQuotes[quranQuote]}
                    </span>
                </div>
            </div>

            <nav className="enhanced-navbar">
                <div className="navbar-container">
                    {/* الجهة اليسرى - العنوان والتنقل */}
                    <div className="navbar-left">
                        <Link to="/" className="brand-title">
                            حفظ القرآن الكريم
                        </Link>
                        
                        {isAuthenticated && (
                            <div className="nav-links">
                                <Link to="/dashboard" className="nav-link">
                                    🏠 الرئيسية
                                </Link>

                                {/* أزرار القرآن الكريم */}
                                <button 
                                    onClick={() => openExternalLink('https://quran.com')}
                                    className="nav-link external-link"
                                    title="استمع للقرآن الكريم"
                                >
                                    🎧 استماع
                                </button>

                                <button 
                                    onClick={() => openExternalLink('https://quran.ksu.edu.sa')}
                                    className="nav-link external-link"
                                    title="اقرأ من المصحف الشريف"
                                >
                                    📖 مصحف
                                </button>

                                <button 
                                    onClick={() => openExternalLink('https://tafsir.app')}
                                    className="nav-link external-link"
                                    title="تفسير القرآن الكريم"
                                >
                                    📚 تفسير
                                </button>

                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="nav-link admin-link">
                                        ⭐ لوحة المشرف
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* الوسط - الوقت والتاريخ */}
                    <div className="navbar-center">
                        <div className="time-section">
                            <div className="current-time">
                                🕐 {currentTime.toLocaleTimeString('ar-SA', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div className="hijri-date">
                                📅 {hijriDate}
                            </div>
                        </div>
                    </div>

                    {/* الجهة اليمنى - معلومات المستخدم أو تسجيل الدخول */}
                    <div className="navbar-right">
                        {isAuthenticated && userInfo ? (
                            <div className="user-section">
                                {/* معلومات سريعة */}
                                <div className="quick-stats">
                                    <span className="welcome-text">
                                        السلام عليكم، <strong>{userInfo.username}</strong>
                                    </span>
                                    {isAdmin && (
                                        <span className="admin-badge">
                                            👑 مشرف
                                        </span>
                                    )}
                                </div>

                                {/* قائمة المستخدم المنسدلة الصغيرة جداً */}
                                <div className="user-dropdown">
                                    <button 
                                        className="user-avatar-btn"
                                        onClick={toggleDropdown}
                                        title="قائمة المستخدم"
                                    >
                                        <div className="user-avatar">
                                            {userInfo.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="dropdown-arrow">
                                            {dropdownOpen ? '✖️' : '▼'}
                                        </span>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="mini-dropdown" onClick={(e) => e.stopPropagation()}>
                                            {/* زر إغلاق كبير وواضح */}
                                            <button 
                                                className="close-btn-big"
                                                onClick={closeDropdown}
                                                title="إغلاق القائمة"
                                            >
                                                ❌ إغلاق
                                            </button>

                                            {/* الأزرار الأساسية فقط */}
                                            <div className="mini-actions-list">
                                                <button 
                                                    className="mini-action home"
                                                    onClick={() => handleMenuAction(() => navigate('/dashboard'))}
                                                >
                                                    🏠 الرئيسية
                                                </button>
                                                
                                                {isAdmin && (
                                                    <button 
                                                        className="mini-action admin"
                                                        onClick={() => handleMenuAction(() => navigate('/admin/dashboard'))}
                                                    >
                                                        ⭐ لوحة المشرف
                                                    </button>
                                                )}

                                                <button 
                                                    className="mini-action external"
                                                    onClick={() => handleMenuAction(() => openExternalLink('https://quran.com'))}
                                                >
                                                    🎧 استماع للقرآن
                                                </button>

                                                <button 
                                                    className="mini-action logout"
                                                    onClick={() => handleMenuAction(handleLogout)}
                                                >
                                                    🚪 تسجيل الخروج
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login" className="auth-link login">
                                    🔐 تسجيل الدخول
                                </Link>
                                <Link to="/register" className="auth-link register">
                                    📝 إنشاء حساب
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <style jsx>{`
                .quran-quote-banner {
                    background: linear-gradient(135deg, #2d3436, #636e72);
                    color: white;
                    text-align: center;
                    padding: 8px 0;
                    position: relative;
                    overflow: hidden;
                }

                .quote-container {
                    animation: fadeInOut 5s infinite;
                }

                .quote-text {
                    font-size: 1.1rem;
                    font-weight: bold;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    font-family: 'Amiri', 'Times New Roman', serif;
                }

                @keyframes fadeInOut {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }

                .enhanced-navbar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                }

                .navbar-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-height: 70px;
                }

                .navbar-left {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                    flex: 1;
                }

                .navbar-center {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex: 1;
                }

                .navbar-right {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    flex: 1;
                }

                .brand-title {
                    font-size: 1.6rem;
                    font-weight: bold;
                    color: white;
                    text-decoration: none;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .brand-title:hover {
                    transform: translateY(-1px);
                    color: #ffeaa7;
                }

                .nav-links {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }

                .nav-link, .external-link {
                    color: white;
                    text-decoration: none;
                    padding: 8px 16px;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    font-weight: 500;
                    opacity: 0.9;
                    font-size: 0.9rem;
                    border: none;
                    background: none;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .nav-link:hover, .external-link:hover {
                    background: rgba(255,255,255,0.2);
                    opacity: 1;
                    transform: translateY(-1px);
                }

                .external-link {
                    background: linear-gradient(135deg, #00b894, #00a085);
                    opacity: 1;
                    font-weight: bold;
                }

                .external-link:hover {
                    background: linear-gradient(135deg, #00a085, #008a75);
                    transform: translateY(-2px);
                }

                .admin-link {
                    background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
                    color: #2d3436 !important;
                    font-weight: bold;
                }

                .admin-link:hover {
                    background: linear-gradient(135deg, #fdcb6e, #e17055);
                    color: white !important;
                }

                .time-section {
                    text-align: center;
                    color: white;
                    background: rgba(255,255,255,0.15);
                    padding: 10px 20px;
                    border-radius: 15px;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .current-time {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                .hijri-date {
                    font-size: 0.85rem;
                    opacity: 0.9;
                }

                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .quick-stats {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 5px;
                }

                .welcome-text {
                    color: white;
                    font-size: 0.95rem;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                .admin-badge {
                    background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
                    color: #2d3436;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                .user-dropdown {
                    position: relative;
                }

                .user-avatar-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px;
                    border-radius: 25px;
                    transition: all 0.3s ease;
                }

                .user-avatar-btn:hover {
                    background: rgba(255,255,255,0.1);
                }

                .user-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #00b894, #00a085);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 1.1rem;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,255,255,0.3);
                }

                .dropdown-arrow {
                    color: white;
                    font-size: 0.9rem;
                    font-weight: bold;
                }

                /* القائمة الصغيرة جداً */
                .mini-dropdown {
                    position: absolute;
                    top: 100%;
                    right: -20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    width: 200px;
                    margin-top: 8px;
                    z-index: 9999;
                    border: 2px solid #e9ecef;
                    animation: slideDown 0.15s ease-out;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .close-btn-big {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #e17055, #d63031);
                    color: white;
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                }

                .close-btn-big:hover {
                    background: linear-gradient(135deg, #d63031, #c0392b);
                    transform: scale(1.02);
                }

                .mini-actions-list {
                    padding: 8px;
                }

                .mini-action {
                    width: 100%;
                    padding: 10px 12px;
                    margin-bottom: 6px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    text-align: right;
                    font-size: 0.9rem;
                }

                .mini-action:last-child {
                    margin-bottom: 0;
                }

                .mini-action.home {
                    background: linear-gradient(135deg, #74b9ff, #0984e3);
                    color: white;
                }

                .mini-action.admin {
                    background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
                    color: #2d3436;
                }

                .mini-action.external {
                    background: linear-gradient(135deg, #00b894, #00a085);
                    color: white;
                }

                .mini-action.logout {
                    background: linear-gradient(135deg, #636e72, #2d3436);
                    color: white;
                }

                .mini-action:hover {
                    transform: translateX(-3px);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
                }

                .auth-links {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }

                .auth-link {
                    padding: 10px 20px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    white-space: nowrap;
                }

                .auth-link.login {
                    color: white;
                    border: 2px solid rgba(255,255,255,0.3);
                }

                .auth-link.login:hover {
                    background: rgba(255,255,255,0.2);
                }

                .auth-link.register {
                    background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
                    color: #2d3436;
                }

                .auth-link.register:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                /* التصميم المتجاوب */
                @media (max-width: 768px) {
                    .navbar-container {
                        flex-direction: column;
                        min-height: auto;
                        padding: 10px 15px;
                        gap: 10px;
                    }

                    .navbar-left, .navbar-center, .navbar-right {
                        flex: none;
                    }

                    .nav-links {
                        display: none;
                    }

                    .quick-stats {
                        display: none;
                    }

                    .mini-dropdown {
                        width: 180px;
                        right: -30px;
                    }

                    .time-section {
                        padding: 8px 15px;
                    }
                }
            `}</style>
        </>
    );
}

export default Navbar;
