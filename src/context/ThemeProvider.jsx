import { useEffect, useState } from 'react';
import ThemeContext from './theme-context';

function getInitialTheme() {
  const savedTheme = localStorage.getItem('shopstream_theme');

  return savedTheme === 'dark' ? 'dark' : 'light';
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shopstream_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light'
    );
  };

  const contextValue = {
    theme,
    toggleTheme,
    isDarkMode: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;