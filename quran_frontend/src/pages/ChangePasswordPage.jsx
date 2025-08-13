// src/pages/ChangePasswordPage.jsx
import React, { useMemo, useState } from 'react';
import axios from 'axios';

const PasswordHint = ({ pwd = '' }) => {
  const rules = useMemo(() => {
    const lengthOK = pwd.length >= 8;
    const upperOK = /[A-Z\u0621-\u064A]/.test(pwd); // حرف كبير لاتيني أو عربي
    const lowerOK = /[a-z]/.test(pwd);
    const numberOK = /\d/.test(pwd);
    const specialOK = /[^A-Za-z0-9\u0621-\u064A]/.test(pwd);
    return { lengthOK, upperOK, lowerOK, numberOK, specialOK };
  }, [pwd]);

  const strength = useMemo(() => {
    const score = Object.values(rules).filter(Boolean).length;
    if (!pwd) return { label: 'أدخل كلمة مرور', color: '#6c757d', width: '0%' };
    if (score <= 2) return { label: 'ضعيفة', color: '#dc3545', width: '33%' };
    if (score === 3 || score === 4) return { label: 'متوسطة', color: '#ffc107', width: '66%' };
    return { label: 'قوية', color: '#28a745', width: '100%' };
  }, [rules, pwd]);

  const Item = ({ ok, text }) => (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.9rem' }}>
      <span style={{ width: 14, height: 14, borderRadius: 3, background: ok ? '#28a745' : '#dee2e6', display: 'inline-block' }} />
      <span style={{ color: ok ? '#2f6f3e' : '#6c757d' }}>{text}</span>
    </li>
  );

  return (
    <div style={{ textAlign: 'right', marginTop: 10 }}>
      <div style={{ background: '#e9ecef', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: strength.width, height: '100%', background: strength.color, transition: 'width 200ms ease' }} />
      </div>
      <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: 8 }}>
        قوة كلمة المرور: <strong style={{ color: strength.color }}>{strength.label}</strong>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <Item ok={rules.lengthOK} text="8 أحرف على الأقل" />
        <Item ok={rules.upperOK} text="حرف كبير (A أو حرف عربي)" />
        <Item ok={rules.lowerOK} text="حرف صغير (a)" />
        <Item ok={rules.numberOK} text="رقم واحد على الأقل" />
        <Item ok={rules.specialOK} text="رمز خاص واحد مثل ! @ #" />
      </ul>
    </div>
  );
};

function ChangePasswordPage() {
  const [old_password, setOldPassword] = useState('');
  const [new_password1, setNewPassword1] = useState('');
  const [new_password2, setNewPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew1, setShowNew1] = useState(false);
  const [showNew2, setShowNew2] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!old_password) e.old_password = 'ادخل كلمة المرور الحالية.';
    if (new_password1.length < 8) e.new_password1 = 'الحد الأدنى 8 أحرف.';
    if (new_password1 && !/[A-Za-z\u0621-\u064A]/.test(new_password1)) e.new_password1 = 'أضف حروفًا لزيادة القوة.';
    if (new_password1 && !/\d/.test(new_password1)) e.new_password1 = 'أضف رقمًا واحدًا على الأقل.';
    if (new_password1 && !/[^A-Za-z0-9\u0621-\u064A]/.test(new_password1)) e.new_password1 = 'أضف رمزًا خاصًا واحدًا.';
    if (new_password1 === old_password && new_password1) e.new_password1 = 'كلمة المرور الجديدة لا يجب أن تطابق الحالية.';
    if (new_password1 !== new_password2) e.new_password2 = 'كلمتا المرور غير متطابقتين.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setErrors({});
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Token ${token}` } };
      await axios.post(
        'https://quran-app-8ay9.onrender.com/api/auth/password/change/',
        { old_password, new_password1, new_password2 },
        config
      );
      alert('تم تغيير كلمة المرور بنجاح، يُنصح بتسجيل الخروج من كل الجلسات الأخرى.');
      setOldPassword('');
      setNewPassword1('');
      setNewPassword2('');
    } catch (err) {
      // إظهار أخطاء الخادم إن وُجدت
      const apiErr = err?.response?.data || {};
      const fallback = 'تعذّر تغيير كلمة المرور. تحقق من كلمة المرور الحالية وحاول مجددًا.';
      setErrors({
        old_password: apiErr?.old_password?.[0],
        new_password1: apiErr?.new_password1?.[0],
        new_password2: apiErr?.new_password2?.[0],
        general: apiErr?.detail || fallback,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card" style={{ textAlign: 'right' }}>
        <h1 style={{ marginBottom: 18 }}>تغيير كلمة المرور</h1>

        {errors.general && (
          <div className="error-message" style={{ marginBottom: 12 }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={onSubmit} className="form-vertical">
          {/* كلمة المرور الحالية */}
          <div className="form-group">
            <label>كلمة المرور الحالية</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showOld ? 'text' : 'password'}
                value={old_password}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                aria-label="إظهار/إخفاء كلمة المرور الحالية"
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6c757d',
                }}
              >
                {showOld ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.old_password && <div className="field-error">{errors.old_password}</div>}
          </div>

          {/* كلمة المرور الجديدة */}
          <div className="form-group">
            <label>كلمة المرور الجديدة</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew1 ? 'text' : 'password'}
                value={new_password1}
                onChange={(e) => setNewPassword1(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                required
                aria-describedby="password-hint"
              />
              <button
                type="button"
                onClick={() => setShowNew1((v) => !v)}
                aria-label="إظهار/إخفاء كلمة المرور"
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6c757d',
                }}
              >
                {showNew1 ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.new_password1 && <div className="field-error">{errors.new_password1}</div>}

            {/* مؤشر القوة ونصائح الشروط */}
            <div id="password-hint">
              <PasswordHint pwd={new_password1} />
            </div>
          </div>

          {/* تأكيد كلمة المرور الجديدة */}
          <div className="form-group">
            <label>تأكيد كلمة المرور الجديدة</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew2 ? 'text' : 'password'}
                value={new_password2}
                onChange={(e) => setNewPassword2(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew2((v) => !v)}
                aria-label="إظهار/إخفاء التأكيد"
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6c757d',
                }}
              >
                {showNew2 ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.new_password2 && <div className="field-error">{errors.new_password2}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </button>

          <div className="form-hint" style={{ marginTop: 10 }}>
            نصيحة: استخدم عبارة طويلة يسهل تذكرها وتحتوي حروفًا وأرقامًا ورمزًا خاصًا.
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
