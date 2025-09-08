// src/pages/ResetPasswordConfirmPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPasswordConfirmPage() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const uid = query.get('uid');
  const token = query.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleConfirm = async e => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post(
        `${API_BASE}/api/auth/users/reset_password_confirm/`,
        { uid, token, new_password: newPassword }
      );
      setSuccess('تم تغيير كلمة المرور بنجاح.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['فشل التحقق. حاول مجدداً.'] });
    }
  };

  return (
    <div className="reset-confirm-page">
      <h2>تأكيد إعادة تعيين كلمة المرور</h2>
      {success && <div className="success">{success}</div>}
      {errors.non_field_errors && <div className="error">{errors.non_field_errors[0]}</div>}
      <form onSubmit={handleConfirm}>
        <input
          type="password"
          placeholder="كلمة المرور الجديدة"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">تأكيد</button>
      </form>
    </div>
  );
}

export default ResetPasswordConfirmPage;
