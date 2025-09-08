// src/pages/PasswordResetPage.jsx - صفحة إعادة تعيين كلمة المرور
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

function PasswordResetPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            await axios.post(`${API_BASE}/api/auth/password/reset/`, { email });
            setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. تحقق من صندوق الوارد.');
        } catch (error) {
            console.error('Password reset failed', error);
            if (error.response && error.response.data) {
                setError(error.response.data.email ? error.response.data.email.join(' ') : 'حدث خطأ أثناء إرسال الطلب.');
            } else {
                setError('حدث خطأ أثناء إرسال الطلب. تأكد من صحة البريد الإلكتروني.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-reset-page">
            <div className="reset-container">
                <div className="reset-card">
                    <div className="reset-header">
                        <img src="/quran-logo.png" alt="القرآن الكريم" className="reset-logo" />
                        <h1>إعادة تعيين كلمة المرور</h1>
                        <p>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
                    </div>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="reset-form">
                        <div className="form-group">
                            <label htmlFor="email">البريد الإلكتروني</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="أدخل بريدك الإلكتروني"
                                    required
                                    disabled={loading}
                                />
                                <span className="input-icon">📧</span>
                            </div>
                        </div>

                        <button type="submit" className="reset-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    جاري الإرسال...
                                </>
                            ) : (
                                '🔑 إرسال رابط إعادة التعيين'
                            )}
                        </button>
                    </form>

                    <div className="reset-footer">
                        <p>
                            تذكرت كلمة المرور؟ 
                            <Link to="/login" className="login-link">تسجيل الدخول</Link>
                        </p>
                        <Link to="/" className="back-home">← العودة للرئيسية</Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .password-reset-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .reset-container {
                    width: 100%;
                    max-width: 450px;
                }

                .reset-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .reset-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .reset-logo {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
                }

                .reset-header h1 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 2rem;
                    font-weight: bold;
                }

                .reset-header p {
                    margin: 0;
                    color: #666;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #c3e6cb;
                    font-size: 0.9rem;
                    text-align: center;
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

                .reset-form {
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

                .reset-btn {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #f39c12, #e67e22);
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

                .reset-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(243, 156, 18, 0.3);
                }

                .reset-btn:disabled {
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

                .reset-footer {
                    text-align: center;
                }

                .reset-footer p {
                    margin: 0 0 15px 0;
                    color: #666;
                    font-size: 0.95rem;
                }

                .login-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    margin-right: 5px;
                }

                .login-link:hover {
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
                    .reset-card {
                        padding: 30px 20px;
                        margin: 10px;
                    }

                    .reset-header h1 {
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

export default PasswordResetPage;