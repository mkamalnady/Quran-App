// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. إنشاء الـ Context
const AuthContext = createContext();

// 2. إنشاء "المزوّد" (Provider) الذي سيحتوي على المنطق
export const AuthProvider = ({ children }) => {
  // استخدام دالة في useState لقراءة القيمة من localStorage مرة واحدة فقط عند التحميل
  const [userToken, setUserToken] = useState(() => localStorage.getItem('authToken'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userToken);

  // هذا الـ "Effect" يراقب أي تغيير في التوكن
  useEffect(() => {
    if (userToken) {
      // إذا كان هناك توكن، أضفه إلى هيدر كل طلبات axios
      axios.defaults.headers.common['Authorization'] = `Token ${userToken}`;
      setIsLoggedIn(true);
    } else {
      // إذا لم يكن هناك توكن، احذفه من هيدر الطلبات
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
    }
  }, [userToken]); // يعمل فقط عندما يتغير userToken

  // دالة لتسجيل الدخول: تحفظ التوكن وتحدّث الحالة
  const login = (token) => {
    localStorage.setItem('authToken', token);
    setUserToken(token);
  };

  // دالة لتسجيل الخروج: تحذف التوكن وتحدّث الحالة
  const logout = () => {
    localStorage.removeItem('authToken');
    setUserToken(null);
  };

  // تمرير القيم والدوال إلى جميع المكونات الفرعية
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
