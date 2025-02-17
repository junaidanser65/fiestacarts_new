import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Icon, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { amount, bookings } = route.params;
  const { clearBookings } = useBooking();

  const handleViewBookings = () => {
    clearBookings();
    navigation.navigate('BookingHistory');
  };

  const handleBackToHome = () => {
    clearBookings();
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <Icon 
            name="check-circle" 
            color={colors.success} 
            size={100} 
            style={styles.successIcon}
          />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Your bookings have been confirmed</Text>
        <Text style={styles.amount}>${amount}</Text>

        {/* Booking Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          {bookings.map((booking) => (
            <Card key={booking.id} containerStyle={styles.bookingCard}>
              <Text style={styles.vendorName}>{booking.vendor.name}</Text>
              <Text style={styles.serviceInfo}>
                {booking.selectedService.name} - {booking.guests} guests
              </Text>
              <Text style={styles.dateInfo}>
                {booking.date.toLocaleDateString()} at{' '}
                {booking.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Card>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="email" color={colors.primary} size={24} />
            <Text style={styles.infoText}>Confirmation email sent</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="calendar" color={colors.primary} size={24} />
            <Text style={styles.infoText}>Added to your calendar</Text>
          </View>
        </View>

        {/* Action Buttons */}
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
    padding: spacing.lg,
    alignItems: 'center',
  },
  animationContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  summaryContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
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
  },
  infoContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonWrapper: {
    marginBottom: spacing.md,
  },
  viewBookingsButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  homeButton: {
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
}); 