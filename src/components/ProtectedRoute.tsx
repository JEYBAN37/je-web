// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

interface Props {
  allowedRoles?: string[]; // Si no se envía, solo pide estar logueado
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};