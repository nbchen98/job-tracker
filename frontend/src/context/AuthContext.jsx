import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth.js';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear localStorage manually instead of calling logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      return { success: true, message: 'Registration successful! Please log in.' };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Login flow
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('🔐 Login attempt with:', credentials.email);
      
      const response = await authAPI.login(credentials);
      console.log('✅ Login response:', response);
      
      // Backend returns { token }, we need to create user object
      const { token: newToken } = response;
      const userData = { email: credentials.email }; // Create user object from credentials
      
      console.log('💾 Storing token:', newToken);
      console.log('💾 Storing user:', userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Login successful, token and user set');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    console.log('🔍 Checking authentication:');
    console.log('  - token:', token);
    console.log('  - user:', user);
    console.log('  - result:', !!token && !!user);
    return !!token && !!user;
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

