import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('worksphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('worksphere_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem('worksphere_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('worksphere_token', userToken);
        localStorage.setItem('worksphere_user', JSON.stringify(userData));
        return userData;
      }
      throw new Error(res.data.error || 'Login failed.');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed.';
      throw new Error(errorMessage);
    }
  };

  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      if (res.data.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('worksphere_token', userToken);
        localStorage.setItem('worksphere_user', JSON.stringify(userData));
        return userData;
      }
      throw new Error(res.data.error || 'Registration failed.');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('worksphere_token');
    localStorage.removeItem('worksphere_user');
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('worksphere_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
