// src/components/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn === null) {
    return <div>Loading...</div>; // Or a spinner
  }
  return isLoggedIn ? children : <Navigate to="/login" />;
};
export default PrivateRoute;
