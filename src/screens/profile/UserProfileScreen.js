import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Icon, Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const MENU_ITEMS = [
  {
    id: 'bookings',
    title: 'My Bookings',
    icon: 'event',
    screen: 'BookingHistory',
  },
  {
    id: 'payments',
    title: 'Payment Methods',
    icon: 'payment',
    screen: 'PaymentMethods',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications',
    screen: 'Notifications',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    screen: 'Settings',
  },
  {
    id: 'support',
    title: 'Help & Support',
    icon: 'help',
    screen: 'Support',
  },
  {
    id: 'about',
    title: 'About',
    icon: 'info',
    screen: 'About',
  },
];

export default function UserProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        <Button
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          buttonStyle={styles.editButton}
          type="outline"
        />
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Icon name={item.icon} color={colors.primary} size={24} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" color={colors.textLight} size={24} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={styles.logoutButton}
        titleStyle={styles.logoutButtonText}
        containerStyle={styles.logoutButtonContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h2,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
  },
  editButton: {
    borderColor: colors.background,
    borderRadius: 8,
  },
  menuContainer: {
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  logoutButtonContainer: {
    padding: spacing.lg,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  logoutButtonText: {
    ...typography.body,
    color: colors.background,
  },
}); 