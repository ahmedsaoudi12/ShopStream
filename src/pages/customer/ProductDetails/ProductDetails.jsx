
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiHeart,
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
  FiChevronLeft,
  FiStar,
  FiMinus,
  FiPlus,
  FiCheckCircle,
  FiPackage,
  FiArrowUpRight,
} from 'react-icons/fi';

import {
  getProductById,
  getRelatedProducts,
} from '../../../services/productService';

import { addToCart } from '../../../services/cartService';

import './ProductDetails.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specifications');
  const [favorite, setFavorite] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        setProduct(null);
        setRelatedProducts([]);
        setSelectedImage(0);
        setQuantity(1);
        setCartMessage('');

        const productData = await getProductById(id);

        if (!isMounted) return;

        setProduct(productData);

        const related = await getRelatedProducts(
          productData.category,
          productData.id
        );

        if (isMounted) {
          setRelatedProducts(related);
        }
      } catch {
        if (isMounted) {
          setError('We could not load this product. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];

    if (product.images?.length) {
      return product.images;
    }

    return product.thumbnail ? [product.thumbnail] : [];
  }, [product]);

  const discountedPrice = product
    ? product.price * (1 - product.discountPercentage / 100)
    : 0;

  const originalPrice = product?.price || 0;

  const discount = Math.round(product?.discountPercentage || 0);

  const reviews = product?.reviews || [];

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);

    setCartMessage(
      `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart.`
    );

    window.setTimeout(() => {
      setCartMessage('');
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    addToCart(product, quantity);
    navigate('/cart');
  };

  const changeQuantity = (amount) => {
    setQuantity((current) =>
      Math.min(
        Math.max(1, current + amount),
        product?.stock || 1
      )
    );
  };

  const tabs = [
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'User Reviews' },
    { id: 'shipping', label: 'Shipping & Returns' },
  ];

  if (loading) {
    return (
      <section className="product-details-page">
        <div className="product-details-loading">
          <div className="details-spinner" />
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-details-page">
        <div className="product-details-error">
          <FiPackage />
          <h2>Product not found</h2>
          <p>{error || 'This product may no longer be available.'}</p>
          <Link to="/products" className="details-back-button">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="product-details-page">
      <div className="product-details-container">

        {/* Breadcrumbs */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight />

          <Link to="/products">Products</Link>
          <FiChevronRight />

          <Link to="/categories">{product.category}</Link>
          <FiChevronRight />

          <span>{product.title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="product-details-main">

          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="product-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`product-thumbnail ${
                    selectedImage === index ? 'active' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>

            <div className="product-main-image">
              <button
                type="button"
                className={`product-favorite-btn ${
                  favorite ? 'is-favorite' : ''
                }`}
                onClick={() => setFavorite((value) => !value)}
                aria-label={
                  favorite ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                <FiHeart />
              </button>

              {discount >= 10 && (
                <span className="details-discount-badge">
                  -{discount}% OFF
                </span>
              )}

              <img
                src={images[selectedImage] || product.thumbnail}
                alt={product.title}
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-left"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === 0 ? images.length - 1 : current - 1
                      )
                    }
                    aria-label="Previous image"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-right"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === images.length - 1 ? 0 : current + 1
                      )
                    }
                    aria-label="Next image"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="product-information">

            <div className="product-information-top">
              <span className="product-category-badge">
                {product.category}
              </span>

              <span className="product-stock-status">
                <FiCheckCircle />
                {product.availabilityStatus || (
                  product.stock > 0 ? 'In Stock' : 'Out of Stock'
                )}
              </span>
            </div>

            <p className="product-brand">
              {product.brand || 'ShopStream Collection'}
              {product.sku && ` · SKU: ${product.sku}`}
            </p>

            <h1>{product.title}</h1>

            <div className="product-review-summary">
              <div className="product-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FiStar
                    key={index}
                    className={
                      index < Math.round(product.rating)
                        ? 'filled'
                        : ''
                    }
                  />
                ))}
              </div>

              <strong>{Number(product.rating).toFixed(1)}</strong>

              <span>
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <div className="product-details-price">
              <strong>{formatPrice(discountedPrice)}</strong>

              {discount >= 1 && (
                <>
                  <del>{formatPrice(originalPrice)}</del>
                  <span>{discount}% OFF</span>
                </>
              )}
            </div>

            <p className="product-tax-note">
              Shipping calculated at checkout.
              {product.shippingInformation
                ? ` ${product.shippingInformation}`
                : ''}
            </p>

            <div className="product-details-divider" />

            <p className="product-full-description">
              {product.description}
            </p>

            {/* Product Information */}
            <div className="product-meta-list">
              <div>
                <span>Category</span>
                <strong className="capitalize">{product.category}</strong>
              </div>

              <div>
                <span>Brand</span>
                <strong>{product.brand || 'Not specified'}</strong>
              </div>

              <div>
                <span>Availability</span>
                <strong>
                  {product.stock > 0
                    ? `${product.stock} units available`
                    : 'Out of stock'}
                </strong>
              </div>
            </div>

            {/* Quantity */}
            <div className="product-purchase-controls">
              <div className="product-quantity">
                <span>Quantity</span>

                <div className="quantity-stepper">
                  <button
                    type="button"
                    onClick={() => changeQuantity(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() => changeQuantity(1)}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="product-action-buttons">
                <button
                  type="button"
                  className="details-add-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>

                <button
                  type="button"
                  className="details-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                  <FiArrowUpRight />
                </button>
              </div>
            </div>

            {cartMessage && (
              <div className="cart-success-message" role="status">
                <FiCheckCircle />
                {cartMessage}
                <Link to="/cart">View Cart</Link>
              </div>
            )}

            {/* Benefits */}
            <div className="product-benefits">
              <div>
                <FiShield />
                <span>
                  <strong>Warranty</strong>
                  {product.warrantyInformation || 'Warranty information unavailable'}
                </span>
              </div>

              <div>
                <FiTruck />
                <span>
                  <strong>Delivery</strong>
                  {product.shippingInformation || 'Shipping details available at checkout'}
                </span>
              </div>

              <div>
                <FiRefreshCw />
                <span>
                  <strong>Returns</strong>
                  {product.returnPolicy || 'Check return policy at checkout'}
                </span>
              </div>

              <div>
                <FiPackage />
                <span>
                  <strong>Availability</strong>
                  {product.availabilityStatus || 'Check stock availability'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <section className="product-details-tabs">
          <div className="details-tabs-header" role="tablist">
            {tabs.map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.id === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="details-tab-content">

            {/* Specifications */}
            {activeTab === 'specifications' && (
              <div className="specifications-grid">
                <div className="specification-card">
                  <h3>Product Information</h3>

                  <div className="specification-row">
                    <span>Brand</span>
                    <strong>{product.brand || 'Not specified'}</strong>
                  </div>

                  <div className="specification-row">
                    <span>Category</span>
                    <strong className="capitalize">{product.category}</strong>
                  </div>

                  <div className="specification-row">
                    <span>SKU</span>
                    <strong>{product.sku || 'Not available'}</strong>
                  </div>

                  <div className="specification-row">
                    <span>Barcode</span>
                    <strong>{product.meta?.barcode || 'Not available'}</strong>
                  </div>
                </div>

                <div className="specification-card">
                  <h3>Physical Details</h3>

                  <div className="specification-row">
                    <span>Weight</span>
                    <strong>
                      {product.weight
                        ? `${product.weight} kg`
                        : 'Not specified'}
                    </strong>
                  </div>

                  <div className="specification-row">
                    <span>Width</span>
                    <strong>
                      {product.dimensions?.width
                        ? `${product.dimensions.width} cm`
                        : 'Not specified'}
                    </strong>
                  </div>

                  <div className="specification-row">
                    <span>Height</span>
                    <strong>
                      {product.dimensions?.height
                        ? `${product.dimensions.height} cm`
                        : 'Not specified'}
                    </strong>
                  </div>

                  <div className="specification-row">
                    <span>Depth</span>
                    <strong>
                      {product.dimensions?.depth
                        ? `${product.dimensions.depth} cm`
                        : 'Not specified'}
                    </strong>
                  </div>
                </div>

                <div className="specification-card">
                  <h3>In the Box & Care</h3>

                  <p>
                    {product.warrantyInformation ||
                      'Warranty information is not available for this product.'}
                  </p>

                  <p>
                    {product.returnPolicy ||
                      'Return policy information is not available.'}
                  </p>

                  <div className="specification-stock">
                    <FiCheckCircle />
                    {product.stock > 0
                      ? `${product.stock} units currently available`
                      : 'Currently unavailable'}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="product-reviews-content">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <article
                      className="product-review-card"
                      key={`${review.reviewerEmail || review.reviewerName}-${index}`}
                    >
                      <div className="review-card-top">
                        <div>
                          <h4>
                            {review.reviewerName || 'Verified Customer'}
                          </h4>
                          <span>
                            {review.date
                              ? new Date(review.date).toLocaleDateString()
                              : 'Customer review'}
                          </span>
                        </div>

                        <div className="review-rating">
                          <FiStar />
                          {review.rating}/5
                        </div>
                      </div>

                      <p>{review.comment}</p>
                    </article>
                  ))
                ) : (
                  <div className="no-product-reviews">
                    <FiStar />
                    <h3>No reviews available yet</h3>
                    <p>There are currently no customer reviews for this product.</p>
                  </div>
                )}
              </div>
            )}

            {/* Shipping */}
            {activeTab === 'shipping' && (
              <div className="shipping-details-content">
                <div>
                  <FiTruck />
                  <section>
                    <h3>Shipping Information</h3>
                    <p>
                      {product.shippingInformation ||
                        'Shipping details are not available for this product.'}
                    </p>
                  </section>
                </div>

                <div>
                  <FiRefreshCw />
                  <section>
                    <h3>Return Policy</h3>
                    <p>
                      {product.returnPolicy ||
                        'Return policy information is not available for this product.'}
                    </p>
                  </section>
                </div>

                <div>
                  <FiShield />
                  <section>
                    <h3>Warranty</h3>
                    <p>
                      {product.warrantyInformation ||
                        'Warranty information is not available for this product.'}
                    </p>
                  </section>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="related-products-heading">
              <div>
                <h2><h2>You May Also Like</h2></h2>
                <p>More products selected from the same category.</p>
              </div>

              <Link to="/products">
                View All <FiArrowUpRight />
              </Link>
            </div>

            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => {
                const relatedPrice =
                  relatedProduct.price *
                  (1 - relatedProduct.discountPercentage / 100);

                return (
                  <article
                    className="related-product-card"
                    key={relatedProduct.id}
                  >
                    <Link
                      to={`/products/${relatedProduct.id}`}
                      className="related-product-image"
                    >
                      <img
                        src={relatedProduct.thumbnail}
                        alt={relatedProduct.title}
                        loading="lazy"
                      />
                    </Link>

                    <div className="related-product-info">
                      <Link
                        to={`/products/${relatedProduct.id}`}
                        className="related-product-title"
                      >
                        {relatedProduct.title}
                      </Link>

                      <div className="related-product-bottom">
                        <strong>{formatPrice(relatedPrice)}</strong>

                        <span>
                          <FiStar />
                          {Number(relatedProduct.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

export default ProductDetails;
