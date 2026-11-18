
const CARTS_KEY = 'shopstream_admin_carts';
const DELETED_CARTS_KEY = 'shopstream_deleted_carts';

// Read locally saved cart changes
const getCarts = () => {
  try {
    const data = localStorage.getItem(CARTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read saved carts:', error);
    return [];
  }
};

// Save cart changes
const saveCarts = (carts) => {
  localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
};

// Read deleted cart IDs
const getDeletedCartIds = () => {
  try {
    const data = localStorage.getItem(DELETED_CARTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read deleted cart IDs:', error);
    return [];
  }
};

export const cartStorage = {
  getCarts,

  getDeletedCartIds,

  // Add a new cart
  addCart(cart) {
    const carts = getCarts();
    const updatedCarts = [cart, ...carts];

    saveCarts(updatedCarts);

    const deletedIds = getDeletedCartIds().filter(
      (id) => String(id) !== String(cart.id)
    );

    localStorage.setItem(
      DELETED_CARTS_KEY,
      JSON.stringify(deletedIds)
    );

    return updatedCarts;
  },

  // Update an existing cart
  updateCart(updatedCart) {
    const carts = getCarts();

    const exists = carts.some(
      (cart) => String(cart.id) === String(updatedCart.id)
    );

    const updatedCarts = exists
      ? carts.map((cart) =>
          String(cart.id) === String(updatedCart.id)
            ? updatedCart
            : cart
        )
      : [updatedCart, ...carts];

    saveCarts(updatedCarts);
    return updatedCarts;
  },

  // Delete a cart and remember its ID
  deleteCart(cartId) {
    const carts = getCarts();

    const updatedCarts = carts.filter(
      (cart) => String(cart.id) !== String(cartId)
    );

    saveCarts(updatedCarts);

    const deletedIds = getDeletedCartIds();

    if (!deletedIds.some((id) => String(id) === String(cartId))) {
      deletedIds.push(cartId);
    }

    localStorage.setItem(
      DELETED_CARTS_KEY,
      JSON.stringify(deletedIds)
    );

    return updatedCarts;
  },
};
