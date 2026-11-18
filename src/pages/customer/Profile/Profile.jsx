
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaBox,
  FaCog,
  FaSignOutAlt,
  FaEdit,
  FaShoppingBag,
  FaWallet,
  FaStar,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import useAuth from '../../../hooks/useAuth';
import './Profile.css';

const ORDERS_KEY = 'shopstream-orders';

const defaultProfile = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  phone: '',
  address: '',
  image: '',
};

const readStorage = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const getProfileKey = (userId) => `shopstream-profile-${userId}`;

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0);

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getOrderStatus = (status = '') =>
  String(status).toLowerCase().replace(/\s+/g, '-');

function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const userId = user?.id;

  // Profile details are stored separately for each user.
  const [profileDetails, setProfileDetails] = useState(() =>
    userId ? readStorage(getProfileKey(userId), {}) : {}
  );

  const [allOrders, setAllOrders] = useState(() =>
    readStorage(ORDERS_KEY, [])
  );

  const [activeSection, setActiveSection] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(defaultProfile);

  // Listen for order updates.
  useEffect(() => {
    const syncOrders = () => {
      setAllOrders(readStorage(ORDERS_KEY, []));
    };

    window.addEventListener('storage', syncOrders);
    window.addEventListener('shopstream:orders-updated', syncOrders);

    return () => {
      window.removeEventListener('storage', syncOrders);
      window.removeEventListener('shopstream:orders-updated', syncOrders);
    };
  }, []);

  // Combine authenticated user data with saved profile details.
  const profile = {
    ...defaultProfile,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    name:
      user?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    email: user?.email || '',
    username: user?.username || '',
    image: user?.image || '',
    ...profileDetails,
  };

  const fullName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    profile.username ||
    'User';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  // Only show orders belonging to the current user.
  const orders = useMemo(() => {
    if (!user) return [];

    return allOrders.filter((order) => {
      const sameId =
        order.userId != null &&
        String(order.userId) === String(user.id);

      const sameEmail =
        order.userEmail &&
        user.email &&
        order.userEmail.toLowerCase() === user.email.toLowerCase();

      const sameUsername =
        order.username &&
        user.username &&
        order.username.toLowerCase() === user.username.toLowerCase();

      return Boolean(sameId || sameEmail || sameUsername);
    });
  }, [allOrders, user]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) =>
        new Date(b.date || 0) - new Date(a.date || 0)
    );
  }, [orders]);

  const totalOrders = orders.length;

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (total, order) => total + (Number(order.total) || 0),
      0
    );
  }, [orders]);

  const openEditModal = () => {
    setEditForm({
      ...defaultProfile,
      ...profile,
      firstName:
        profile.firstName ||
        profile.name?.split(' ')[0] ||
        '',
      lastName:
        profile.lastName ||
        profile.name?.split(' ').slice(1).join(' ') ||
        '',
    });

    setShowEditModal(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    if (!userId) return;

    const updatedProfile = {
      ...editForm,
      name: `${editForm.firstName} ${editForm.lastName}`.trim(),
      username: user?.username || profile.username,
      image: user?.image || profile.image,
    };

    localStorage.setItem(
      getProfileKey(userId),
      JSON.stringify(updatedProfile)
    );

    // Update the state directly after saving.
    setProfileDetails(updatedProfile);

    setShowEditModal(false);

    toast.success('Profile updated successfully!');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleSignOut = () => {
    logout();
    toast.success('You have signed out successfully.');
    navigate('/login', { replace: true });
  };

  const handleTrackOrder = (order) => {
    toast.info(
      `Order ${order.id || order.orderId || ''} tracking will be available soon.`
    );
  };

  const renderOrderStatus = (status) => {
    const normalizedStatus = getOrderStatus(status || 'Confirmed');

    return (
      <span className={`profile-status status-${normalizedStatus}`}>
        {status || 'Confirmed'}
      </span>
    );
  };

  const renderOrderItems = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    return items.map((item, index) => (
      <div
        className="profile-order-product"
        key={`${item.id || item.title || 'product'}-${index}`}
      >
        <div className="profile-order-image">
          {item.thumbnail || item.image ? (
            <img
              src={item.thumbnail || item.image}
              alt={item.title || 'Product'}
            />
          ) : (
            <FaShoppingBag />
          )}
        </div>

        <div className="profile-order-product-info">
          <h4>{item.title || 'Product'}</h4>
          <p>
            Qty: {item.quantity || 1}
            {item.price != null && ` · ${formatPrice(item.price)}`}
          </p>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-empty-orders">
            <FaUser />
            <h3>Please sign in</h3>
            <p>You need to sign in to view your profile.</p>
            <button onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-sidebar-heading">
            <h3>Account</h3>
            <p>Manage your settings</p>
          </div>

          <nav className="profile-navigation">
            <button
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={() => handleSectionChange('profile')}
            >
              <FaUser />
              <span>My Profile</span>
            </button>

            <button
              className={activeSection === 'orders' ? 'active' : ''}
              onClick={() => handleSectionChange('orders')}
            >
              <FaBox />
              <span>Order History</span>
            </button>

            <button
              className={activeSection === 'settings' ? 'active' : ''}
              onClick={() => handleSectionChange('settings')}
            >
              <FaCog />
              <span>Account Settings</span>
            </button>
          </nav>

          <div className="profile-sidebar-bottom">
            <button
              className="profile-signout"
              onClick={handleSignOut}
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <section className="profile-main">
          {activeSection === 'profile' && (
            <>
              <div className="profile-header-card">
                <div className="profile-user-info">
                  <div className="profile-avatar">
                    {profile.image ? (
                      <img src={profile.image} alt={fullName} />
                    ) : (
                      <span>{initials || 'U'}</span>
                    )}
                  </div>

                  <div className="profile-user-details">
                    <h1>{fullName}</h1>
                    <p>{profile.email || 'No email added yet'}</p>

                    <div className="profile-user-badges">
                      <span className="profile-member-badge">
                        ShopStream Member
                      </span>

                      <span className="profile-date-badge">
                        <FaCalendarAlt />
                        {profile.username
                          ? `@${profile.username}`
                          : 'Account Profile'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-header-actions">
                  <button
                    className="profile-primary-btn"
                    onClick={openEditModal}
                  >
                    <FaEdit />
                    Edit Profile
                  </button>

                  <button
                    className="profile-outline-btn"
                    onClick={() => handleSectionChange('orders')}
                  >
                    View Orders
                  </button>
                </div>
              </div>

              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <div className="profile-stat-top">
                    <span className="profile-stat-icon purple">
                      <FaShoppingBag />
                    </span>
                    <span className="profile-stat-note">All time</span>
                  </div>
                  <p>Total Orders</p>
                  <h2>{totalOrders}</h2>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-top">
                    <span className="profile-stat-icon green">
                      <FaWallet />
                    </span>
                    <span className="profile-stat-note">Based on orders</span>
                  </div>
                  <p>Total Spent</p>
                  <h2>{formatPrice(totalSpent)}</h2>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-top">
                    <span className="profile-stat-icon blue">
                      <FaStar />
                    </span>
                    <span className="profile-stat-note">Coming soon</span>
                  </div>
                  <p>Loyalty Points</p>
                  <h2>—</h2>
                </div>
              </div>

              <section className="profile-orders-card">
                <div className="profile-card-heading">
                  <h2>Recent Orders</h2>
                  <button onClick={() => handleSectionChange('orders')}>
                    View All <FaArrowRight />
                  </button>
                </div>

                {sortedOrders.length > 0 ? (
                  <div className="profile-orders-list">
                    {sortedOrders.slice(0, 3).map((order, index) => (
                      <div
                        className="profile-order-row"
                        key={order.id || order.orderId || index}
                      >
                        <div className="profile-order-products">
                          {renderOrderItems(order).slice(0, 1)}

                          {order.items?.length > 1 && (
                            <span className="profile-more-items">
                              +{order.items.length - 1} more
                            </span>
                          )}

                          <div className="profile-order-meta">
                            <span>
                              Order #{order.id || order.orderId || '—'}
                            </span>
                            <span>
                              Placed on {formatDate(order.date)}
                            </span>
                          </div>
                        </div>

                        <div className="profile-order-right">
                          <strong>{formatPrice(order.total)}</strong>
                          <div>
                            {renderOrderStatus(order.status)}
                            <button
                              className="profile-order-action"
                              onClick={() => handleTrackOrder(order)}
                            >
                              Track Package
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-orders">
                    <FaBox />
                    <h3>No orders yet</h3>
                    <p>Your recent orders will appear here.</p>
                    <button onClick={() => navigate('/products')}>
                      Start Shopping
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {activeSection === 'orders' && (
            <section className="profile-content-card">
              <div className="profile-section-heading">
                <div>
                  <h1>Order History</h1>
                  <p>View and track all your purchases.</p>
                </div>
                <span>{totalOrders} Orders</span>
              </div>

              {sortedOrders.length > 0 ? (
                <div className="profile-orders-list full-list">
                  {sortedOrders.map((order, index) => (
                    <div
                      className="profile-order-row"
                      key={order.id || order.orderId || index}
                    >
                      <div className="profile-order-products">
                        {renderOrderItems(order).slice(0, 1)}

                        {order.items?.length > 1 && (
                          <span className="profile-more-items">
                            +{order.items.length - 1} more
                          </span>
                        )}

                        <div className="profile-order-meta">
                          <span>
                            Order #{order.id || order.orderId || '—'}
                          </span>
                          <span>
                            Placed on {formatDate(order.date)}
                          </span>
                        </div>
                      </div>

                      <div className="profile-order-right">
                        <strong>{formatPrice(order.total)}</strong>
                        <div>
                          {renderOrderStatus(order.status)}
                          <button
                            className="profile-order-action"
                            onClick={() => handleTrackOrder(order)}
                          >
                            Track Package
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-orders">
                  <FaBox />
                  <h3>No orders found</h3>
                  <p>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/products')}>
                    Browse Products
                  </button>
                </div>
              )}
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="profile-content-card">
              <div className="profile-section-heading">
                <div>
                  <h1>Account Settings</h1>
                  <p>Manage your personal information.</p>
                </div>
              </div>

              <div className="profile-settings-list">
                <div className="profile-setting-item">
                  <span className="profile-setting-icon">
                    <FaUser />
                  </span>
                  <div>
                    <h3>Personal Information</h3>
                    <p>Update your name and profile details.</p>
                  </div>
                  <button onClick={openEditModal}>Edit</button>
                </div>

                <div className="profile-setting-item">
                  <span className="profile-setting-icon">
                    <FaEnvelope />
                  </span>
                  <div>
                    <h3>Email Address</h3>
                    <p>{profile.email || 'No email address added'}</p>
                  </div>
                </div>

                <div className="profile-setting-item">
                  <span className="profile-setting-icon">
                    <FaPhone />
                  </span>
                  <div>
                    <h3>Phone Number</h3>
                    <p>{profile.phone || 'No phone number added'}</p>
                  </div>
                </div>

                <div className="profile-setting-item">
                  <span className="profile-setting-icon">
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <h3>Address</h3>
                    <p>{profile.address || 'No address added'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </section>
      </div>

      {showEditModal && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="profile-edit-modal">
            <div className="profile-modal-heading">
              <div>
                <h2>Edit Profile</h2>
                <p>Update your personal information.</p>
              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  placeholder="Enter your address"
                />
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-primary-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;
