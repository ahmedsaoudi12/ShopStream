
import { useState } from 'react';
import { FiArrowRight, FiMail } from 'react-icons/fi';

import './Newsletter.css';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <span className="newsletter-eyebrow">
            <FiMail />
            STAY IN THE LOOP
          </span>

          <h2>
            Get the latest tech
            <span> delivered to you.</span>
          </h2>

          <p>
            Subscribe to our newsletter and be the first to know
            about new arrivals, exclusive deals, and special offers.
          </p>

          {subscribed ? (
            <div className="newsletter-success" role="status">
              You're on the list! Thanks for subscribing.
            </div>
          ) : (
            <form
              className="newsletter-form"
              onSubmit={handleSubmit}
            >
              <div className="newsletter-input-wrapper">
                <FiMail className="newsletter-input-icon" />

                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-label="Email address"
                  required
                />
              </div>

              <button type="submit" className="newsletter-button">
                Subscribe
                <FiArrowRight />
              </button>
            </form>
          )}

          <span className="newsletter-note">
            No spam. Just the good stuff. Unsubscribe anytime.
          </span>
        </div>

        <div className="newsletter-decoration" aria-hidden="true">
          <div className="newsletter-decoration-circle">
            <FiMail />
          </div>
          <span className="newsletter-decoration-dot dot-one" />
          <span className="newsletter-decoration-dot dot-two" />
          <span className="newsletter-decoration-dot dot-three" />
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
