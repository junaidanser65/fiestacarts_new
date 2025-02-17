import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import BackButton from '../../components/common/BackButton';

export default function BookingFormScreen({ route, navigation }) {
  const { vendor, selectedDate, selectedServices } = route.params;
  const { addBooking } = useBooking();
  const { showActionSheetWithOptions } = useActionSheet();
  
  const [formData, setFormData] = useState({
    time: new Date(),
    guests: 1,
    notes: '',
  });

  // Calculate total price based on current guest count
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.price * formData.guests);
    }, 0);
  };

  const handleTimeSelect = () => {
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
      '5:00 PM', '6:00 PM', 'Cancel'
    ];
    const cancelButtonIndex = timeSlots.length - 1;

    showActionSheetWithOptions(
      {
        options: timeSlots,
        cancelButtonIndex,
        title: 'Select Time',
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;

        const [hours, period] = timeSlots[selectedIndex].split(/[: ]/);
        const selectedTime = new Date();
        selectedTime.setHours(
          period === 'PM' ? (parseInt(hours) + 12) % 24 : parseInt(hours),
          0, 0, 0
        );

        setFormData(prev => ({ ...prev, time: selectedTime }));
      }
    );
  };

  const handleGuestChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(100, prev.guests + increment)),
    }));
  };

  const handleSubmit = () => {
    if (!formData.time) {
      Alert.alert('Required', 'Please select a time slot');
      return;
    }

    const currentTotal = calculateTotal();

    Alert.alert(
      'Confirm Booking',
      `Total amount: $${currentTotal.toLocaleString()}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            const booking = {
              id: Date.now().toString(),
              vendor,
              selectedDate: new Date(selectedDate).toISOString(),
              selectedServices,
              totalPrice: currentTotal, // Use calculated total
              time: formData.time.toISOString(),
              guests: formData.guests,
              notes: formData.notes,
              status: 'pending',
              createdAt: new Date().toISOString(),
            };

            addBooking(booking);

            // Show success message and navigate to cart
            Alert.alert(
              'Booking Added',
              'Your booking has been added to cart!',
              [
                {
                  text: 'View Cart',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'MainApp',
                          state: {
                            routes: [{ name: 'Bookings' }]
                          }
                        }
                      ],
                    });
                  }
                },
                {
                  text: 'Continue Shopping',
                  onPress: () => navigation.navigate('Dashboard'),
                }
              ]
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Date (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Date</Text>
          <View style={styles.infoContainer}>
            <Icon name="event" color={colors.primary} size={24} />
            <Text style={styles.infoText}>
              {formatDate(selectedDate)}
            </Text>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={handleTimeSelect}
          >
            <Icon name="access-time" color={colors.primary} size={24} />
            <Text style={styles.dateText}>
              {formData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
          <View style={styles.guestCounter}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGuestChange(-1)}
            >
              <Icon name="remove" color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{formData.guests}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGuestChange(1)}
            >
              <Icon name="add" color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Services (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          {selectedServices.map((service, index) => (
            <View
              key={index}
              style={styles.serviceCard}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <Text style={styles.servicePrice}>
                ${(service.price * formData.guests).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              ${calculateTotal().toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Input
            multiline
            numberOfLines={4}
            placeholder="Any special requirements or requests..."
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            containerStyle={styles.notesContainer}
            inputStyle={styles.notesInput}
          />
        </View>

        {/* Submit Button - Updated text and styles */}
        <Button
          title="Confirm Booking"
          onPress={handleSubmit}
          buttonStyle={[styles.submitButton, styles.confirmButton]}
          containerStyle={styles.submitButtonContainer}
          titleStyle={styles.confirmButtonText}
          disabled={!formData.time || formData.guests < 1}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButtonContainer: {
    position: 'absolute',
    top: spacing.xl + spacing.xs,
    left: spacing.md,
    zIndex: 1,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    paddingTop: spacing.xl * 2,
  },
  header: {
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.text,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  infoText: {
    ...typography.body,
    marginLeft: spacing.md,
    color: colors.primary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateText: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  guestCount: {
    ...typography.h2,
    marginHorizontal: spacing.xl,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  serviceTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...typography.body,
    color: colors.textLight,
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
    marginTop: spacing.md,
    paddingTop: spacing.md,
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
  notesContainer: {
    paddingHorizontal: 0,
  },
  notesInput: {
    ...typography.body,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    margin: spacing.lg,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    elevation: 2,
  },
  confirmButtonText: {
    ...typography.button,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  submitButtonContainer: {
    marginBottom: spacing.xl,
  },
  icon: {
    color: colors.primary,
  },
  activeButton: {
    backgroundColor: colors.primaryLight,
  },
}); 