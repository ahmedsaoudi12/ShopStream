
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTruck,
  FaCreditCard,
  FaUndo,
  FaArrowRight,
  FaPaypal,
  FaShieldAlt,
  FaCheckCircle,
} from 'react-icons/fa';

import { getCart, clearCart } from '../../../services/cartService';
import useAuth from '../../../hooks/useAuth';
import './Checkout.css';

const ORDERS_KEY = 'shopstream-orders';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState(getCart);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  useEffect(() => {
    const syncCart = () => setCart(getCart());

    window.addEventListener('shopstream:cart-updated', syncCart);
    window.addEventListener('storage', syncCart);

    return () => {
      window.removeEventListener('shopstream:cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  const shipping = subtotal > 0 ? 0 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoMessage('Please enter a promo code.');
      setDiscount(0);
      return;
    }

    // Demo coupon: SAVE10 gives 10% off the subtotal.
    if (code === 'SAVE10') {
      const amount = subtotal * 0.1;
      setDiscount(amount);
      setPromoMessage('Promo code applied successfully!');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid promo code.');
    }
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    if (!user) {
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
      return;
    }

    setIsSubmitting(true);

    const order = {
      id: `SS-${Date.now()}`,
      date: new Date().toISOString(),

      // Link this order to the currently authenticated user.
      userId: user.id,
      userEmail: user.email || '',
      username: user.username || '',

      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        phone: formData.phone,
      },

      paymentMethod,
      items: cart,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      status: 'Confirmed',
    };

    try {
      const existingOrders = JSON.parse(
        localStorage.getItem(ORDERS_KEY) || '[]'
      );

      const updatedOrders = [order, ...existingOrders];

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(updatedOrders)
      );

      // Notify Profile and other components that a new order was saved.
      window.dispatchEvent(
        new CustomEvent('shopstream:orders-updated')
      );

      clearCart();

      navigate('/order-success', {
        state: { order },
      });
    } catch {
      setIsSubmitting(false);
      window.alert('Unable to place your order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <FaCreditCard />
          <h2>Your cart is empty</h2>
          <p>Add some products before proceeding to checkout.</p>
          <button onClick={() => navigate('/products')}>
            Browse Products <FaArrowRight />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <h1>Secure Checkout</h1>
          <p>Complete your order with ShopStream's verified protection.</p>

          <div className="checkout-steps">
            <div className="checkout-step active">
              <span>1</span>
              <small>Shipping</small>
            </div>
            <div className="step-line" />
            <div className="checkout-step active">
              <span>2</span>
              <small>Payment</small>
            </div>
            <div className="step-line" />
            <div className="checkout-step">
              <span>3</span>
              <small>Review</small>
            </div>
          </div>
        </header>

        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <div className="checkout-main">
            <section className="checkout-section">
              <h2>
                <FaTruck />
                Shipping Information
              </h2>

              <div className="checkout-fields">
                <div className="checkout-field">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ahmed"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Elsaoudi"
                    required
                  />
                </div>

                <div className="checkout-field full-width">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Commerce Way"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section payment-section">
              <h2>
                <FaCreditCard />
                Payment Method
              </h2>

              <label
                className={`payment-option ${
                  paymentMethod === 'card' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />

                <div className="payment-option-heading">
                  <span>Credit or Debit Card</span>
                  <FaCreditCard />
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-fields">
                    <div className="checkout-field full-width">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="expiryDate">Expiry Date</label>
                      <input
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="cvc">CVC</label>
                      <input
                        id="cvc"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={4}
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>
                )}
              </label>

              <label
                className={`payment-option paypal-option ${
                  paymentMethod === 'paypal' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                />

                <div className="payment-option-heading">
                  <span>PayPal</span>
                  <FaPaypal />
                </div>
              </label>
            </section>

            <div className="checkout-submit">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Place Order'}
                <FaArrowRight />
              </button>
            </div>
          </div>

          <aside className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-products">
              {cart.map((item) => (
                <div className="summary-product" key={item.id}>
                  <img src={item.thumbnail} alt={item.title} />

                  <div className="summary-product-info">
                    <h3>{item.title}</h3>
                    <p>Qty: {item.quantity || 1}</p>
                    <strong>
                      $
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <strong className="free-shipping">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </strong>
            </div>

            <div className="summary-row">
              <span>Tax (Est.)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount</span>
                <strong>-${discount.toFixed(2)}</strong>
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-total">
              <strong>Total</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <div className="promo-code">
              <input
                type="text"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value);
                  setPromoMessage('');
                }}
                placeholder="Promo Code"
                aria-label="Promo Code"
              />
              <button type="button" onClick={handleApplyPromo}>
                Apply
              </button>
            </div>

            {promoMessage && (
              <p
                className={`promo-message ${
                  discount > 0 ? 'success' : 'error'
                }`}
              >
                {promoMessage}
              </p>
            )}

            <div className="checkout-guarantees">
              <p>
                <FaShieldAlt />
                256-bit SSL Secure Payment
              </p>
              <p>
                <FaUndo />
                30-Day Money Back Guarantee
              </p>
              <p>
                <FaCheckCircle />
                Secure Order Processing
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
