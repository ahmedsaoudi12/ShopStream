
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import { productStorage } from '../../../services/productStorage';

import AddProductModal from '../../../components/admin/AddProductModal/AddProductModal';
import EditProductModal from '../../../components/admin/EditProductModal/EditProductModal';

import './ProductsManagement.css';

function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productsPerPage = 4;

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await api.get('/products?limit=0');
        const apiProducts = response.data.products || [];

        const savedProducts = productStorage.getProducts();
        const deletedIds = productStorage.getDeletedProductIds();

        // Exclude products deleted locally
        const activeApiProducts = apiProducts.filter(
          (product) =>
            !deletedIds.some(
              (id) => String(id) === String(product.id)
            )
        );

        // Avoid duplicate products
        const savedIds = new Set(
          savedProducts.map((product) => String(product.id))
        );

        const remainingApiProducts = activeApiProducts.filter(
          (product) => !savedIds.has(String(product.id))
        );

        setProducts([
          ...savedProducts,
          ...remainingApiProducts,
        ]);
      } catch (error) {
        console.error('Failed to fetch products:', error);

        setProducts(productStorage.getProducts());

        toast.error('Could not load products from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get categories
  const categories = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.category)),
    ].sort();
  }, [products]);

  // Search and filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.title?.toLowerCase().includes(searchValue) ||
        String(product.id).includes(searchValue) ||
        product.category?.toLowerCase().includes(searchValue) ||
        product.sku?.toLowerCase().includes(searchValue);

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Statistics
  const totalProducts = products.length;

  const totalSales = products.reduce(
    (total, product) =>
      total + product.price * (product.stock || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => (product.stock || 0) < 20
  ).length;

  // Search handler
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Category handler
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // Add product
  const handleProductAdded = (newProduct) => {
    productStorage.addProduct(newProduct);

    setProducts((previousProducts) => [
      newProduct,
      ...previousProducts,
    ]);

    setCurrentPage(1);
    setSearch('');
    setSelectedCategory('all');
    setShowAddModal(false);

    toast.success('Product added successfully!');
  };

  // Open edit modal
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Update product
  const handleProductUpdated = (updatedProduct) => {
    productStorage.updateProduct(updatedProduct);

    setProducts((previousProducts) =>
      previousProducts.map((product) =>
        String(product.id) === String(updatedProduct.id)
          ? updatedProduct
          : product
      )
    );

    setShowEditModal(false);
    setSelectedProduct(null);

    toast.success('Product updated successfully!');
  };

  // Close edit modal
  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  // Delete product
  const handleDeleteProduct = (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) return;

    productStorage.deleteProduct(product.id);

    setProducts((previousProducts) =>
      previousProducts.filter(
        (item) => String(item.id) !== String(product.id)
      )
    );

    // Keep current page valid after deletion
    setCurrentPage((previousPage) =>
      Math.min(
        previousPage,
        Math.max(
          1,
          Math.ceil(
            (filteredProducts.length - 1) / productsPerPage
          )
        )
      )
    );

    toast.success('Product deleted successfully!');
  };

  // Format price
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);

  return (
    <section className="products-management">
      {/* Page Heading */}
      <div className="products-page-heading">
        <div>
          <h2>Product Inventory</h2>
          <p>Manage your catalog, stock levels, and pricing.</p>
        </div>

        <button
          type="button"
          className="products-add-button"
          onClick={() => setShowAddModal(true)}
        >
          <span>＋</span> Add New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="products-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search products by name, SKU, or category..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>

        <select
          className="products-category-filter"
          value={selectedCategory}
          onChange={(event) =>
            handleCategoryChange(event.target.value)
          }
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category.replaceAll('-', ' ')}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="products-export-button"
          onClick={() =>
            toast.info('CSV export will be added in the next step.')
          }
        >
          ⇩ Export CSV
        </button>
      </div>

      {/* Products Table */}
      <div className="products-table-card">
        {loading ? (
          <div className="products-state">
            Loading products...
          </div>
        ) : (
          <>
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="products-product-cell">
                          <img
                            src={
                              product.thumbnail ||
                              'https://placehold.co/60x60?text=Product'
                            }
                            alt={product.title}
                          />

                          <div>
                            <strong>{product.title}</strong>
                            <span>
                              SKU: {product.sku || product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="products-category-badge">
                          {product.category}
                        </span>
                      </td>

                      <td className="products-price">
                        {formatPrice(product.price)}
                      </td>

                      <td>
                        <span
                          className={`products-stock ${
                            product.stock === 0
                              ? 'out-of-stock'
                              : product.stock < 20
                                ? 'low-stock'
                                : 'in-stock'
                          }`}
                        >
                          <span className="stock-dot" />

                          {product.stock === 0
                            ? 'Out of Stock'
                            : product.stock < 20
                              ? `Only ${product.stock} Left`
                              : `${product.stock} In Stock`}
                        </span>
                      </td>

                      <td>
                        <div className="products-row-actions">
                          <button
                            type="button"
                            title="Edit product"
                            onClick={() => handleEditClick(product)}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            title="Delete product"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            ▤
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="products-empty">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="products-table-footer">
              <span>
                Showing{' '}
                {filteredProducts.length === 0
                  ? 0
                  : (currentPage - 1) * productsPerPage + 1}
                {' '}to{' '}
                {Math.min(
                  currentPage * productsPerPage,
                  filteredProducts.length
                )}
                {' '}of {filteredProducts.length} products
              </span>

              <div className="products-pagination">
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

      {/* Statistics */}
      <div className="products-stats-grid">
        <div className="products-stat-card">
          <div className="products-stat-icon sales-icon">↗</div>

          <div>
            <span>TOTAL INVENTORY VALUE</span>
            <strong>{formatPrice(totalSales)}</strong>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon carts-icon">▣</div>

          <div>
            <span>TOTAL PRODUCTS</span>
            <strong>
              {totalProducts.toLocaleString('en-US')}
            </strong>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon alerts-icon">▤</div>

          <div>
            <span>LOW STOCK ALERTS</span>
            <strong>{lowStockProducts}</strong>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={handleEditClose}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
    </section>
  );
}

export default ProductsManagement;
