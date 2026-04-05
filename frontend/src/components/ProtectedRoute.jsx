// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Maps each role to their home dashboard
const ROLE_HOME = {
  tenant:   '/tenant/dashboard',
  landlord: '/landlord/dashboard',
  admin:    '/admin/dashboard',
  agent:    '/agent/dashboard',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole  = user.role?.toLowerCase();
  const isAllowed = !allowedRoles || allowedRoles.some(r => r.toLowerCase() === userRole);

  if (!isAllowed) {
    return <Navigate to={ROLE_HOME[userRole] || '/'} replace />;
  }

  return children;
}