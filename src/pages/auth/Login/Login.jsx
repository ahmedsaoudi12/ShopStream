
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiCopy,
  FiArrowRight,
} from 'react-icons/fi';

import useAuth from '../../../hooks/useAuth';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const adminCredentials = {
    username: 'admin1',
    password: 'Admin123',
  };

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

  const handleUseAdminCredentials = () => {
    setFormData((prev) => ({
      ...prev,
      username: adminCredentials.username,
      password: adminCredentials.password,
    }));

    setErrorMessage('');
    toast.info('Admin credentials filled successfully.');
  };

  const handleCopyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        `Username: ${adminCredentials.username}\nPassword: ${adminCredentials.password}`
      );

      toast.success('Admin credentials copied!');
    } catch {
      toast.error('Could not copy credentials.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const username = formData.username.trim();

    if (!username || !formData.password) {
      const message = 'Please enter your username/email and password.';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);

      const loggedInUser = await login({
        ...formData,
        username,
      });

      toast.success('Welcome back!');

      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      const destination =
        location.state?.from?.pathname || '/';

      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        error?.message || 'Login failed. Please check your credentials.';

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-brand">
          Shop<span>Stream</span>
        </Link>

        <div className="auth-layout">
          {/* Login Card */}
          <section className="auth-card">
            <div className="auth-heading">
              <h1>Welcome Back</h1>
              <p>Sign in to continue your shopping experience.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="login-username">
                  Email or Username
                </label>

                <div className="auth-input-wrapper">
                  <FiMail />

                  <input
                    id="login-username"
                    type="text"
                    name="username"
                    placeholder="Enter your email or username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() =>
                      toast.info(
                        'Password recovery is not available in this demo.'
                      )
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="auth-input-wrapper">
                  <FiLock />

                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-eye-button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />

                <span>Stay signed in for 30 days</span>
              </label>

              {errorMessage && (
                <div className="auth-error" role="alert" aria-live="polite">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
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
              Don't have an account?{' '}
              <Link to="/register">Create Account</Link>
            </p>
          </section>

          {/* Demo Admin Access */}
          <aside className="admin-demo-card">
            <div className="admin-demo-icon">
              <FiShield />
            </div>

            <span className="admin-demo-label">SPECIAL ACCESS</span>

            <h2>Explore Admin Dashboard</h2>

            <p className="admin-demo-description">
              Want to explore the admin side of ShopStream?
              Use the demo credentials below to access the dashboard.
            </p>

            <div className="admin-demo-credentials">
              <div className="admin-demo-credential">
                <span>Username</span>
                <strong>{adminCredentials.username}</strong>
              </div>

              <div className="admin-demo-credential">
                <span>Password</span>
                <strong>{adminCredentials.password}</strong>
              </div>
            </div>

            <button
              type="button"
              className="admin-demo-use-button"
              onClick={handleUseAdminCredentials}
            >
              Use Admin Credentials
              <FiArrowRight />
            </button>

            <button
              type="button"
              className="admin-demo-copy-button"
              onClick={handleCopyCredentials}
            >
              <FiCopy />
              Copy Credentials
            </button>

            <div className="admin-demo-note">
              <FiShield />
              <span>
                Demo administrator account for project evaluation.
              </span>
            </div>
          </aside>
        </div>

        <p className="auth-footer">
          © {new Date().getFullYear()} ShopStream. All rights reserved.
        </p>
      </div>
    </main>
  );
}

export default Login;
