import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, Animated } from 'react-native';
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;

  const animateModal = (anim, show) => {
    Animated.spring(anim, {
      toValue: show ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

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
    setShowConfirmModal(true);
    animateModal(modalScaleAnim, true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const ConfirmationModal = () => (
    <Modal
      transparent
      visible={showConfirmModal}
      animationType="fade"
      onRequestClose={() => {
        setShowConfirmModal(false);
        animateModal(modalScaleAnim, false);
      }}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  scale: modalScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="event-available" size={50} color={colors.primary} />
          <Text style={styles.modalTitle}>Confirm Booking</Text>
          <Text style={styles.modalTotal}>
            Total Amount: ${calculateTotal().toLocaleString()}
          </Text>
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              type="outline"
              buttonStyle={styles.modalCancelButton}
              titleStyle={styles.modalCancelButtonText}
              onPress={() => {
                setShowConfirmModal(false);
                animateModal(modalScaleAnim, false);
              }}
            />
            <Button
              title="Confirm"
              buttonStyle={styles.modalConfirmButton}
              titleStyle={styles.modalConfirmButtonText}
              onPress={() => {
                setShowConfirmModal(false);
                const booking = {
                  id: Date.now().toString(),
                  vendor,
                  selectedDate: new Date(selectedDate).toISOString(),
                  selectedServices,
                  totalPrice: calculateTotal(),
                  time: formData.time.toISOString(),
                  guests: formData.guests,
                  notes: formData.notes,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                };

                addBooking(booking);
                setShowSuccessModal(true);
                animateModal(successScaleAnim, true);
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const SuccessModal = () => (
    <Modal
      transparent
      visible={showSuccessModal}
      animationType="fade"
      onRequestClose={() => {
        setShowSuccessModal(false);
        animateModal(successScaleAnim, false);
      }}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            styles.successModalContent,
            {
              transform: [
                {
                  scale: successScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={60} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Booking Added!</Text>
          <Text style={styles.successMessage}>
            Your booking has been successfully added to cart
          </Text>
          <View style={styles.successButtons}>
            <Button
              title="View Cart"
              buttonStyle={styles.viewCartButton}
              titleStyle={styles.viewCartButtonText}
              icon={
                <Icon
                  name="shopping-cart"
                  size={20}
                  color={colors.white}
                  style={{ marginRight: spacing.sm }}
                />
              }
              onPress={() => {
                setShowSuccessModal(false);
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
              }}
            />
            <Button
              title="Continue Shopping"
              type="outline"
              buttonStyle={styles.continueButton}
              titleStyle={styles.continueButtonText}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Dashboard');
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

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
      <ConfirmationModal />
      <SuccessModal />
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
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  modalTotal: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    borderColor: colors.error,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
  },
  modalCancelButtonText: {
    color: colors.error,
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
  },
  modalConfirmButtonText: {
    color: colors.white,
  },
  successModalContent: {
    backgroundColor: colors.white,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successButtons: {
    width: '100%',
    gap: spacing.md,
  },
  viewCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
  },
  viewCartButtonText: {
    ...typography.button,
    fontSize: 16,
  },
  continueButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  continueButtonText: {
    color: colors.primary,
  },
}); 