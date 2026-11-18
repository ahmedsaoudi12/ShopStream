
import { useEffect, useState } from 'react';

import AuthContext from './auth-context';
import authService from '../services/authService';
import { storage } from '../utils/storage';

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const savedToken = storage.getToken();

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();

        setUser(currentUser);
        storage.setUser(currentUser);
      } catch (error) {
        console.error('Session verification failed:', error);

        storage.clearAuth();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const accessToken = data.accessToken || data.token;

    if (!accessToken) {
      throw new Error('No authentication token received.');
    }

    const authenticatedUser = {
      ...data,
      role: data.role || 'customer',
    };

    storage.setToken(accessToken);
    storage.setUser(authenticatedUser);

    setToken(accessToken);
    setUser(authenticatedUser);

    return authenticatedUser;
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
  };

  const register = async (userData) => {
    return authService.register(userData);
  };

  const isAdmin = user?.role === 'admin';

  const isAuthenticated = Boolean(token && user);

  const contextValue = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
