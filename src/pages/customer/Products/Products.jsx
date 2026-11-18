
import { useEffect, useMemo, useState } from 'react';
import {
  FiShoppingCart,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiSliders,
  FiX,
  FiStar,
} from 'react-icons/fi';

import { Link, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { addToCart as saveToCart } from '../../../services/cartService';

import 'react-toastify/dist/ReactToastify.css';
import './Products.css';

const PRODUCTS_PER_PAGE = 9;

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read search and categories directly from URL
  const search = searchParams.get('search') || '';
  const selectedCategories = searchParams.getAll('category');

  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [minPrice, setMinPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://dummyjson.com/products?limit=0'
        );

        if (!response.ok) {
          throw new Error('Failed to load products.');
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch {
        setError('Could not load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Categories
  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category))]
      .filter(Boolean)
      .sort();
  }, [products]);

  // Brands
  const brands = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.brand).filter(Boolean)
      ),
    ].sort();
  }, [products]);

  // Maximum product price
  const maxProductPrice = useMemo(() => {
    return Math.ceil(
      Math.max(...products.map((product) => product.price), 1000)
    );
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) =>
        `${product.title} ${product.description} ${product.category} ${product.brand || ''}`
          .toLowerCase()
          .includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Brand filter
    if (selectedBrand !== 'All Brands') {
      result = result.filter(
        (product) => product.brand === selectedBrand
      );
    }

    // Price filter
    result = result.filter((product) => product.price >= minPrice);

    // Rating filter
    if (minRating > 0) {
      result = result.filter(
        (product) => product.rating >= minRating
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;

      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;

      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;

      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;

      default:
        result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    products,
    search,
    selectedCategories,
    selectedBrand,
    minPrice,
    minRating,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Category selection
  const toggleCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    const currentCategories = nextParams.getAll('category');

    nextParams.delete('category');

    if (currentCategories.includes(category)) {
      currentCategories
        .filter((item) => item !== category)
        .forEach((item) => nextParams.append('category', item));
    } else {
      [...currentCategories, category].forEach((item) =>
        nextParams.append('category', item)
      );
    }

    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  // Search
  const handleSearch = (event) => {
    const value = event.target.value;

    setCurrentPage(1);

    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);

      if (value.trim()) {
        nextParams.set('search', value);
      } else {
        nextParams.delete('search');
      }

      return nextParams;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedBrand('All Brands');
    setMinPrice(0);
    setMinRating(0);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Add product to cart
  const handleAddToCart = (product) => {
    try {
      saveToCart(product, 1);

      toast.success(`${product.title} added to cart!`, {
        position: 'top-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: 'colored',
      });
    } catch {
      toast.error('Could not add this product to your cart.', {
        position: 'top-right',
        autoClose: 2500,
        theme: 'colored',
      });
    }
  };

  // Pagination buttons
  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let page = start; page <= end; page++) {
        if (!pages.includes(page)) {
          pages.push(page);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <section className="products-page">
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="products-layout">
        {/* Sidebar */}
        <aside
          className={`products-sidebar ${
            mobileFiltersOpen ? 'is-open' : ''
          }`}
        >
          <div className="sidebar-mobile-heading">
            <h3>Filters</h3>

            <button
              type="button"
              className="close-filters-btn"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
            >
              <FiX />
            </button>
          </div>

          {/* Categories */}
          <div className="filter-group">
            <h3 className="filter-heading">Category</h3>

            <div className="filter-options">
              {categories.map((category) => (
                <label
                  className="filter-checkbox"
                  key={category}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />

                  <span>
                    {category.replaceAll('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <h3 className="filter-heading">Price Range</h3>

            <input
              className="price-range-input"
              type="range"
              min="0"
              max={maxProductPrice}
              step="5"
              value={minPrice}
              onChange={(event) => {
                setMinPrice(Number(event.target.value));
                setCurrentPage(1);
              }}
              style={{
                '--range-progress': `${
                  (minPrice / maxProductPrice) * 100
                }%`,
              }}
            />

            <div className="price-range-labels">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxProductPrice)}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-group">
            <h3 className="filter-heading">Rating</h3>

            <div className="rating-options">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  type="button"
                  key={rating}
                  className={`rating-filter ${
                    minRating === rating ? 'active' : ''
                  }`}
                  onClick={() => {
                    setMinRating(
                      minRating === rating ? 0 : rating
                    );
                    setCurrentPage(1);
                  }}
                >
                  <span className="rating-stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FiStar
                        key={index}
                        className={
                          index < rating ? 'filled' : ''
                        }
                      />
                    ))}
                  </span>

                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="filter-group">
            <h3 className="filter-heading">Brand</h3>

            <div className="brand-select-wrapper">
              <select
                value={selectedBrand}
                onChange={(event) => {
                  setSelectedBrand(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by brand"
              >
                <option value="All Brands">All Brands</option>

                {brands.map((brand) => (
                  <option value={brand} key={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <FiChevronDown />
            </div>
          </div>

          {/* Clear Filters */}
          <button
            type="button"
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            <FiX />
            Clear Filters
          </button>

          <button
            type="button"
            className="apply-filters-btn"
            onClick={() => setMobileFiltersOpen(false)}
          >
            Apply Filters
          </button>
        </aside>

        {/* Mobile backdrop */}
        {mobileFiltersOpen && (
          <button
            type="button"
            className="filters-backdrop"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          />
        )}

        {/* Main Content */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="products-heading">
              <div className="products-title-row">
                <h1>All Products</h1>

                <button
                  type="button"
                  className="mobile-filter-btn"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <FiSliders />
                  Filters
                </button>
              </div>

              <p>
                Showing{' '}
                {filteredProducts.length === 0
                  ? 0
                  : (currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                {' - '}
                {Math.min(
                  currentPage * PRODUCTS_PER_PAGE,
                  filteredProducts.length
                )}
                {' '}of {filteredProducts.length} results
              </p>
            </div>

            <div className="products-toolbar-actions">
              {/* Search */}
              <div className="products-search">
                <FiSearch />

                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearch}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.delete('search');
                      setSearchParams(nextParams);
                      setCurrentPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {/* Sorting */}
              <label className="sort-control">
                <span>Sort by:</span>

                <div className="sort-select-wrapper">
                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="newest">
                      Newest Arrivals
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="rating">
                      Top Rated
                    </option>

                    <option value="title">
                      Name: A to Z
                    </option>
                  </select>

                  <FiChevronDown />
                </div>
              </label>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="products-loading">
              <div className="products-spinner" />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            /* Error */
            <div className="products-message">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            /* Empty State */
            <div className="products-message">
              <div className="empty-products-icon">
                <FiSearch />
              </div>

              <h2>No products found</h2>

              <p>
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="products-grid">
                {visibleProducts.map((product) => {
                  const discount = Math.round(
                    product.discountPercentage || 0
                  );

                  return (
                    <article
                      className="product-card"
                      key={product.id}
                    >
                      <Link
                        to={`/products/${product.id}`}
                        className="product-image-link"
                      >
                        <div className="product-image-container">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="product-image"
                            loading="lazy"
                          />

                          {discount >= 10 && (
                            <span className="product-discount-badge">
                              -{discount}%
                            </span>
                          )}

                          {product.id % 7 === 0 && (
                            <span className="product-new-badge">
                              NEW
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="product-card-content">
                        <div className="product-title-row">
                          <Link
                            to={`/products/${product.id}`}
                            className="product-title"
                            title={product.title}
                          >
                            {product.title}
                          </Link>

                          <span className="product-rating">
                            <FiStar />
                            {Number(product.rating).toFixed(1)}
                          </span>
                        </div>

                        <p className="product-description">
                          {product.description}
                        </p>

                        <div className="product-card-bottom">
                          <div className="product-price">
                            <span>
                              {formatPrice(product.price)}
                            </span>

                            {discount >= 10 && (
                              <del>
                                {formatPrice(
                                  product.price /
                                  (1 - discount / 100)
                                )}
                              </del>
                            )}
                          </div>

                          <button
                            type="button"
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(product)}
                          >
                            <FiShoppingCart />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="products-pagination"
                  aria-label="Products pages"
                >
                  <button
                    type="button"
                    className="pagination-arrow"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                    aria-label="Previous page"
                  >
                    <FiChevronLeft />
                  </button>

                  {renderPagination().map((page, index) =>
                    page === '...' ? (
                      <span
                        className="pagination-dots"
                        key={`dots-${index}`}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={page}
                        className={`pagination-number ${
                          currentPage === page ? 'active' : ''
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className="pagination-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    aria-label="Next page"
                  >
                    <FiChevronRight />
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
}

export default Products;
