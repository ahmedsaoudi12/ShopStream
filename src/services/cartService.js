
const CART_KEY = 'shopstream-cart';

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(
    new CustomEvent('shopstream:cart-updated')
  );

  return cart;
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();

  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  let updatedCart;

  if (existingProduct) {
    updatedCart = cart.map((item) =>
      item.id === product.id
        ? {
            ...item,
            quantity: (item.quantity || 1) + quantity,
          }
        : item
    );
  } else {
    updatedCart = [
      ...cart,
      {
        ...product,
        quantity,
      },
    ];
  }

  return saveCart(updatedCart);
};

export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();

  const updatedCart = cart
    .map((item) =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );

  return saveCart(updatedCart);
};

export const removeFromCart = (productId) => {
  const updatedCart = getCart().filter(
    (item) => item.id !== productId
  );

  return saveCart(updatedCart);
};

export const clearCart = () => saveCart([]);
