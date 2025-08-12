// src/pages/LoginPage.jsx (النسخة المحدثة مع اللوجو)

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://quran-app-8ay9.onrender.com/api/auth/login/', { username, password });
            localStorage.setItem('authToken', response.data.key);
            
            const config = { headers: { Authorization: `Token ${response.data.key}` } };
            const userDetailsResponse = await axios.get('https://quran-app-8ay9.onrender.com/api/auth/user/', config);
            localStorage.setItem('isAdmin', userDetailsResponse.data.is_staff);
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed', error);
            alert('فشل تسجيل الدخول. الرجاء التأكد من البيانات.');
        }
    };

    return (
        <>
            <div className="container">
                <div className="auth-form">
                    <div className="auth-logo-container">
                        <img src="/quran-logo.png" alt="القرآن الكريم" className="auth-logo" />
                        <h2>تسجيل الدخول</h2>
                        <p className="auth-subtitle">ادخل إلى حسابك لمتابعة رحلة حفظ القرآن الكريم</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>اسم المستخدم:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>كلمة المرور:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">تسجيل الدخول</button>
                    </form>
                    <p>
                        ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
                    </p>
                </div>
            </div>
            <style jsx>{`
                .auth-logo-container {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .auth-logo {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
                }
                .auth-subtitle {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }
            `}</style>
        </>
    );
}

export default LoginPage;
