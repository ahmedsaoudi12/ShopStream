
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function AdminRoute() {
  const {
    isAuthenticated,
    isAdmin,
    loading,
  } = useAuth();

  const location = useLocation();

  // Wait until authentication is verified
  if (loading) {
    return (
      <div className="route-loading">
        Loading...
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Prevent customers from accessing admin pages
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Allow authenticated admins
  return <Outlet />;
}

export default AdminRoute;
