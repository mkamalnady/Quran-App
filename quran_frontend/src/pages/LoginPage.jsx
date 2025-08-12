import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../config';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(ENDPOINTS.auth.login, { username, password });
      const token = res.data.key;
      localStorage.setItem('authToken', token);

      const cfg = { headers: { Authorization: `Token ${token}` } };
      const me = await axios.get(ENDPOINTS.auth.user, cfg);
      localStorage.setItem('isAdmin', me.data.is_staff);

      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed', err);
      alert('فشل تسجيل الدخول. الرجاء التأكد من البيانات.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1>ادخل إلى حسابك لمتابعة رحلة حفظ القرآن الكريم</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المستخدم</label>
            <input type="text" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary">تسجيل الدخول</button>
        </form>
        <p>ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;
