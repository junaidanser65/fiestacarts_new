import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../styles/theme';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import MainDashboardScreen from '../screens/dashboard/MainDashboardScreen';
import ProfileScreen from '../screens/profile/UserProfileScreen';
import BookingCartScreen from '../screens/booking/BookingCartScreen';
import VendorDetailsScreen from '../screens/vendor/VendorDetailsScreen';
import BookingFormScreen from '../screens/booking/BookingFormScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import BookingHistoryScreen from '../screens/profile/BookingHistoryScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import FullMapScreen from '../screens/map/FullMapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Bookings') {
            iconName = 'shopping-cart';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={MainDashboardScreen}
      />
      <Tab.Screen name="Bookings" component={BookingCartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const linking = {
  prefixes: ['vendorapp://'],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      MainApp: {
        screens: {
          Profile: 'profile',
        },
      },
    },
  },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen}
              options={{
                gestureEnabled: false,
              }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen 
              name="VendorDetails" 
              component={VendorDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="FullMap" 
              component={FullMapScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookingForm"
              component={BookingFormScreen}
              options={{
                headerShown: true,
                headerTitle: 'Book Service',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{
                headerShown: true,
                headerTitle: 'Payment',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="PaymentSuccess"
              component={PaymentSuccessScreen}
              options={{ 
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                headerTitle: 'Edit Profile',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="BookingHistory"
              component={BookingHistoryScreen}
              options={{
                headerShown: true,
                headerTitle: 'Booking History',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="BookingDetails"
              component={BookingDetailsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Booking Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Payment Methods',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Notifications',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Settings',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Privacy"
              component={PrivacyPolicyScreen}
              options={{
                headerShown: true,
                headerTitle: 'Privacy Policy',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Terms of Service',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Support"
              component={SupportScreen}
              options={{
                headerShown: true,
                headerTitle: 'Help & Support',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{
                headerShown: true,
                headerTitle: 'About',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 