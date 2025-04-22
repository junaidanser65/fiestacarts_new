import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

const AuthContext = createContext();

// Mock user data for development
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(false);

  // Mock functions that do nothing
  const login = async () => {};
  const signup = async () => {};
  const logout = async () => {};
  const resetPassword = async () => {};
  const updatePassword = async () => {};
  const updateProfile = async () => {};
  const resendVerificationEmail = async () => {};
  const signInWithGoogle = () => {};
  const signInWithFacebook = () => {};
  const signInWithApple = () => {};

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    resendVerificationEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 