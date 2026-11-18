import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Load cached user and token immediately to avoid flash of logged-out state
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('parkease_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('parkease_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend on mount (via HttpOnly cookie or token)
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // Call /auth/me - works with both HttpOnly cookie and Bearer token
        const res = await api.get('/auth/me');
        if (res.data.success && isMounted) {
          setUser(res.data.data);
          localStorage.setItem('parkease_user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        // If session is expired or invalid on backend, clear local cache
        if (isMounted && err.response?.status === 401) {
          localStorage.removeItem('parkease_token');
          localStorage.removeItem('parkease_user');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('parkease_token', newToken);
      localStorage.setItem('parkease_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin-login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('parkease_token', newToken);
      localStorage.setItem('parkease_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Administrator authentication failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: newToken, user: newUserData } = res.data.data;
      localStorage.setItem('parkease_token', newToken);
      localStorage.setItem('parkease_user', JSON.stringify(newUserData));
      setToken(newToken);
      setUser(newUserData);
      return newUserData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout call failed or network offline:', err.message);
    } finally {
      localStorage.removeItem('parkease_token');
      localStorage.removeItem('parkease_user');
      setToken(null);
      setUser(null);
    }
  };

  const addVehicle = async (vehicleData) => {
    const res = await api.post('/auth/vehicles', vehicleData);
    if (res.data.success) {
      setUser(prev => {
        const updated = {
          ...prev,
          vehicles: [...(prev?.vehicles || []), res.data.data]
        };
        localStorage.setItem('parkease_user', JSON.stringify(updated));
        return updated;
      });
      return res.data.data;
    }
    throw new Error(res.data.message || 'Failed to register vehicle');
  };

  const removeVehicle = async (vehicleId) => {
    const res = await api.delete(`/auth/vehicles/${vehicleId}`);
    if (res.data.success) {
      setUser(prev => {
        const updated = {
          ...prev,
          vehicles: (prev?.vehicles || []).filter(v => v.id !== vehicleId && v._id !== vehicleId)
        };
        localStorage.setItem('parkease_user', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
    throw new Error(res.data.message || 'Failed to remove vehicle');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        addVehicle,
        removeVehicle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
