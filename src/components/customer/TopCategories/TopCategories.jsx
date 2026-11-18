
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';

import './TopCategories.css';

const categories = [
  {
    name: 'Computing',
    description: 'Work and play without limits.',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85',
    className: 'category-large',
    category: 'laptops',
  },
  {
    name: 'Wearables',
    description: 'Technology on your wrist.',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85',
    className: '',
    category: 'mens-watches',
  },
  {
    name: 'Audio',
    description: 'Sound that moves you.',
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85',
    className: '',
    category: 'mobile-accessories',
  },
  {
    name: 'Home Theater',
    description: 'Bring entertainment home.',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=85',
    className: 'category-wide',
    category: 'home-decoration',
  },
];

function TopCategories() {
  return (
    <section className="top-categories section">
      <div className="home-section-container">

        <div className="home-section-heading">
          <div>
            <h2 className="section-title">Top Categories</h2>
            <p className="section-subtitle">
              Curated gear for every lifestyle.
            </p>
          </div>

          <Link to="/categories" className="section-link">
            <span>See All</span>
            <FiArrowUpRight className="section-link-icon" />
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.category}`}
              className={`category-card ${category.className}`}
              key={category.name}
              style={{
                backgroundImage: `url("${category.image}")`,
              }}
            >
              <div className="category-overlay">
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>

                <span className="category-arrow">
                  <FiArrowUpRight />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TopCategories;
