import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ENDPOINTS } from '../config';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', email: '',
    password1: '', password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      await axios.post(ENDPOINTS.auth.register, formData);
      navigate('/login', { state: { message: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.' } });
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: ['تعذر الاتصال بالخادم'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1>إنشاء حساب جديد</h1>
        {errors.general && <div className="error-message">{errors.general.join(' ')}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المستخدم</label>
            <input type="text" name="username" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" name="password1" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <input type="password" name="password2" onChange={handleChange} required />
            {errors.password2 && <div className="field-error">{errors.password2}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>
        <p>لديك حساب بالفعل؟ <Link to="/login">سجل الدخول</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;
