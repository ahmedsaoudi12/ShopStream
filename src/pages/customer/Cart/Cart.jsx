
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingBag,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiTruck,
  FiShield,
} from 'react-icons/fi';

import {
  getCart,
  updateCartQuantity,
  removeFromCart,
} from '../../../services/cartService';

import './Cart.css';

const TAX_RATE = 0.08;

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => getCart());

  // Keep the cart synchronized with other pages.
  useEffect(() => {
    const syncCart = () => setCartItems(getCart());

    window.addEventListener('shopstream:cart-updated', syncCart);
    window.addEventListener('storage', syncCart);

    return () => {
      window.removeEventListener('shopstream:cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const tax = subtotal * TAX_RATE;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const handleQuantityChange = (productId, currentQuantity, amount) => {
    const newQuantity = currentQuantity + amount;

    if (newQuantity < 1) return;

    updateCartQuantity(productId, newQuantity);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <FiShoppingBag />
            </div>

            <h1>Your Cart Is Empty</h1>
            <p>
              Looks like you haven't added anything to your cart yet.
              Let's find something you'll love!
            </p>

            <Link to="/products" className="cart-shop-btn">
              Start Shopping <FiArrowRight />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-heading">
          <div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
            <h1>Your Shopping Cart</h1>
            <p>
              You have {cartItems.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              )}{' '}
              items in your cart.
            </p>
          </div>

          <Link to="/products" className="continue-shopping">
            Continue Shopping <FiArrowRight />
          </Link>
        </div>

        <div className="cart-layout">
          {/* Cart Products */}
          <section className="cart-items-section">
            <div className="cart-section-header">
              <h2>Cart Items</h2>
              <span>{cartItems.length} Products</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const quantity = item.quantity || 1;
                const image = item.thumbnail || item.images?.[0];

                return (
                  <article className="cart-item" key={item.id}>
                    <Link
                      to={`/products/${item.id}`}
                      className="cart-item-image"
                    >
                      {image ? (
                        <img src={image} alt={item.title} />
                      ) : (
                        <FiShoppingBag />
                      )}
                    </Link>

                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <span className="cart-item-category">
                          {item.category || 'Product'}
                        </span>

                        <Link
                          to={`/products/${item.id}`}
                          className="cart-item-title"
                        >
                          {item.title}
                        </Link>

                        <span className="cart-item-brand">
                          {item.brand || 'ShopStream Collection'}
                        </span>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={quantity <= 1}
                            onClick={() =>
                              handleQuantityChange(item.id, quantity, -1)
                            }
                          >
                            <FiMinus />
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              handleQuantityChange(item.id, quantity, 1)
                            }
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemove(item.id)}
                        >
                          <FiTrash2 />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-price">
                      <strong>{formatPrice(item.price * quantity)}</strong>
                      <span>{formatPrice(item.price)} / item</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-security-note">
              <FiShield />
              <span>Your shopping experience is safe and secure.</span>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <strong className="free-shipping">Free</strong>
            </div>

            <div className="summary-row">
              <span>Estimated Tax (8%)</span>
              <strong>{formatPrice(tax)}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout <FiArrowRight />
            </button>

            <p className="checkout-policy">
              By proceeding to checkout, you agree to ShopStream's terms
              and privacy policy.
            </p>

            <div className="summary-divider" />

            <div className="delivery-card">
              <div className="delivery-icon">
                <FiTruck />
              </div>

              <div>
                <strong>Free Express Delivery</strong>
                <span>Enjoy free shipping on your order.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
