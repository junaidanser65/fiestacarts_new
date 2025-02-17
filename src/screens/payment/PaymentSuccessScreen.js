import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { amount, bookings } = route.params;
  const { clearBookings, addBooking } = useBooking();

  useEffect(() => {
    // Save paid bookings to context
    bookings.forEach(booking => {
      addBooking(booking);
    });
    // Clear the cart
    clearBookings();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleViewBookings = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainApp',
          state: {
            index: 2, // Profile tab
            routes: [
              { name: 'Dashboard' },
              { name: 'Bookings' },
              {
                name: 'Profile'
              }
            ]
          }
        }
      ]
    });

    // After resetting to Profile tab, navigate to BookingHistory
    setTimeout(() => {
      navigation.navigate('BookingHistory', { initialTab: 'upcoming' });
    }, 100);
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Icon
          name="check-circle"
          color={colors.primary}
          size={80}
          style={styles.icon}
        />
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Total Amount Paid: ${amount.toLocaleString()}
        </Text>

        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          {bookings.map((booking) => (
            <Card key={booking.id} containerStyle={styles.bookingCard}>
              <Text style={styles.vendorName}>{booking.vendor.name}</Text>
              <Text style={styles.serviceInfo}>
                {booking.selectedServices.map(service => service.name).join(', ')}
              </Text>
              <Text style={styles.dateInfo}>
                {formatDate(booking.selectedDate)} at {formatTime(booking.time)}
              </Text>
              <Text style={styles.guestInfo}>
                {booking.guests} guests
              </Text>
            </Card>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="View My Bookings"
            onPress={handleViewBookings}
            buttonStyle={styles.viewBookingsButton}
            containerStyle={styles.buttonWrapper}
          />
          <Button
            title="Back to Home"
            onPress={handleBackToHome}
            buttonStyle={styles.homeButton}
            containerStyle={styles.buttonWrapper}
            type="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  bookingCard: {
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  serviceInfo: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  dateInfo: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  guestInfo: {
    ...typography.body,
    color: colors.textLight,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonWrapper: {
    marginBottom: spacing.md,
  },
  viewBookingsButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  homeButton: {
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
}); 