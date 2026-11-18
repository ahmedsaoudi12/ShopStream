
import { useLocation } from 'react-router-dom';
import ThemeToggle from '../../shared/ThemeToggle/ThemeToggle';

function AdminHeader({ onMenuClick, user }) {
  const location = useLocation();

  const pageTitles = {
    '/admin': 'Dashboard Overview',
    '/admin/products': 'Product Inventory',
    '/admin/users': 'User Directory',
    '/admin/carts': 'Cart Management',
  };

  const title = pageTitles[location.pathname] || 'Admin Panel';

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <div>
          <h1>{title}</h1>
          <p>Manage your store and monitor its activity</p>
        </div>
      </div>

      <div className="admin-header-actions">
        <ThemeToggle />

        <div className="admin-header-avatar">
          {(user?.firstName || user?.username || 'A')
            .charAt(0)
            .toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
