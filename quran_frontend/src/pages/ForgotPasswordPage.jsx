// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useNavigate, Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post(`${API_BASE}/api/auth/users/reset_password/`, { email });
      setMessage('تم إرسال كود إعادة التعيين إلى بريدك الإلكتروني.');
    } catch (err) {
      setErrors(err.response?.data || { email: ['حدث خطأ، حاول مرة أخرى.'] });
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="container">
        <h2>إعادة تعيين كلمة المرور</h2>
        {message && <div className="success-message">{message}</div>}
        {errors.email && <div className="error-message">{errors.email[0]}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              required
            />
          </div>
          <button type="submit" className="submit-button">إرسال الكود</button>
        </form>
        <Link to="/" className="back-link">العودة إلى تسجيل الدخول</Link>
      </div>
      <style jsx>{`
        .forgot-password-page {
          display: flex; align-items: center; justify-content: center;
          height: 100vh; background: #f0f2f5;
        }
        .container {
          background: #fff; padding: 40px; border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1); width: 100%; max-width: 400px;
          text-align: center;
        }
        .form-group { margin-bottom: 16px; }
        input {
          width: 100%; padding: 12px; font-size: 16px;
          border: 1px solid #ddd; border-radius: 6px;
        }
        .submit-button {
          width: 100%; padding: 12px; background: #007bff;
          color: #fff; border: none; border-radius: 6px;
          font-size: 16px; cursor: pointer;
        }
        .submit-button:hover { background: #0056b3; }
        .error-message { color: #c62828; margin-bottom: 16px; }
        .success-message { color: #2e7d32; margin-bottom: 16px; }
        .back-link {
          display: block; margin-top: 16px; color: #65676b;
          text-decoration: none;
        }
        .back-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

export default ForgotPasswordPage;
