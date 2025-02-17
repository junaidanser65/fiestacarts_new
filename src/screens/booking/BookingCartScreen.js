import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function BookingCartScreen({ navigation }) {
  const { bookings, removeBooking, clearBookings } = useBooking();

  const handleRemoveBooking = (bookingId) => {
    Alert.alert(
      'Remove Booking',
      'Are you sure you want to remove this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => removeBooking(bookingId),
          style: 'destructive',
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear all bookings?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: clearBookings,
          style: 'destructive',
        },
      ]
    );
  };

  const handleCheckout = () => {
    navigation.navigate('Payment', { bookings });
  };

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="shopping-cart" size={64} color={colors.textLight} />
        <Text style={styles.emptyText}>Your booking cart is empty</Text>
        <Button
          title="Browse Vendors"
          onPress={() => navigation.navigate('Dashboard')}
          buttonStyle={styles.browseButton}
          containerStyle={styles.browseButtonContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {bookings.map((booking) => (
          <Card key={booking.id} containerStyle={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View>
                <Text style={styles.vendorName}>{booking.vendor.name}</Text>
                <Text style={styles.vendorCategory}>{booking.vendor.category}</Text>
              </View>
              <Button
                icon={<Icon name="close" color={colors.error} />}
                type="clear"
                onPress={() => handleRemoveBooking(booking.id)}
              />
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Icon name="event" size={20} color={colors.textLight} />
                <Text style={styles.detailText}>{booking.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="access-time" size={20} color={colors.textLight} />
                <Text style={styles.detailText}>{booking.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="people" size={20} color={colors.textLight} />
                <Text style={styles.detailText}>{booking.guests} guests</Text>
              </View>
              {booking.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{booking.notes}</Text>
                </View>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Clear Cart"
          onPress={handleClearCart}
          buttonStyle={styles.clearButton}
          containerStyle={styles.clearButtonContainer}
          type="outline"
        />
        <Button
          title={`Checkout (${bookings.length})`}
          onPress={handleCheckout}
          buttonStyle={styles.checkoutButton}
          containerStyle={styles.checkoutButtonContainer}
          icon={<Icon name="payment" color={colors.background} style={styles.checkoutIcon} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  browseButtonContainer: {
    width: '80%',
  },
  bookingCard: {
    borderRadius: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
  },
  bookingDetails: {
    marginTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  notesContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  notesLabel: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.body,
    color: colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  clearButtonContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  clearButton: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  checkoutButtonContainer: {
    flex: 2,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  checkoutIcon: {
    marginRight: spacing.sm,
  },
}); 