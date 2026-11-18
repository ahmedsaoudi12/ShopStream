
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiArrowUpRight,
} from 'react-icons/fi';

import { Link } from 'react-router-dom';

import './Footer.css';

function Footer() {
  return (
    <footer className="customer-footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Shop<span>Stream</span>
          </Link>

          <p className="footer-description">
            A premium e-commerce experience dedicated to delivering
            the latest technology and innovative solutions.
          </p>

          <div className="footer-socials">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FiFacebook />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FiInstagram />
            </a>

            <a
              href="https://www.twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <FiTwitter />
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <FiYoutube />
            </a>
          </div>
        </div>

        {/* Shop Links */}
        <div className="footer-column">
          <h4>SHOP</h4>
          <Link to="/products">All Electronics</Link>
          <Link to="/categories">Collections</Link>
          <Link to="/products">New Arrivals</Link>
          <Link to="/products">Featured Products</Link>
        </div>

        {/* Support Links */}
        <div className="footer-column">
          <h4>SUPPORT</h4>
          <Link to="/profile">Contact Us</Link>
          <Link to="/profile">Shipping Info</Link>
          <Link to="/profile">Returns & Refunds</Link>
          <Link to="/profile">FAQ</Link>
        </div>

        {/* Legal Links */}
        <div className="footer-column">
          <h4>LEGAL</h4>
          <Link to="/profile">Privacy Policy</Link>
          <Link to="/profile">Terms of Service</Link>
          <Link to="/profile">Cookie Policy</Link>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} ShopStream Inc. All rights reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/products">
            Explore <FiArrowUpRight />
          </Link>

          <Link to="/categories">
            Categories <FiArrowUpRight />
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
