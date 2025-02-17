import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';

// Mock data - replace with API call later
const MOCK_BOOKINGS = [
  {
    id: '1',
    vendor: {
      name: 'Gourmet Catering Co.',
      category: 'Catering',
      image: 'https://via.placeholder.com/300x200',
    },
    service: {
      name: 'Full-Service Catering',
      price: '$25 per person',
    },
    date: new Date('2024-03-15'),
    time: new Date('2024-03-15T14:00:00'),
    guests: 50,
    status: 'upcoming',
    totalAmount: 1250,
  },
  {
    id: '2',
    vendor: {
      name: 'Royal Palace',
      category: 'Venues',
      image: 'https://via.placeholder.com/300x200',
    },
    service: {
      name: 'Wedding Reception Hall',
      price: '$2000',
    },
    date: new Date('2024-02-01'),
    time: new Date('2024-02-01T18:00:00'),
    guests: 150,
    status: 'completed',
    totalAmount: 2000,
  },
  // Add more mock bookings...
];

export default function BookingHistoryScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { bookings } = useBooking();

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params]);

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

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.selectedDate);
      
      if (activeTab === 'upcoming') {
        // Show both confirmed and paid bookings in upcoming
        return bookingDate >= now && 
          (booking.status === 'confirmed' || booking.status === 'paid');
      } else {
        // Show completed and past bookings
        return bookingDate < now || booking.status === 'completed';
      }
    }).sort((a, b) => {
      // Sort by date, most recent first for upcoming, oldest first for past
      const dateA = new Date(a.selectedDate);
      const dateB = new Date(b.selectedDate);
      return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'paid':
        return {
          badge: styles.paidBadge,
          text: { ...styles.statusText, color: colors.success }
        };
      case 'confirmed':
        return {
          badge: styles.confirmedBadge,
          text: { ...styles.statusText, color: colors.primary }
        };
      case 'completed':
        return {
          badge: styles.completedBadge,
          text: { ...styles.statusText, color: colors.textLight }
        };
      default:
        return {
          badge: styles.defaultBadge,
          text: styles.statusText
        };
    }
  };

  const renderBookingCard = (booking) => (
    <Card key={booking.id} containerStyle={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{booking.vendor.name}</Text>
          <Text style={styles.vendorCategory}>{booking.vendor.category}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(booking.status).badge]}>
          <Text style={getStatusBadgeStyle(booking.status).text}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.dateTimeContainer}>
        <Icon name="event" size={16} color={colors.textLight} />
        <Text style={styles.dateTimeText}>
          {formatDate(booking.selectedDate)}
        </Text>
      </View>
      <View style={styles.dateTimeContainer}>
        <Icon name="access-time" size={16} color={colors.textLight} />
        <Text style={styles.dateTimeText}>
          {formatTime(booking.time)}
        </Text>
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Services</Text>
        {booking.selectedServices.map(service => (
          <View key={service.id} style={styles.serviceItem}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>
              ${(service.price * booking.guests).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.guestContainer}>
        <Icon name="people" size={16} color={colors.textLight} />
        <Text style={styles.guestText}>
          {booking.guests} guests
        </Text>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>
          ${(booking.totalPrice * booking.guests).toLocaleString()}
        </Text>
      </View>

      {activeTab === 'upcoming' && (
        <Button
          title="View Details"
          type="outline"
          buttonStyle={styles.detailsButton}
          titleStyle={styles.detailsButtonText}
          onPress={() => navigation.navigate('BookingDetails', { booking })}
        />
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {getFilteredBookings().length > 0 ? (
          getFilteredBookings().map(renderBookingCard)
        ) : (
          <View style={styles.emptyState}>
            <Icon 
              name={activeTab === 'upcoming' ? 'event-busy' : 'history'} 
              size={64} 
              color={colors.textLight} 
            />
            <Text style={styles.emptyStateText}>
              No {activeTab} bookings found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  bookingCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs / 2,
  },
  vendorCategory: {
    ...typography.caption,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  paidBadge: {
    backgroundColor: colors.success + '20',
  },
  confirmedBadge: {
    backgroundColor: colors.primary + '20',
  },
  completedBadge: {
    backgroundColor: colors.textLight + '20',
  },
  defaultBadge: {
    backgroundColor: colors.surface,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateTimeText: {
    ...typography.body,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  servicesContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
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
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  guestText: {
    ...typography.body,
    color: colors.textLight,
    marginLeft: spacing.sm,
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
  detailsButton: {
    marginTop: spacing.md,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },
}); 