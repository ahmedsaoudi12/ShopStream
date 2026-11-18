
const PRODUCTS_KEY = 'shopstream_admin_products';
const DELETED_PRODUCTS_KEY = 'shopstream_deleted_products';

const getProducts = () => {
  try {
    const products = localStorage.getItem(PRODUCTS_KEY);
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Failed to read saved products:', error);
    return [];
  }
};

const saveProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

const getDeletedProductIds = () => {
  try {
    const ids = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return ids ? JSON.parse(ids) : [];
  } catch (error) {
    console.error('Failed to read deleted products:', error);
    return [];
  }
};

export const productStorage = {
  getProducts,

  saveProducts,

  getDeletedProductIds,

  addProduct(product) {
    const products = getProducts();
    const updatedProducts = [product, ...products];

    saveProducts(updatedProducts);

    const deletedIds = getDeletedProductIds().filter(
      (id) => String(id) !== String(product.id)
    );

    localStorage.setItem(
      DELETED_PRODUCTS_KEY,
      JSON.stringify(deletedIds)
    );

    return updatedProducts;
  },

  updateProduct(updatedProduct) {
    const products = getProducts();

    const productExists = products.some(
      (product) => String(product.id) === String(updatedProduct.id)
    );

    const updatedProducts = productExists
      ? products.map((product) =>
          String(product.id) === String(updatedProduct.id)
            ? updatedProduct
            : product
        )
      : [updatedProduct, ...products];

    saveProducts(updatedProducts);
    return updatedProducts;
  },

  deleteProduct(productId) {
    const products = getProducts();

    const updatedProducts = products.filter(
      (product) => String(product.id) !== String(productId)
    );

    saveProducts(updatedProducts);

    const deletedIds = getDeletedProductIds();

    if (!deletedIds.some((id) => String(id) === String(productId))) {
      deletedIds.push(productId);
    }

    localStorage.setItem(
      DELETED_PRODUCTS_KEY,
      JSON.stringify(deletedIds)
    );

    return updatedProducts;
  },
};
