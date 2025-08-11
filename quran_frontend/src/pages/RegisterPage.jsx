// src/pages/RegisterPage.jsx - نسخة نهائية ومضمونة

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '', // استخدام password1
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (formData.password1 !== formData.password2) {
      setErrors({ password2: ["كلمتا المرور غير متطابقتين."] });
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/registration/', formData);
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

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1>إنشاء حساب جديد</h1>
        {errors.non_field_errors && <p className="error-message">{errors.non_field_errors.join(' ')}</p>}
        {errors.general && <p className="error-message">{errors.general.join(' ')}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">اسم المستخدم</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
            <small className="form-hint">يجب أن يتكون من حروف إنجليزية وأرقام فقط، بدون مسافات.</small>
            {errors.username && <p className="field-error">{errors.username.join(' ')}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            {errors.email && <p className="field-error">{errors.email.join(' ')}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password1">كلمة المرور</label>
            <input
              type="password"
              id="password1"
              name="password1"
              value={formData.password1}
              onChange={handleChange}
              required
            />
            {errors.password1 && <p className="field-error">{errors.password1.join(' ')}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password2">تأكيد كلمة المرور</label>
            <input type="password" id="password2" name="password2" value={formData.password2} onChange={handleChange} required />
            {errors.password2 && <p className="field-error">{errors.password2.join(' ')}</p>}
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>لديك حساب بالفعل؟ <Link to="/login">سجل الدخول</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;
