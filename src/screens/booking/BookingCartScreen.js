import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Animated, Pressable, Modal } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function BookingCartScreen({ route, navigation }) {
  const { booking } = route.params || {};
  const [isMounted, setIsMounted] = useState(false);
  const { bookings, removeBooking, clearBookings } = useBooking();

  // Filter out paid bookings and handle empty bookings
  const unpaidBookings = bookings?.filter(booking => booking?.status !== 'paid') || [];

  // Empty cart view
  if (!unpaidBookings.length) {
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
    removeBooking(bookingId);
  };

  const handleClearCart = () => {
    clearBookings();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {unpaidBookings.map((booking) => {
          if (!booking || !booking.vendor) return null;
          
          return (
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

              {/* Status Badge */}
              <View style={styles.statusContainer}>
                <Text style={[
                  styles.statusText,
                  booking.status === 'pending_payment' && styles.pendingStatus,
                  booking.status === 'paid' && styles.paidStatus
                ]}>
                  {booking.status === 'pending_payment' ? 'PENDING PAYMENT' : booking.status.toUpperCase()}
                </Text>
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
          );
        })}
      </ScrollView>

      {unpaidBookings.length > 0 && (
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
            title={`Checkout (${unpaidBookings.length})`}
            onPress={() => navigation.navigate('Payment', { 
              bookings: unpaidBookings 
            })}
            buttonStyle={styles.checkoutButton}
            containerStyle={styles.checkoutButtonContainer}
            icon={<Icon name="payment" color={colors.white} style={styles.checkoutIcon} />}
          />
        </View>
      )}
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
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    elevation: 3,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    transform: [{ scale: 1 }],
    transition: 'all 0.3s ease',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
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
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  servicesContainer: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceName: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
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
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
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
    paddingVertical: spacing.sm,
    elevation: 2,
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
  statusContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.button,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  pendingStatus: {
    color: colors.white,
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  paidStatus: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  '@media (hover: hover)': {
    bookingCard: {
      '&:hover': {
        transform: [{ scale: 1.02 }],
        elevation: 4,
      },
    },
  },
  removingCard: {
    opacity: 0,
    transform: [{ scale: 0.9 }, { translateY: 20 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  modalButtonWidth: {
    flex: 1,
  },
  modalCancelButton: {
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  modalConfirmButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
  },
  modalCancelButtonText: {
    color: colors.text,
    ...typography.button,
  },
  modalConfirmButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    ...typography.button,
  },
}); 