import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">NEW SEASON ARRIVAL</span>

          <h1>
            Experience the Future
            <br />
            of <span>Innovation.</span>
          </h1>

          <p>
            Explore our curated selection of premium electronics
            designed to elevate your daily stream of life.
            Precision engineering meets minimalist design.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="hero-primary-btn">
              Shop Electronics
            </Link>

            <Link to="/categories" className="hero-secondary-btn">
              View Collections
            </Link>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85"
            alt="Premium wireless headphones"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;