
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import { cartStorage } from '../../../services/cartStorage';

import './CartsManagement.css';

const CARTS_PER_PAGE = 6;

function CartsManagement() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCart, setSelectedCart] = useState(null);
  const [editedProducts, setEditedProducts] = useState([]);

  // Fetch carts and merge saved local changes with API data
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        setLoading(true);

        const response = await api.get('/carts?limit=0');
        const apiCarts = response.data.carts || [];

        const savedCarts = cartStorage.getCarts();
        const deletedIds = cartStorage.getDeletedCartIds();

        const deletedSet = new Set(
          deletedIds.map((id) => String(id))
        );

        const savedIds = new Set(
          savedCarts.map((cart) => String(cart.id))
        );

        // Exclude deleted carts and replace carts with saved versions
        const remainingApiCarts = apiCarts.filter(
          (cart) =>
            !deletedSet.has(String(cart.id)) &&
            !savedIds.has(String(cart.id))
        );

        setCarts([...savedCarts, ...remainingApiCarts]);
      } catch (error) {
        console.error('Failed to fetch carts:', error);
        setCarts(cartStorage.getCarts());
        toast.error('Could not load carts.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  // Search carts by cart ID or customer ID
  const filteredCarts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return carts;

    return carts.filter(
      (cart) =>
        String(cart.id).toLowerCase().includes(value) ||
        String(cart.userId).toLowerCase().includes(value)
    );
  }, [carts, search]);

  // Calculate cart statistics
  const totalRevenue = carts.reduce(
    (sum, cart) => sum + Number(cart.total || 0),
    0
  );

  const totalItems = carts.reduce(
    (sum, cart) =>
      sum +
      (cart.products || []).reduce(
        (productSum, product) =>
          productSum + Number(product.quantity || 0),
        0
      ),
    0
  );

  const averageCartValue =
    carts.length > 0 ? totalRevenue / carts.length : 0;

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCarts.length / CARTS_PER_PAGE)
  );

  const currentCarts = filteredCarts.slice(
    (currentPage - 1) * CARTS_PER_PAGE,
    currentPage * CARTS_PER_PAGE
  );

  // Format currency values
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price || 0));

  // Recalculate cart totals after product changes
  const calculateCart = (cart, products) => {
    const total = products.reduce(
      (sum, product) =>
        sum +
        Number(product.price || 0) *
          Number(product.quantity || 0),
      0
    );

    const totalQuantity = products.reduce(
      (sum, product) =>
        sum + Number(product.quantity || 0),
      0
    );

    return {
      ...cart,
      products,
      total: Number(total.toFixed(2)),
      discountedTotal: Number(total.toFixed(2)),
      totalProducts: products.length,
      totalQuantity,
    };
  };

  // Open cart details
  const handleViewCart = (cart) => {
    setSelectedCart(cart);

    setEditedProducts(
      (cart.products || []).map((product) => ({ ...product }))
    );
  };

  // Close cart details without saving changes
  const handleCloseDetails = () => {
    setSelectedCart(null);
    setEditedProducts([]);
  };

  // Change product quantity inside the selected cart
  const handleQuantityChange = (productId, value) => {
    const quantity = Math.max(1, Number(value) || 1);

    setEditedProducts((previousProducts) =>
      previousProducts.map((product) =>
        String(product.id) === String(productId)
          ? { ...product, quantity }
          : product
      )
    );
  };

  // Remove a product from the selected cart
  const handleRemoveProduct = (productId) => {
    setEditedProducts((previousProducts) =>
      previousProducts.filter(
        (product) => String(product.id) !== String(productId)
      )
    );
  };

  // Save edited cart products and quantities
  const handleSaveCart = () => {
    if (!selectedCart) return;

    const updatedCart = calculateCart(
      selectedCart,
      editedProducts
    );

    cartStorage.updateCart(updatedCart);

    setCarts((previousCarts) =>
      previousCarts.map((cart) =>
        String(cart.id) === String(updatedCart.id)
          ? updatedCart
          : cart
      )
    );

    setSelectedCart(null);
    setEditedProducts([]);

    toast.success('Cart updated successfully!');
  };

  // Delete a cart after confirmation
  const handleDeleteCart = (cart) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Cart #${cart.id}?`
    );

    if (!confirmed) return;

    cartStorage.deleteCart(cart.id);

    setCarts((previousCarts) =>
      previousCarts.filter(
        (item) => String(item.id) !== String(cart.id)
      )
    );

    // Keep the current page valid after deletion
    setCurrentPage((previousPage) =>
      Math.min(
        previousPage,
        Math.max(
          1,
          Math.ceil(
            (filteredCarts.length - 1) / CARTS_PER_PAGE
          )
        )
      )
    );

    if (String(selectedCart?.id) === String(cart.id)) {
      handleCloseDetails();
    }

    toast.success('Cart deleted successfully!');
  };

  return (
    <section className="carts-management">
      {/* Page heading and description */}
      <div className="carts-page-heading">
        <div>
          <h2>Cart Management</h2>
          <p>Monitor customer carts, products, and cart values.</p>
        </div>
      </div>

      {/* Cart statistics */}
      <div className="carts-stats-grid">
        <div className="carts-stat-card">
          <div className="carts-stat-icon total-carts-icon">🛒</div>
          <div>
            <span>TOTAL CARTS</span>
            <strong>{carts.length.toLocaleString('en-US')}</strong>
          </div>
        </div>

        <div className="carts-stat-card">
          <div className="carts-stat-icon revenue-icon">↗</div>
          <div>
            <span>TOTAL CART VALUE</span>
            <strong>{formatPrice(totalRevenue)}</strong>
          </div>
        </div>

        <div className="carts-stat-card">
          <div className="carts-stat-icon average-icon">◷</div>
          <div>
            <span>AVERAGE CART VALUE</span>
            <strong>{formatPrice(averageCartValue)}</strong>
          </div>
        </div>

        <div className="carts-stat-card">
          <div className="carts-stat-icon items-icon">▦</div>
          <div>
            <span>TOTAL ITEMS</span>
            <strong>{totalItems.toLocaleString('en-US')}</strong>
          </div>
        </div>
      </div>

      {/* Search carts */}
      <div className="carts-toolbar">
        <div className="carts-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by Cart ID or User ID..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <span className="carts-results-count">
          {filteredCarts.length} carts found
        </span>
      </div>

      {/* Display carts table */}
      <div className="carts-table-card">
        {loading ? (
          <div className="carts-state">Loading carts...</div>
        ) : (
          <>
            <div className="carts-table-wrapper">
              <table className="carts-table">
                <thead>
                  <tr>
                    <th>Cart ID</th>
                    <th>Customer ID</th>
                    <th>Products</th>
                    <th>Items Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentCarts.map((cart) => (
                    <tr key={cart.id}>
                      <td>
                        <strong className="cart-id">
                          #{cart.id}
                        </strong>
                      </td>

                      <td>
                        <span className="cart-user-badge">
                          User #{cart.userId}
                        </span>
                      </td>

                      <td>
                        {cart.totalProducts ?? cart.products?.length ?? 0}
                      </td>

                      <td>
                        {cart.totalQuantity ??
                          cart.products?.reduce(
                            (sum, product) =>
                              sum + Number(product.quantity || 0),
                            0
                          ) ??
                          0}
                      </td>

                      <td className="cart-total">
                        {formatPrice(cart.total)}
                      </td>

                      <td>
                        <div className="carts-row-actions">
                          <button
                            type="button"
                            title="View cart"
                            onClick={() => handleViewCart(cart)}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            title="Delete cart"
                            onClick={() => handleDeleteCart(cart)}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentCarts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="carts-empty">
                        No carts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cart pagination */}
            <div className="carts-table-footer">
              <span>
                Showing{' '}
                {filteredCarts.length === 0
                  ? 0
                  : (currentPage - 1) * CARTS_PER_PAGE + 1}
                {' '}to{' '}
                {Math.min(
                  currentPage * CARTS_PER_PAGE,
                  filteredCarts.length
                )}
                {' '}of {filteredCarts.length} carts
              </span>

              <div className="carts-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  ‹
                </button>

                <span>
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cart details and editing modal */}
      {selectedCart && (
        <div
          className="cart-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDetails();
            }
          }}
        >
          <div
            className="cart-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-modal-title"
          >
            <div className="cart-modal-header">
              <div>
                <h3 id="cart-modal-title">
                  Cart #{selectedCart.id}
                </h3>
                <p>Customer ID: {selectedCart.userId}</p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                aria-label="Close cart details"
              >
                ×
              </button>
            </div>

            <div className="cart-modal-body">
              <h4>Cart Products</h4>

              {editedProducts.length === 0 ? (
                <p className="cart-no-products">
                  This cart has no products.
                </p>
              ) : (
                editedProducts.map((product) => (
                  <div
                    className="cart-detail-product"
                    key={product.id}
                  >
                    <img
                      src={
                        product.thumbnail ||
                        'https://placehold.co/60x60?text=Product'
                      }
                      alt={product.title}
                    />

                    <div className="cart-detail-product-info">
                      <strong>{product.title}</strong>
                      <span>
                        {formatPrice(product.price)} each
                      </span>
                    </div>

                    <div className="cart-quantity-control">
                      <label htmlFor={`quantity-${product.id}`}>
                        Qty
                      </label>

                      <input
                        id={`quantity-${product.id}`}
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(event) =>
                          handleQuantityChange(
                            product.id,
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="cart-remove-product"
                      onClick={() =>
                        handleRemoveProduct(product.id)
                      }
                      aria-label={`Remove ${product.title}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}

              {/* Calculate the updated total before saving */}
              <div className="cart-details-total">
                <span>Updated Total</span>

                <strong>
                  {formatPrice(
                    editedProducts.reduce(
                      (sum, product) =>
                        sum +
                        Number(product.price || 0) *
                          Number(product.quantity || 0),
                      0
                    )
                  )}
                </strong>
              </div>
            </div>

            <div className="cart-modal-footer">
              <button
                type="button"
                className="cart-cancel-button"
                onClick={handleCloseDetails}
              >
                Cancel
              </button>

              <button
                type="button"
                className="cart-save-button"
                onClick={handleSaveCart}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartsManagement;
