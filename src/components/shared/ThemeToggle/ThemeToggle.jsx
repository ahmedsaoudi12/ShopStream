
import { FiSun, FiMoon } from 'react-icons/fi';

import useTheme from '../../../hooks/useTheme';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      <span className="theme-toggle-icon">
        <FiSun className={`theme-icon sun-icon ${isDark ? 'active' : ''}`} />
        <FiMoon className={`theme-icon moon-icon ${!isDark ? 'active' : ''}`} />
      </span>

      <span className="theme-toggle-label">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}

export default ThemeToggle;
