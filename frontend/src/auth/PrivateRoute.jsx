import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Mengambil token dari localStorage untuk mengecek status login
  const token = localStorage.getItem("token");

  // Jika token tidak ada, arahkan paksa ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada, izinkan akses ke komponen (children)
  return children;
};

export default PrivateRoute;