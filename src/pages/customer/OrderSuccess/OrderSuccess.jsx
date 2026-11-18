
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBoxOpen, FaArrowRight } from 'react-icons/fa';
import './OrderSuccess.css';

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedOrders = JSON.parse(
    localStorage.getItem('shopstream-orders') || '[]'
  );

  const order = location.state?.order || savedOrders[0];

  if (!order) {
    return (
      <main className="success-page">
        <div className="success-card">
          <FaBoxOpen className="success-icon" />
          <h1>No Order Found</h1>
          <p>You haven't placed an order yet.</p>
          <button onClick={() => navigate('/products')}>
            Browse Products <FaArrowRight />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="success-page">
      <div className="success-card">
        <div className="success-check">
          <FaCheckCircle />
        </div>

        <span className="success-eyebrow">ORDER CONFIRMED</span>

        <h1>Thank You for Your Order!</h1>

        <p className="success-description">
          Your order has been placed successfully.
          We're getting everything ready for you.
        </p>

        <div className="success-order-number">
          <span>Order Number</span>
          <strong>{order.id}</strong>
        </div>

        <div className="success-details">
          <div>
            <span>Items</span>
            <strong>
              {order.items.reduce(
                (sum, item) => sum + Number(item.quantity || 1),
                0
              )}
            </strong>
          </div>

          <div>
            <span>Payment Method</span>
            <strong>
              {order.paymentMethod === 'card'
                ? 'Credit / Debit Card'
                : 'PayPal'}
            </strong>
          </div>

          <div>
            <span>Order Status</span>
            <strong className="confirmed-status">{order.status}</strong>
          </div>

          <div>
            <span>Total Paid</span>
            <strong className="success-total">
              ${Number(order.total).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="success-products">
          <h3>Order Items</h3>

          {order.items.map((item) => (
            <div className="success-product" key={item.id}>
              <img src={item.thumbnail} alt={item.title} />

              <div>
                <h4>{item.title}</h4>
                <p>Quantity: {item.quantity || 1}</p>
              </div>

              <strong>
                $
                {(
                  Number(item.price || 0) *
                  Number(item.quantity || 1)
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div className="success-actions">
          <button onClick={() => navigate('/products')}>
            Continue Shopping <FaArrowRight />
          </button>
        </div>

        <p className="success-footer">
          Thank you for choosing ShopStream!
        </p>
      </div>
    </main>
  );
}

export default OrderSuccess;
