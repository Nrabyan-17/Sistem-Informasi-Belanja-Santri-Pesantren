import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Komponen Route Guard untuk melindungi rute yang membutuhkan login dan otorisasi role
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Jika belum login, redirect ke halaman login
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Jika ada pembatasan role dan role user saat ini tidak diizinkan
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect ke dashboard sesuai role yang dimiliki user
    if (user.role === 'staff') {
      return <Navigate to="/staff" replace />;
    }
    if (user.role === 'wali') {
      return <Navigate to="/wali" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  // 3. User terautentikasi dan memiliki izin akses
  return children;
};

export default ProtectedRoute;
