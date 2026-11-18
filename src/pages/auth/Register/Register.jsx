
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';

import useAuth from '../../../hooks/useAuth';
import './Register.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    toast.error(message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const fullName = formData.fullName.trim();
    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();

    if (!fullName || !username || !email) {
      showError('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      showError('Username must contain at least 3 characters.');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      showError('Please accept the Terms of Service.');
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName,
        username,
        email,
        password: formData.password,
      });

      toast.success('Your account was created successfully!');

      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          username,
        },
      });
    } catch (error) {
      const message =
        error?.message || 'Registration failed. Please try again.';

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container register-container">
        <Link to="/" className="auth-brand">
          Shop<span>Stream</span>
        </Link>

        <div className="auth-card">
          <div className="auth-heading">
            <h1>Create Account</h1>
            <p>Join ShopStream and start your shopping journey.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="register-fullname">Full Name</label>

              <div className="auth-input-wrapper">
                <FiUser />

                <input
                  id="register-fullname"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-username">Username</label>

              <div className="auth-input-wrapper">
                <FiUser />

                <input
                  id="register-username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  minLength={3}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email Address</label>

              <div className="auth-input-wrapper">
                <FiMail />

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>

              <div className="auth-input-wrapper">
                <FiLock />

                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="auth-input-wrapper">
                <FiLock />

                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <label className="auth-checkbox register-terms">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />

              <span>
                I agree to the <a href="#terms">Terms of Service</a> and{' '}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>

            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  backgroundColor: '#fff0f0',
                  color: '#d93025',
                  border: '1px solid #ffcaca',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="auth-social-buttons">
            <button
              type="button"
              onClick={() =>
                toast.info('Google sign-in is not configured yet.')
              }
            >
              Google
            </button>

            <button
              type="button"
              onClick={() =>
                toast.info('Apple sign-in is not configured yet.')
              }
            >
              Apple
            </button>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>

        <p className="auth-footer">
          © {new Date().getFullYear()} ShopStream. All rights reserved.
        </p>
      </div>
    </main>
  );
}

export default Register;
