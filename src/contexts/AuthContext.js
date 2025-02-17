import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

const AuthContext = createContext();

// Use your app's URL scheme
const redirectUrl = Platform.select({
  ios: 'vendorapp://',
  android: 'vendorapp://',
  web: 'http://localhost:3000',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Fetched profile:', data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        console.log('Session:', session);

        if (session?.user) {
          // Check if email is verified
          if (!session.user.email_confirmed_at && event !== 'SIGNED_UP') {
            setUser(null);
            setLoading(false);
            // If on verification screen, show message
            if (event === 'TOKEN_REFRESHED') {
              Alert.alert(
                'Email Not Verified',
                'Please verify your email address to continue.'
              );
            }
            return;
          }

          if (event === 'EMAIL_CONFIRMED') {
            Alert.alert(
              'Email Verified',
              'Your email has been verified successfully. You can now log in.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Clear any stored credentials
                    AsyncStorage.removeItem('supabase.auth.token');
                    // Navigate to login
                    navigation.navigate('Login');
                  },
                },
              ]
            );
            return;
          }

          const profile = await fetchProfile(session.user.id);
          
          if (!profile) {
            console.warn('No profile found for user:', session.user.id);
            // Attempt to create profile if it doesn't exist
            try {
              const { error: createError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    id: session.user.id,
                    first_name: session.user.user_metadata?.first_name || '',
                    last_name: session.user.user_metadata?.last_name || '',
                    avatar_url: null,
                  },
                ])
                .select()
                .single();
              
              if (createError) throw createError;
            } catch (error) {
              console.error('Error creating profile:', error);
            }
          }

          setUser({
            ...session.user,
            ...profile,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSocialLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url);

        if (result.type === 'success') {
          WebBrowser.dismissAuthSession();
        }
      }
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  };

  const signInWithGoogle = () => handleSocialLogin('google');
  const signInWithFacebook = () => handleSocialLogin('facebook');
  const signInWithApple = () => handleSocialLogin('apple');

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signup = async (userData) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData?.user) {
        throw new Error('No user data after signup');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            avatar_url: null,
          },
        ])
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        if (profileError.code === '42501') {
          // Permission error, try with upsert instead
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: authData.user.id,
                first_name: userData.firstName,
                last_name: userData.lastName,
                avatar_url: null,
              },
            ])
            .select();
          
          if (upsertError) {
            console.error('Upsert error:', upsertError);
            throw new Error('Failed to create profile. Please try again.');
          }
        } else {
          throw new Error('Failed to create profile. Please try again.');
        }
      }

      return {
        message: 'Signup successful! Please check your email for verification.',
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message.includes('duplicate key')) {
        throw new Error('An account with this email already exists.');
      }
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setUser(prev => ({ ...prev, ...updates }));
  };

  const resendVerificationEmail = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      signInWithGoogle,
      signInWithFacebook,
      signInWithApple,
      resendVerificationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 