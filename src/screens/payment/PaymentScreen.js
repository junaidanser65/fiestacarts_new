import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Icon, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function PaymentScreen({ route, navigation }) {
  const { bookings } = route.params; // Get bookings from route params
  const [selectedMethod, setSelectedMethod] = useState('card');
  const { updateBooking } = useBooking();

  const calculateTotal = () => {
    return bookings.reduce((total, booking) => {
      return total + (booking.totalPrice * booking.guests);
    }, 0);
  };

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

  const handlePayment = () => {
    try {
      // Process each booking
      const processedBookings = bookings.map(booking => {
        const updatedBooking = {
          ...booking,
          vendor: booking.vendor,
          selectedDate: booking.selectedDate,
          time: booking.time,
          guests: booking.guests,
          selectedServices: booking.selectedServices,
          totalPrice: booking.totalPrice,
          notes: booking.notes || '',
          status: 'paid',
          paymentDate: new Date().toISOString()
        };

        // Update each booking in the context
        updateBooking(updatedBooking);
        return updatedBooking;
      });

      // Navigate to success screen
      navigation.navigate('PaymentSuccess', {
        amount: calculateTotal(),
        bookings: processedBookings,
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {bookings.map((booking) => (
          <Card key={booking.id} containerStyle={styles.bookingCard}>
            <Text style={styles.vendorName}>{booking.vendor.name}</Text>
            <View style={styles.bookingDetails}>
              <Text style={styles.dateInfo}>
                {formatDate(booking.selectedDate)} at {formatTime(booking.time)}
              </Text>
              <Text style={styles.guestInfo}>
                {booking.guests} guests
              </Text>
            </View>
            {booking.selectedServices.map(service => (
              <View key={service.id} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  ${(service.price * booking.guests).toLocaleString()}
                </Text>
              </View>
            ))}
          </Card>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${calculateTotal().toLocaleString()}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'card' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('card')}
        >
          <Icon name="credit-card" color={colors.primary} size={24} />
          <Text style={styles.methodName}>Credit/Debit Card</Text>
          {selectedMethod === 'card' && (
            <Icon name="check-circle" color={colors.primary} size={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* Card Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Details</Text>
        <Input
          placeholder="Card Number"
          leftIcon={<Icon name="credit-card" color={colors.textLight} size={20} />}
          keyboardType="number-pad"
        />
        <View style={styles.cardRow}>
          <Input
            containerStyle={styles.expiryInput}
            placeholder="MM/YY"
            keyboardType="number-pad"
          />
          <Input
            containerStyle={styles.cvvInput}
            placeholder="CVV"
            keyboardType="number-pad"
            secureTextEntry
          />
        </View>
        <Input
          placeholder="Cardholder Name"
          leftIcon={<Icon name="person" color={colors.textLight} size={20} />}
        />
      </View>

      <Button
        title={`Pay $${calculateTotal().toLocaleString()}`}
        onPress={handlePayment}
        buttonStyle={styles.payButton}
        containerStyle={styles.payButtonContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  bookingCard: {
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  bookingDetails: {
    marginBottom: spacing.sm,
  },
  dateInfo: {
    ...typography.body,
    color: colors.textLight,
  },
  guestInfo: {
    ...typography.body,
    color: colors.textLight,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  serviceName: {
    ...typography.body,
    flex: 1,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h3,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  methodName: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
  },
  expiryInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cvvInput: {
    flex: 1,
  },
  payButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
  },
  payButtonContainer: {
    marginBottom: spacing.xl,
  },
}); 