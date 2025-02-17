import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Icon, Card, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'payment' },
  { id: 'bank', name: 'Bank Transfer', icon: 'account-balance' },
];

export default function PaymentScreen({ route, navigation }) {
  const { bookings } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const calculateTotal = () => {
    return bookings.reduce((total, booking) => {
      const basePrice = parseFloat(booking.selectedService.price.replace(/[^0-9.]/g, ''));
      return total + (basePrice * booking.guests);
    }, 0);
  };

  const handlePayment = () => {
    // TODO: Implement payment processing
    navigation.navigate('PaymentSuccess', {
      amount: calculateTotal(),
      bookings: bookings,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
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
            <Text style={styles.price}>
              ${parseFloat(booking.selectedService.price.replace(/[^0-9.]/g, '')) * booking.guests}
            </Text>
          </Card>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${calculateTotal()}</Text>
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethod,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Icon name={method.icon} color={colors.primary} size={24} />
            <Text style={styles.methodName}>{method.name}</Text>
            {selectedMethod === method.id && (
              <Icon name="check-circle" color={colors.primary} size={24} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Details Form */}
      {selectedMethod === 'card' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <Input
            placeholder="Card Number"
            value={cardDetails.number}
            onChangeText={(text) => setCardDetails(prev => ({ ...prev, number: text }))}
            leftIcon={<Icon name="credit-card" color={colors.textLight} />}
            keyboardType="number-pad"
            maxLength={16}
          />
          <View style={styles.row}>
            <Input
              containerStyle={styles.halfInput}
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChangeText={(text) => setCardDetails(prev => ({ ...prev, expiry: text }))}
              keyboardType="number-pad"
              maxLength={5}
            />
            <Input
              containerStyle={styles.halfInput}
              placeholder="CVV"
              value={cardDetails.cvv}
              onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvv: text }))}
              keyboardType="number-pad"
              maxLength={3}
              secureTextEntry
            />
          </View>
          <Input
            placeholder="Cardholder Name"
            value={cardDetails.name}
            onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
            leftIcon={<Icon name="person" color={colors.textLight} />}
          />
        </View>
      )}

      {/* Pay Button */}
      <Button
        title={`Pay $${calculateTotal()}`}
        onPress={handlePayment}
        buttonStyle={styles.payButton}
        containerStyle={styles.payButtonContainer}
        disabled={selectedMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)}
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  selectedMethod: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  methodName: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    margin: spacing.lg,
  },
  payButtonContainer: {
    marginBottom: spacing.xl,
  },
}); 