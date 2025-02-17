import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Vendors & Caterers</Text>
        <Text style={styles.subtitle}>
          Find and book the perfect vendors for your events
        </Text>
      </View>
      
      <View style={styles.buttons}>
        <Button
          title="Login"
          onPress={() => navigation.navigate('Login')}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
        />
        <Button
          title="Sign Up"
          onPress={() => navigation.navigate('Signup')}
          containerStyle={styles.buttonContainer}
          buttonStyle={[styles.button, styles.secondaryButton]}
          titleStyle={styles.secondaryButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttons: {
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
}); 