import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
            setSuccess(false);
          }}
          leftIcon={<Icon name="email" color={colors.primary} size={20} />}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          disabled={loading}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : success ? (
          <Text style={styles.successText}>
            Reset instructions have been sent to your email
          </Text>
        ) : null}

        <Button
          title={success ? "Resend Email" : "Send Reset Link"}
          onPress={handleResetPassword}
          loading={loading}
          buttonStyle={styles.resetButton}
          containerStyle={styles.buttonContainer}
        />

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          If you're still having trouble, please contact{' '}
          <Text 
            style={styles.supportLink}
            onPress={() => navigation.navigate('Support')}
          >
            customer support
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginVertical: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.caption,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    marginVertical: spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loginText: {
    ...typography.body,
    color: colors.primary,
  },
  helpContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  helpText: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textLight,
  },
  supportLink: {
    color: colors.primary,
  },
}); 