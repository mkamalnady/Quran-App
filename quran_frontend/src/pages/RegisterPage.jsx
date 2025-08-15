// src/pages/RegisterPage.jsx - نسخة نهائية ومضمونة

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '', // استخدام password1
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // مسح الأخطاء عند الكتابة
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = ['اسم المستخدم مطلوب'];
    } else if (formData.username.length < 3) {
      newErrors.username = ['اسم المستخدم يجب أن يكون 3 أحرف على الأقل'];
    }
    
    if (!formData.email.trim()) {
      newErrors.email = ['البريد الإلكتروني مطلوب'];
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = ['البريد الإلكتروني غير صحيح'];
    }
    
    if (!formData.password1) {
      newErrors.password1 = ['كلمة المرور مطلوبة'];
    } else if (formData.password1.length < 8) {
      newErrors.password1 = ['كلمة المرور يجب أن تكون 8 أحرف على الأقل'];
    }
    
    if (formData.password1 !== formData.password2) {
      newErrors.password2 = ['كلمتا المرور غير متطابقتين'];
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // التحقق من صحة البيانات
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/auth/registration/`, formData);
      navigate('/login', { state: { message: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.' } });
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: ['لا يمكن الاتصال بالخادم. تأكد من أن خادم Django يعمل.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'ضعيفة', color: '#e74c3c', width: '33%' };
    if (strength <= 3) return { level: 'متوسطة', color: '#f39c12', width: '66%' };
    return { level: 'قوية', color: '#27ae60', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.password1);

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <img src="/quran-logo.png" alt="القرآن الكريم" className="register-logo" />
            <h1>إنشاء حساب جديد</h1>
            <p>انضم إلينا وابدأ رحلتك في حفظ القرآن الكريم</p>
          </div>

          {errors.non_field_errors && (
            <div className="error-message">
              {errors.non_field_errors.join(' ')}
            </div>
          )}
          
          {errors.general && (
            <div className="error-message">
              {errors.general.join(' ')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <div className="form-group">
              <label htmlFor="username">اسم المستخدم</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="اختر اسم مستخدم فريد"
                  required
                  disabled={loading}
                />
                <span className="input-icon">👤</span>
              </div>
              <small className="form-hint">يجب أن يتكون من حروف إنجليزية وأرقام فقط، بدون مسافات</small>
              {errors.username && <div className="field-error">{errors.username.join(' ')}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  disabled={loading}
                />
                <span className="input-icon">📧</span>
              </div>
              {errors.email && <div className="field-error">{errors.email.join(' ')}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password1">كلمة المرور</label>
              <div className="input-wrapper">
                <input
                  type={showPassword1 ? 'text' : 'password'}
                  id="password1"
                  name="password1"
                  value={formData.password1}
                  onChange={handleChange}
                  placeholder="أدخل كلمة مرور قوية"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword1(!showPassword1)}
                  disabled={loading}
                >
                  {showPassword1 ? '🙈' : '👁️'}
                </button>
              </div>
              
              {formData.password1 && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: passwordStrength.width, 
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: passwordStrength.color }}>
                    {passwordStrength.level}
                  </span>
                </div>
              )}
              
              {errors.password1 && <div className="field-error">{errors.password1.join(' ')}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password2">تأكيد كلمة المرور</label>
              <div className="input-wrapper">
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  id="password2"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword2(!showPassword2)}
                  disabled={loading}
                >
                  {showPassword2 ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password2 && <div className="field-error">{errors.password2.join(' ')}</div>}
            </div>
            
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              لديك حساب بالفعل؟ 
              <Link to="/login" className="login-link">سجل الدخول</Link>
            </p>
            <Link to="/" className="back-home">← العودة للرئيسية</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .register-container {
          width: 100%;
          max-width: 500px;
        }

        .register-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }

        .register-header h1 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 2rem;
          font-weight: bold;
        }

        .register-header p {
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

        .register-form {
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

        .form-hint {
          display: block;
          margin-top: 5px;
          font-size: 0.8rem;
          color: #666;
          line-height: 1.4;
        }

        .field-error {
          color: #c33;
          font-size: 0.85rem;
          margin-top: 5px;
        }

        .password-strength {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: #e1e8ed;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 2px;
        }

        .strength-text {
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 50px;
        }

        .register-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
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

        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
        }

        .register-btn:disabled {
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

        .register-footer {
          text-align: center;
        }

        .register-footer p {
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
          .register-card {
            padding: 30px 20px;
            margin: 10px;
          }

          .register-header h1 {
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

export default RegisterPage;