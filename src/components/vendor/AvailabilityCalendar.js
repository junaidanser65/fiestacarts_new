import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const AvailabilityCalendar = ({ availability = [], selectedDate, onDateSelect }) => {
  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: date.toISOString().split('T')[0],
    };
  };

  // For testing purposes, make all dates available if no availability data
  const isDateAvailable = (dateString) => {
    if (availability.length === 0) {
      return true; // Make all dates available if no availability data
    }
    return availability.some(a => a.date === dateString && a.is_available);
  };

  const dates = generateDates();

  const handleDatePress = (date) => {
    console.log('Date pressed:', date); // For debugging
    onDateSelect(date);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {dates.map((date) => {
          const formattedDate = formatDate(date);
          const isAvailable = isDateAvailable(formattedDate.full);
          const isSelected = selectedDate === formattedDate.full;

          return (
            <TouchableOpacity
              key={formattedDate.full}
              style={[
                styles.dateContainer,
                isAvailable && styles.availableDate,
                isSelected && styles.selectedDate,
                !isAvailable && styles.unavailableDate,
              ]}
              onPress={() => handleDatePress(formattedDate.full)}
              disabled={!isAvailable}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedText,
                !isAvailable && styles.unavailableText
              ]}>
                {formattedDate.day}
              </Text>
              <Text style={[
                styles.dateText,
                isSelected && styles.selectedText,
                !isAvailable && styles.unavailableText
              ]}>
                {formattedDate.date}
              </Text>
              <Text style={[
                styles.monthText,
                isSelected && styles.selectedText,
                !isAvailable && styles.unavailableText
              ]}>
                {formattedDate.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dateContainer: {
    width: 70,
    height: 90,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  availableDate: {
    borderColor: colors.primary,
  },
  selectedDate: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unavailableDate: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.border,
    opacity: 0.6,
  },
  dayText: {
    ...typography.caption,
    color: colors.text,
  },
  dateText: {
    ...typography.h2,
    color: colors.text,
    marginVertical: 2,
  },
  monthText: {
    ...typography.caption,
    color: colors.text,
  },
  selectedText: {
    color: colors.white,
  },
  unavailableText: {
    color: colors.textLight,
  },
});

export default AvailabilityCalendar; 