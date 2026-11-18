
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiStar,
  FiArrowUpRight,
} from 'react-icons/fi';

import './FeaturedProducts.css';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://dummyjson.com/products?limit=8&sortBy=rating&order=desc',
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Could not load products.');
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            'We could not load products right now. Please try again.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  return (
    <section className="featured-products section">
      <div className="home-section-container">

        {/* Section Heading */}
        <div className="home-section-heading">
          <div>
            <h2 className="section-title">Featured Products</h2>

            <p className="section-subtitle">
              The latest and greatest in tech innovation.
            </p>
          </div>

          <Link to="/products" className="section-link">
            <span>View All</span>
            <FiArrowUpRight className="section-link-icon" />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="products-message">
            Loading products...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="products-message products-error">
            {error}
          </div>
        )}

        {/* Products */}
        {!loading && !error && (
          <div className="featured-products-grid">
            {products.map((product) => (
              <article
                className="featured-product-card"
                key={product.id}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="featured-product-image"
                >
                  <img
                    src={product.thumbnail || product.images?.[0]}
                    alt={product.title}
                    loading="lazy"
                  />

                  {product.discountPercentage > 0 && (
                    <span className="product-discount">
                      -{Math.round(product.discountPercentage)}%
                    </span>
                  )}
                </Link>

                <div className="featured-product-info">
                  <span className="featured-product-category">
                    {product.category?.replaceAll('-', ' ')}
                  </span>

                  <Link
                    to={`/products/${product.id}`}
                    className="featured-product-title"
                  >
                    {product.title}
                  </Link>

                  <div className="featured-product-rating">
                    <FiStar />
                    <span>
                      {Number(product.rating).toFixed(1)}
                    </span>
                  </div>

                  <div className="featured-product-bottom">
                    <strong>
                      {formatPrice(product.price)}
                    </strong>

                    <Link
                      to={`/products/${product.id}`}
                      className="product-view-btn"
                      aria-label={`View ${product.title}`}
                    >
                      <FiShoppingBag />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
