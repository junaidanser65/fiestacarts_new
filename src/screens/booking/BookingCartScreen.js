import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function BookingCartScreen({ navigation }) {
  const { bookings, removeBooking, clearBookings } = useBooking();

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const timeObj = new Date(time);
    return timeObj.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
    // Convert Date objects to strings before navigation, with safety checks
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      time: booking.time ? 
        (typeof booking.time === 'string' ? booking.time : booking.time.toISOString()) 
        : new Date().toISOString(),
      selectedDate: booking.selectedDate ? 
        (typeof booking.selectedDate === 'string' ? booking.selectedDate : booking.selectedDate.toISOString()) 
        : new Date().toISOString(),
      createdAt: booking.createdAt ? 
        (typeof booking.createdAt === 'string' ? booking.createdAt : booking.createdAt.toISOString()) 
        : new Date().toISOString(),
      status: 'pending_payment'
    }));

    navigation.navigate('Payment', { bookings: serializedBookings });
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {bookings.map((booking) => (
          <Card key={booking.id} containerStyle={styles.bookingCard}>
            {/* Vendor Info */}
            <View style={styles.bookingHeader}>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{booking.vendor.name}</Text>
                <Text style={styles.vendorCategory}>{booking.vendor.category}</Text>
              </View>
              <Button
                icon={<Icon name="close" color={colors.error} size={20} />}
                type="clear"
                onPress={() => handleRemoveBooking(booking.id)}
                containerStyle={styles.removeButton}
              />
            </View>

            {/* Booking Details */}
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Icon name="event" size={18} color={colors.textLight} />
                <Text style={styles.detailText}>
                  {formatDate(booking.selectedDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="access-time" size={18} color={colors.textLight} />
                <Text style={styles.detailText}>
                  {formatTime(booking.time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="people" size={18} color={colors.textLight} />
                <Text style={styles.detailText}>
                  {booking.guests} guests
                </Text>
              </View>
            </View>

            {/* Services */}
            <View style={styles.servicesContainer}>
              <Text style={styles.sectionTitle}>Selected Services</Text>
              {booking.selectedServices.map((service) => (
                <View key={service.id} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>
                    ${(service.price * booking.guests).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ${(booking.totalPrice * booking.guests).toLocaleString()}
              </Text>
            </View>

            {/* Notes if any */}
            {booking.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Special Requests:</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Clear Cart"
          onPress={handleClearCart}
          buttonStyle={styles.clearButton}
          containerStyle={styles.clearButtonContainer}
          titleStyle={styles.clearButtonText}
          type="outline"
        />
        <Button
          title={`Checkout (${bookings.length})`}
          onPress={handleCheckout}
          buttonStyle={styles.checkoutButton}
          containerStyle={styles.checkoutButtonContainer}
          icon={<Icon name="payment" color={colors.white} style={styles.checkoutIcon} />}
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
  scrollContent: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xl,
  },
  bookingCard: {
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  vendorCategory: {
    ...typography.caption,
    color: colors.textLight,
  },
  removeButton: {
    marginTop: -spacing.xs,
    marginRight: -spacing.xs,
  },
  bookingDetails: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  detailText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  servicesContainer: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs / 2,
  },
  serviceName: {
    ...typography.caption,
    flex: 1,
    color: colors.text,
  },
  servicePrice: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalAmount: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.primary,
  },
  notesContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  notesLabel: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  notesText: {
    ...typography.caption,
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
  clearButtonText: {
    color: colors.error,
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
}); 