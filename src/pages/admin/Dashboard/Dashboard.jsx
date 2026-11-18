
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

import { productStorage } from '../../../services/productStorage';
import { userStorage } from '../../../services/userStorage';
import { cartStorage } from '../../../services/cartStorage';

import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    carts: 0,
    orders: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Merge API data with locally saved additions, edits, and deletions
  const mergeData = (apiItems, savedItems, deletedIds) => {
    const deletedSet = new Set(
      deletedIds.map((id) => String(id))
    );

    const savedIds = new Set(
      savedItems.map((item) => String(item.id))
    );

    const remainingApiItems = apiItems.filter(
      (item) =>
        !deletedSet.has(String(item.id)) &&
        !savedIds.has(String(item.id))
    );

    return [...savedItems, ...remainingApiItems];
  };

  // Fetch dashboard data from API and local storage
  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [productsResult, usersResult, cartsResult] =
          await Promise.allSettled([
            api.get('/products?limit=0'),
            api.get('/users?limit=0'),
            api.get('/carts?limit=0'),
          ]);

        // Read API data, using an empty array if a request fails
        const apiProducts =
          productsResult.status === 'fulfilled'
            ? productsResult.value.data.products || []
            : [];

        const apiUsers =
          usersResult.status === 'fulfilled'
            ? usersResult.value.data.users || []
            : [];

        const apiCarts =
          cartsResult.status === 'fulfilled'
            ? cartsResult.value.data.carts || []
            : [];

        // Read local changes from each management section
        const products = mergeData(
          apiProducts,
          productStorage.getProducts(),
          productStorage.getDeletedProductIds()
        );

        const users = mergeData(
          apiUsers,
          userStorage.getUsers(),
          userStorage.getDeletedUserIds()
        );

        const carts = mergeData(
          apiCarts,
          cartStorage.getCarts(),
          cartStorage.getDeletedCartIds()
        );

        // Read locally saved customer orders
        const savedOrders = JSON.parse(
          localStorage.getItem('shopstream-orders') || '[]'
        );

        if (!isMounted) return;

        // Update dashboard statistics
        setStats({
          products: products.length,
          users: users.length,
          carts: carts.length,
          orders: savedOrders.length,
        });

        // Display the latest five orders
        setOrders(
          [...savedOrders]
            .sort(
              (a, b) =>
                new Date(b.createdAt || b.date || 0) -
                new Date(a.createdAt || a.date || 0)
            )
            .slice(0, 5)
        );

        // Show a warning if one or more API requests failed
        if (
          productsResult.status === 'rejected' ||
          usersResult.status === 'rejected' ||
          cartsResult.status === 'rejected'
        ) {
          setError(
            'Some dashboard data could not be loaded from the server.'
          );
        }
      } catch (err) {
        console.error('Dashboard loading failed:', err);

        if (isMounted) {
          setError('Unable to load dashboard data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Format currency values
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price || 0));

  // Format order dates
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

  // Dashboard statistics cards
  const cards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: '▣',
      color: 'orange',
      link: '/admin/products',
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: '♙',
      color: 'blue',
      link: '/admin/users',
    },
    {
      title: 'Total Carts',
      value: stats.carts,
      icon: '🛒',
      color: 'purple',
      link: '/admin/carts',
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      icon: '▤',
      color: 'green',
      link: null,
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Dashboard heading and current date */}
      <div className="dashboard-welcome">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Here's what's happening with your store today.</p>
        </div>

        <span className="dashboard-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Display data loading errors */}
      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      {/* Main store statistics */}
      <section className="dashboard-stats">
        {cards.map((card) => (
          <div className="dashboard-stat-card" key={card.title}>
            <div className={`dashboard-stat-icon ${card.color}`}>
              {card.icon}
            </div>

            <div className="dashboard-stat-info">
              <p>{card.title}</p>
              <h2>
                {loading
                  ? '...'
                  : card.value.toLocaleString('en-US')}
              </h2>
            </div>

            {card.link && (
              <Link
                to={card.link}
                className="dashboard-stat-link"
                aria-label={`View ${card.title}`}
              >
                →
              </Link>
            )}
          </div>
        ))}
      </section>

      {/* Recent orders and quick navigation */}
      <section className="dashboard-content-grid">
        {/* Recent orders section */}
        <div className="dashboard-panel dashboard-orders-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest orders placed in your store</p>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              <p>Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="dashboard-orders-list">
              {orders.map((order, index) => (
                <div
                  className="dashboard-order-row"
                  key={order.id || order.orderNumber || index}
                >
                  <div className="dashboard-order-icon">▤</div>

                  <div className="dashboard-order-details">
                    <strong>
                      {order.orderNumber ||
                        order.id ||
                        `Order ${index + 1}`}
                    </strong>

                    <span>
                      {order.username ||
                        order.userEmail ||
                        order.email ||
                        'Customer'}
                    </span>

                    <small>
                      {formatDate(order.createdAt || order.date)}
                    </small>
                  </div>

                  <div className="dashboard-order-meta">
                    <strong>
                      {formatPrice(
                        order.total || order.totalAmount || 0
                      )}
                    </strong>

                    <span>
                      {order.status || 'Placed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <span>▤</span>
              <h3>No orders yet</h3>
              <p>
                Orders placed through checkout will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Quick access to management pages */}
        <div className="dashboard-panel dashboard-quick-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your store easily</p>
            </div>
          </div>

          <div className="dashboard-quick-actions">
            <Link to="/admin/products">
              <span>＋</span>

              <div>
                <strong>Manage Products</strong>
                <small>View and manage your inventory</small>
              </div>

              <b>→</b>
            </Link>

            <Link to="/admin/users">
              <span>♙</span>

              <div>
                <strong>Manage Users</strong>
                <small>View registered users</small>
              </div>

              <b>→</b>
            </Link>

            <Link to="/admin/carts">
              <span>🛒</span>

              <div>
                <strong>Manage Carts</strong>
                <small>Review customer carts</small>
              </div>

              <b>→</b>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
