
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader/AdminHeader';

import useAuth from '../../hooks/useAuth';

import './AdminLayout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="admin-main">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
