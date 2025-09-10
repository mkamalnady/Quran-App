// src/pages/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfilePage = () => {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('لم يتم العثور على رمز المصادقة');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://quran-app-8ay9.onrender.com/api/auth/user/', {
          headers: { Authorization: `Token ${token}` }
        });
        
        setUser({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
        });
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('حدث خطأ أثناء جلب البيانات');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    // التحقق من صحة البيانات قبل الإرسال
    if (!user.first_name?.trim() || !user.last_name?.trim() || !user.email?.trim()) {
      setError('جميع الحقول مطلوبة');
      setSubmitting(false);
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError('البريد الإلكتروني غير صحيح');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // إرسال البيانات بالصيغة الصحيحة
      const userData = {
        first_name: user.first_name.trim(),
        last_name: user.last_name.trim(),
        email: user.email.trim(),
      };

      const response = await axios.patch(
        'https://quran-app-8ay9.onrender.com/api/auth/user/',
        userData,
        { 
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Response:', response.data);
      setSuccess('تم تحديث البيانات بنجاح ✅');
      
      // تحديث البيانات المحلية
      setUser({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
      });
      
    } catch (e) {
      console.error('Error details:', e.response?.data || e.message);
      
      if (e.response?.status === 400) {
        const errorData = e.response.data;
        if (errorData.email && errorData.email[0]) {
          setError(`خطأ في البريد الإلكتروني: ${errorData.email[0]}`);
        } else if (errorData.first_name && errorData.first_name[0]) {
          setError(`خطأ في الاسم الأول: ${errorData.first_name[0]}`);
        } else if (errorData.last_name && errorData.last_name[0]) {
          setError(`خطأ في اسم العائلة: ${errorData.last_name[0]}`);
        } else {
          setError('البيانات المدخلة غير صحيحة. يرجى المراجعة.');
        }
      } else if (e.response?.status === 401) {
        setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        // يمكن إعادة التوجيه لصفحة تسجيل الدخول هنا
        setTimeout(() => {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-form-card">
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>⏳</div>
            <div>جاري تحميل البيانات...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-card" style={{ textAlign: 'right', maxWidth: '400px', margin: '50px auto' }}>
        <h1 style={{ 
          marginBottom: 25, 
          textAlign: 'center',
          color: '#2c3e50',
          fontSize: '1.5em'
        }}>
          👤 تعديل البيانات الشخصية
        </h1>
        
        <form onSubmit={handleSubmit} className="form-vertical">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              الاسم الأول
            </label>
            <input
              name="first_name"
              type="text"
              value={user.first_name}
              onChange={handleChange}
              placeholder="أدخل الاسم الأول"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              اسم العائلة
            </label>
            <input
              name="last_name"
              type="text"
              value={user.last_name}
              onChange={handleChange}
              placeholder="أدخل اسم العائلة"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              value={user.email}
              onChange={handleChange}
              placeholder="أدخل البريد الإلكتروني"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#dc3545', 
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              color: '#155724', 
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              width: '100%', 
              padding: '15px',
              background: submitting ? '#6c757d' : 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {submitting ? 'جاري الحفظ... ⏳' : 'حفظ التغييرات 💾'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '10px'
            }}
            onMouseOver={(e) => e.target.style.color = '#0056b3'}
            onMouseOut={(e) => e.target.style.color = '#007bff'}
          >
            ← العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;