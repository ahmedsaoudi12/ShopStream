
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiLogOut,
  FiX,
} from 'react-icons/fi';

function AdminSidebar({ isOpen, onClose, user, onLogout }) {
  const navigationItems = [
    { label: 'Dashboard', path: '/admin', icon: FiGrid, end: true },
    { label: 'Products', path: '/admin/products', icon: FiBox },
    { label: 'Users', path: '/admin/users', icon: FiUsers },
    { label: 'Carts', path: '/admin/carts', icon: FiShoppingCart },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-name">
            Shop<span>Stream</span>
          </div>

          <button
            type="button"
            className="admin-menu-toggle"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        </div>

        <div className="admin-menu-heading">MAIN MENU</div>

        <nav className="admin-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="admin-nav-icon">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-user">
            <div className="admin-avatar">
              {(user?.firstName || user?.username || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-info">
              <strong>
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ''}`
                  : user?.username || 'Administrator'}
              </strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={onLogout}
          >
            <span className="admin-nav-icon">
              <FiLogOut />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
