
import { useState } from 'react';
import api from '../../../services/api';
import './AddProductModal.css';

const initialForm = {
  title: '',
  sku: '',
  category: 'beauty',
  price: '',
  stock: '',
  description: '',
  image: '',
};

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

function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setForm(initialForm);
    setImagePreview('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image.');
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (
      !form.title.trim() ||
      !form.sku.trim() ||
      !form.price ||
      form.stock === '' ||
      !form.description.trim()
    ) {
      setError('Please complete all required fields.');
      return;
    }

    if (Number(form.price) < 0 || Number(form.stock) < 0) {
      setError('Price and stock cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);

      const productData = {
        title: form.title.trim(),
        sku: form.sku.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description.trim(),
        thumbnail:
          typeof form.image === 'string'
            ? form.image
            : 'https://placehold.co/300x300?text=Product',
        images: [],
      };

      const response = await api.post('/products/add', productData);

      const newProduct = {
        ...productData,
        ...response.data,
        thumbnail: productData.thumbnail,
        images: productData.images,
      };

      onProductAdded?.(newProduct);
      handleClose();
    } catch (err) {
      console.error('Add product failed:', err);
      setError('Could not add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="add-product-overlay"
      onMouseDown={handleClose}
    >
      <div
        className="add-product-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="add-product-modal-header">
          <div>
            <h3>Add New Product</h3>
            <p>Create a new item in your store inventory.</p>
          </div>

          <button
            type="button"
            className="add-product-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-product-form-body">
            <div className="add-product-fields-grid">
              <div className="add-product-field">
                <label htmlFor="product-title">Product Name</label>
                <input
                  id="product-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. SonicWave Pro 2"
                  required
                />
              </div>

              <div className="add-product-field">
                <label htmlFor="product-sku">SKU</label>
                <input
                  id="product-sku"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="SKU-0000-XX"
                  required
                />
              </div>

              <div className="add-product-field">
                <label htmlFor="product-category">Category</label>
                <select
                  id="product-category"
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

              <div className="add-product-field">
                <label htmlFor="product-price">Price ($)</label>
                <input
                  id="product-price"
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

              <div className="add-product-field">
                <label htmlFor="product-stock">Stock Quantity</label>
                <input
                  id="product-stock"
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

              <div className="add-product-field add-product-description">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter product details..."
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="add-product-field add-product-image-field">
              <label>Product Images</label>

              <label className="add-product-upload">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" />
                ) : (
                  <>
                    <span className="add-product-upload-icon">⇧</span>
                    <span>Click or drag an image to upload</span>
                    <small>Image preview only</small>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>

            {error && (
              <p className="add-product-error">
                {error}
              </p>
            )}
          </div>

          <div className="add-product-modal-footer">
            <button
              type="button"
              className="add-product-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-product-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
