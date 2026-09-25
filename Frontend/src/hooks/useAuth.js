'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authApi } from '../lib/api/auth.api';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const login = async (email, password) => {
    context.dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.login(email, password);
      context.dispatch({ type: 'LOGIN', payload: response.data.user });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      context.dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    context.dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.register(name, email, password);
      context.dispatch({ type: 'REGISTER', payload: response.data.user });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      context.dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      context.dispatch({ type: 'LOGOUT' });
    }
  };

  const checkSession = async () => {
    try {
      const response = await authApi.getCurrentUser();
      context.dispatch({ type: 'SET_USER', payload: response.data });
      return response.data;
    } catch (err) {
      console.error('Session check failed:', err);
      context.dispatch({ type: 'SET_USER', payload: null });
      return null;
    }
  };

  const setError = (error) => {
    context.dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    context.dispatch({ type: 'CLEAR_ERROR' });
  };

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    error: context.error,
    login,
    register,
    logout,
    checkSession,
    setError,
    clearError,
  };
}