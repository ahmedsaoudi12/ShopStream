
import { useState } from 'react';
import './EditProductModal.css';

const categories = [
  'beauty',
  'fragrances',
  'furniture',
  'groceries',
  'home-decoration',
  'kitchen-accessories',
  'laptops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'mobile-accessories',
  'motorcycle',
  'skin-care',
  'smartphones',
  'sports-accessories',
  'sunglasses',
  'tablets',
  'tops',
  'vehicle',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches',
];

function EditProductModal({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}) {
  // Store changes separately for each product
  const [formChanges, setFormChanges] = useState({});

  const productId = product?.id;

  const currentChanges = formChanges[productId] || {};

  // Get original product data and apply user changes
  const form = {
    title: product?.title || '',
    sku: product?.sku || '',
    category: product?.category || 'beauty',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    description: product?.description || '',
    thumbnail: product?.thumbnail || '',
    ...currentChanges,
  };

  if (!isOpen || !product) return null;

  const handleClose = () => {
    setFormChanges((previous) => {
      const updated = { ...previous };
      delete updated[productId];
      return updated;
    });

    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormChanges((previous) => ({
      ...previous,
      [productId]: {
        ...(previous[productId] || {}),
        [name]: value,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.sku.trim() ||
      form.price === '' ||
      form.stock === '' ||
      !form.description.trim()
    ) {
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(stock) ||
      price < 0 ||
      stock < 0
    ) {
      return;
    }

    const updatedProduct = {
      ...product,
      title: form.title.trim(),
      sku: form.sku.trim(),
      category: form.category,
      price,
      stock,
      description: form.description.trim(),
      thumbnail: form.thumbnail.trim(),
    };

    onProductUpdated?.(updatedProduct);

    handleClose();
  };

  return (
    <div
      className="edit-product-overlay"
      onMouseDown={handleClose}
    >
      <div
        className="edit-product-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="edit-product-header">
          <div>
            <h2>Edit Product</h2>
            <p>Update the information of this product.</p>
          </div>

          <button
            type="button"
            className="edit-product-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="edit-product-body">
            <div className="edit-product-field">
              <label htmlFor="edit-title">
                Product Name *
              </label>

              <input
                id="edit-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="edit-product-field">
              <label htmlFor="edit-sku">SKU *</label>

              <input
                id="edit-sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Enter SKU"
                required
              />
            </div>

            <div className="edit-product-field">
              <label htmlFor="edit-category">
                Category *
              </label>

              <select
                id="edit-category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replaceAll('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-product-row">
              <div className="edit-product-field">
                <label htmlFor="edit-price">Price ($) *</label>

                <input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="edit-product-field">
                <label htmlFor="edit-stock">Stock *</label>

                <input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="edit-product-field">
              <label htmlFor="edit-description">
                Description *
              </label>

              <textarea
                id="edit-description"
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
                required
              />
            </div>

            <div className="edit-product-field">
              <label htmlFor="edit-thumbnail">
                Image URL
              </label>

              <input
                id="edit-thumbnail"
                name="thumbnail"
                type="url"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {form.thumbnail && (
              <div className="edit-product-image-preview">
                <img
                  src={form.thumbnail}
                  alt="Product preview"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="edit-product-footer">
            <button
              type="button"
              className="edit-product-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-product-save"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
