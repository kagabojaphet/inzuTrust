// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but keep current location for future redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed (case-insensitive)
  const userRole = user.role?.toLowerCase();
  const isAllowed = !allowedRoles || allowedRoles.some(role => role.toLowerCase() === userRole);

  if (!isAllowed) {
    // If user is logged in but doesn't have the role, send to home or their specific dashboard
    const homePath = userRole === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard';
    return <Navigate to={homePath} replace />;
  }

  return children;
}