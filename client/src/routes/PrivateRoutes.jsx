import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const UserRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/auth/admin-login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/404" replace />;
  
  return <Outlet />;
};