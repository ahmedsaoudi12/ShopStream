
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

import ThemeToggle from "../../shared/ThemeToggle/ThemeToggle";
import useAuth from "../../../hooks/useAuth";
import { getCart } from "../../../services/cartService";

import "./Navbar.css";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(() =>
    getCart().reduce(
      (total, item) => total + (item.quantity || 1),
      0
    )
  );

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Update cart badge whenever cart changes.
  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();

      const count = cart.reduce(
        (total, item) => total + (item.quantity || 1),
        0
      );

      setCartCount(count);
    };

    window.addEventListener("shopstream:cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("shopstream:cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) return;

    navigate(`/products?search=${encodeURIComponent(query)}`);

    setSearchTerm("");
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="customer-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Shop<span>Stream</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-menu-button"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="navbar-content"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Navigation Content */}
        <div
          id="navbar-content"
          className={`navbar-content ${menuOpen ? "show" : ""}`}
        >
          {/* Navigation Links */}
          <nav className="navbar-links">
            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Products
            </NavLink>

            {/* Categories will be enabled when its page is ready */}
          </nav>

          {/* Search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search products"
            />

            <button type="submit" aria-label="Search">
              <FiSearch />
            </button>
          </form>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Cart */}
            <Link
              to="/cart"
              className="navbar-icon-link navbar-cart-link"
              aria-label={`Shopping cart, ${cartCount} items`}
              onClick={closeMenu}
            >
              <FiShoppingCart />

              {cartCount > 0 && (
                <span className="navbar-cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="navbar-icon-link"
                aria-label="My account"
                onClick={closeMenu}
              >
                <FiUser />
              </Link>
            ) : (
              <div className="navbar-auth-links">
                <Link
                  to="/login"
                  className="navbar-login-link"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="navbar-register-link"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
