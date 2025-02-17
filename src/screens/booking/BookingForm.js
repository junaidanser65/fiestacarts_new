import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button, Input, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import TimeSlotPicker from '../../components/booking/TimeSlotPicker';

const BookingForm = ({ route, navigation }) => {
  const { vendor, selectedDate, availableSlots, selectedServices, totalPrice: basePrice } = route.params;
  const [selectedTime, setSelectedTime] = useState(null);
  const [guestCount, setGuestCount] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [totalPrice, setTotalPrice] = useState(basePrice);
  const { addBooking } = useBooking();
  const { user } = useAuth();

  // Update total price when guest count changes
  useEffect(() => {
    const guests = parseInt(guestCount) || 1;
    setTotalPrice(basePrice * guests);
  }, [guestCount, basePrice]);

  const handleSubmit = async () => {
    if (!selectedTime) {
      Alert.alert('Required', 'Please select a time slot');
      return;
    }

    if (!guestCount || isNaN(guestCount) || Number(guestCount) < 1) {
      Alert.alert('Invalid', 'Please enter a valid number of guests');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Total amount to pay: $${totalPrice.toLocaleString()}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // Create booking in database
              const bookingData = {
                user_id: user.id,
                vendor_id: vendor.id,
                booking_date: selectedDate,
                booking_time: selectedTime,
                guest_count: parseInt(guestCount),
                special_requests: specialRequests,
                total_price: totalPrice,
                status: 'pending',
                created_at: new Date().toISOString(),
              };

              // Insert booking
              const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert([bookingData])
                .select()
                .single();

              if (bookingError) throw bookingError;

              // Insert booking services
              const bookingServices = selectedServices.map(service => ({
                booking_id: booking.id,
                service_id: service.id,
                price: service.price * parseInt(guestCount),
              }));

              const { error: servicesError } = await supabase
                .from('booking_services')
                .insert(bookingServices);

              if (servicesError) throw servicesError;

              // Add to local context
              addBooking({
                ...booking,
                vendor,
                services: selectedServices,
              });

              // Navigate to Payment screen with correct name
              navigation.navigate('Payment', { booking });
            } catch (error) {
              console.error('Booking error:', error);
              Alert.alert('Error', 'Failed to create booking. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
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

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.title}>Booking Details</Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Event Date</Text>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Time</Text>
          <TimeSlotPicker
            availableSlots={availableSlots}
            selectedSlot={selectedTime}
            onSelectSlot={setSelectedTime}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Number of Guests</Text>
          <Input
            placeholder="Enter number of guests"
            keyboardType="number-pad"
            value={guestCount}
            onChangeText={setGuestCount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Selected Services</Text>
          {selectedServices.map(service => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>
                  ${service.price.toLocaleString()} × {guestCount} guests
                </Text>
              </View>
              <Text style={styles.servicePrice}>
                ${(service.price * parseInt(guestCount)).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Special Requests</Text>
          <Input
            placeholder="Any special requirements?"
            multiline
            numberOfLines={4}
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />
        </View>

        <Button
          title="Confirm Booking"
          onPress={handleSubmit}
          disabled={!selectedTime || !guestCount}
          buttonStyle={styles.confirmButton}
          titleStyle={styles.confirmButtonText}
          disabledStyle={styles.disabledButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  dateContainer: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.body,
    color: colors.primary,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  serviceDescription: {
    ...typography.caption,
    color: colors.textLight,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.md,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  confirmButtonText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
});

export default BookingForm; 