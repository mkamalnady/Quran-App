// src/pages/LoginPage.jsx (النسخة المحدثة مع اللوجو)

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        
        try {
            // محاولة تسجيل الدخول بالإيميل أولاً
            let loginData = { email, password };
            let response;
            
            try {
                response = await axios.post(`${API_BASE}/api/auth/login/`, loginData);
            } catch (emailError) {
                // إذا فشل بالإيميل، جرب باسم المستخدم
                loginData = { username: email, password };
                response = await axios.post(`${API_BASE}/api/auth/login/`, loginData);
            }
            
            localStorage.setItem('authToken', response.data.key);
            
            const config = { headers: { Authorization: `Token ${response.data.key}` } };
            const userDetailsResponse = await axios.get(`${API_BASE}/api/auth/user/`, config);
            localStorage.setItem('isAdmin', userDetailsResponse.data.is_staff);
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed', error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ general: 'فشل تسجيل الدخول. الرجاء التأكد من البيانات.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <img src="/quran-logo.png" alt="القرآن الكريم" className="login-logo" />
                        <h1>تسجيل الدخول</h1>
                        <p>ادخل إلى حسابك لمتابعة رحلة حفظ القرآن الكريم</p>
                    </div>

                    {errors.general && (
                        <div className="error-message">
                            {errors.general}
                        </div>
                    )}

                    {errors.non_field_errors && (
                        <div className="error-message">
                            {errors.non_field_errors.join(' ')}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                                    required
                                    disabled={loading}
                                />
                                <span className="input-icon">👤</span>
                            </div>
                            {errors.email && <div className="field-error">{errors.email.join(' ')}</div>}
                            {errors.username && <div className="field-error">{errors.username.join(' ')}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">كلمة المرور</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="أدخل كلمة المرور"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <div className="field-error">{errors.password.join(' ')}</div>}
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                'تسجيل الدخول'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            ليس لديك حساب؟ 
                            <Link to="/register" className="register-link">إنشاء حساب جديد</Link>
                        </p>
                        <Link to="/" className="back-home">← العودة للرئيسية</Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .login-container {
                    width: 100%;
                    max-width: 450px;
                }

                .login-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .login-logo {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
                }

                .login-header h1 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 2rem;
                    font-weight: bold;
                }

                .login-header p {
                    margin: 0;
                    color: #666;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .error-message {
                    background: #fee;
                    color: #c33;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #fcc;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .login-form {
                    margin-bottom: 30px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #2c3e50;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 15px 50px 15px 15px;
                    border: 2px solid #e1e8ed;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: #f8f9fa;
                    box-sizing: border-box;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: #667eea;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .input-wrapper input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .input-icon {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
                    font-size: 1.2rem;
                }

                .password-toggle {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    color: #666;
                    padding: 5px;
                    border-radius: 4px;
                    transition: background 0.2s ease;
                }

                .password-toggle:hover {
                    background: rgba(0,0,0,0.05);
                }

                .password-toggle:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .field-error {
                    color: #c33;
                    font-size: 0.85rem;
                    margin-top: 5px;
                }

                .login-btn {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .login-footer {
                    text-align: center;
                }

                .login-footer p {
                    margin: 0 0 15px 0;
                    color: #666;
                    font-size: 0.95rem;
                }

                .register-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    margin-right: 5px;
                }

                .register-link:hover {
                    text-decoration: underline;
                }

                .back-home {
                    color: #666;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.2s ease;
                }

                .back-home:hover {
                    color: #667eea;
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 30px 20px;
                        margin: 10px;
                    }

                    .login-header h1 {
                        font-size: 1.7rem;
                    }

                    .input-wrapper input {
                        padding: 12px 45px 12px 12px;
                    }
                }
            `}</style>
        </div>
    );
}

export default LoginPage;
