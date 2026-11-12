import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('parkease_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('parkease_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: newToken, user: newUserData } = res.data.data;
      localStorage.setItem('parkease_token', newToken);
      setToken(newToken);
      setUser(newUserData);
      return newUserData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('parkease_token');
    setToken(null);
    setUser(null);
  };

  const addVehicle = async (vehicleData) => {
    const res = await api.post('/auth/vehicles', vehicleData);
    if (res.data.success) {
      setUser(prev => ({
        ...prev,
        vehicles: [...(prev.vehicles || []), res.data.data]
      }));
      return res.data.data;
    }
  };

  const removeVehicle = async (vehicleId) => {
    const res = await api.delete(`/auth/vehicles/${vehicleId}`);
    if (res.data.success) {
      setUser(prev => ({
        ...prev,
        vehicles: prev.vehicles.filter(v => v.id !== vehicleId)
      }));
    }
  };

  const toggleFavorite = async (locationId) => {
    const res = await api.post(`/auth/favorites/${locationId}`);
    if (res.data.success) {
      setUser(prev => ({
        ...prev,
        favorites: res.data.data.favorites
      }));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      addVehicle,
      removeVehicle,
      toggleFavorite,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
