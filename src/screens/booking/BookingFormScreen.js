import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

export default function BookingFormScreen({ route, navigation }) {
  const { vendor } = route.params;
  const { addBooking } = useBooking();
  const { showActionSheetWithOptions } = useActionSheet();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    time: new Date(),
    guests: 1,
    selectedService: null,
    notes: '',
  });
  
  const handleDateSelect = () => {
    const options = ['Today', 'Tomorrow', 'Next Week', 'Next Month', 'Cancel'];
    const cancelButtonIndex = 4;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Select Date',
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;

        const today = new Date();
        let selectedDate = new Date();

        switch (selectedIndex) {
          case 0: // Today
            break;
          case 1: // Tomorrow
            selectedDate.setDate(today.getDate() + 1);
            break;
          case 2: // Next Week
            selectedDate.setDate(today.getDate() + 7);
            break;
          case 3: // Next Month
            selectedDate.setMonth(today.getMonth() + 1);
            break;
        }

        setFormData(prev => ({ ...prev, date: selectedDate }));
      }
    );
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

  const handleServiceSelect = (service) => {
    setFormData(prev => ({ ...prev, selectedService: service }));
  };

  const handleSubmit = () => {
    const booking = {
      id: Date.now().toString(),
      vendor,
      ...formData,
    };
    addBooking(booking);
    navigation.navigate('BookingCart');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={handleDateSelect}
        >
          <Icon name="event" color={colors.primary} size={24} />
          <Text style={styles.dateText}>
            {formData.date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
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

      {/* Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        {vendor.services?.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.serviceCard,
              formData.selectedService === service && styles.selectedService,
            ]}
            onPress={() => handleServiceSelect(service)}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </View>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </TouchableOpacity>
        ))}
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

      {/* Submit Button */}
      <Button
        title="Add to Cart"
        onPress={handleSubmit}
        buttonStyle={styles.submitButton}
        containerStyle={styles.submitButtonContainer}
        disabled={!formData.selectedService}
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
    ...typography.h3,
    marginBottom: spacing.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
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
  },
  selectedService: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 1,
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
  submitButtonContainer: {
    marginBottom: spacing.xl,
  },
}); 