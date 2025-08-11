// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(() => localStorage.getItem('authToken'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userToken);

  useEffect(() => {
    if (userToken) {
      axios.defaults.headers.common['Authorization'] = `Token ${userToken}`;
      setIsLoggedIn(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
    }
  }, [userToken]);

  const login = (token) => {
    localStorage.setItem('authToken', token);
    setUserToken(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
