import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import BackButton from '../../components/common/BackButton';

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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Set initial tab when screen mounts or route params change
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
    
    // If coming from payment, scroll to top and focus on the booking
    if (route.params?.fromPayment) {
      // Any additional logic you want to add when coming from payment
      // Like scrolling to top or highlighting the new booking
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
          container: styles.statusBadge,
          style: styles.paidBadge,
          textStyle: styles.paidText
        };
      case 'confirmed':
        return {
          container: styles.statusBadge,
          style: styles.confirmedBadge,
          textStyle: styles.confirmedText
        };
      case 'completed':
        return {
          container: styles.statusBadge,
          style: styles.completedBadge,
          textStyle: styles.completedText
        };
      default:
        return {
          container: styles.statusBadge,
          style: styles.defaultBadge,
          textStyle: styles.defaultText
        };
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const BookingDetailsModal = ({ booking, visible, onClose }) => {
    if (!booking) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Vendor Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Vendor</Text>
                <Text style={styles.detailValue}>{booking.vendor.name}</Text>
                <Text style={styles.detailSubtext}>{booking.vendor.category}</Text>
              </View>

              {/* Status */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    getStatusBadgeStyle(booking.status).container,
                    getStatusBadgeStyle(booking.status).style,
                    styles.modalStatusBadge
                  ]}>
                    <Text style={getStatusBadgeStyle(booking.status).textStyle}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatDate(booking.selectedDate)}</Text>
                <Text style={styles.detailSubtext}>{formatTime(booking.time)}</Text>
              </View>

              {/* Services */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Services</Text>
                {booking.selectedServices.map(service => (
                  <View key={service.id} style={styles.serviceItem}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>
                      ${(service.price * booking.guests).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Guests */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Number of Guests</Text>
                <Text style={styles.detailValue}>{booking.guests} people</Text>
              </View>

              {/* Contact Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Vendor Contact</Text>
                <Text style={styles.detailValue}>{booking.vendor.contact_phone}</Text>
                <Text style={styles.detailSubtext}>{booking.vendor.contact_email}</Text>
              </View>

              {/* Total Amount */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={[styles.detailValue, styles.totalAmount]}>
                  ${(booking.totalPrice * booking.guests).toLocaleString()}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={onClose}
                buttonStyle={styles.closeModalButton}
                titleStyle={styles.closeModalButtonText}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderBookingCard = (booking) => (
    <Card key={booking.id} containerStyle={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{booking.vendor.name}</Text>
          <Text style={styles.vendorCategory}>{booking.vendor.category}</Text>
        </View>
        <View style={[
          getStatusBadgeStyle(booking.status).container,
          getStatusBadgeStyle(booking.status).style
        ]}>
          <Text style={getStatusBadgeStyle(booking.status).textStyle}>
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

      <Button
        title="View Details"
        type="outline"
        buttonStyle={styles.detailsButton}
        titleStyle={styles.detailsButtonText}
        onPress={() => handleViewDetails(booking)}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonCircle}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
      </View>
      <View style={styles.content}>
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

      <BookingDetailsModal
        booking={selectedBooking}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedBooking(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xl + spacing.xs,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
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
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },
  content: {
    flex: 1,
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
  paidText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.success,
  },
  confirmedBadge: {
    backgroundColor: colors.primary + '20',
  },
  confirmedText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  completedBadge: {
    backgroundColor: colors.textLight + '20',
  },
  completedText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  defaultBadge: {
    backgroundColor: colors.surface,
  },
  defaultText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.textLight,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.md,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.h3,
    color: colors.text,
  },
  detailSubtext: {
    ...typography.body,
    color: colors.textLight,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
  },
  closeModalButtonText: {
    ...typography.button,
    color: colors.white,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    marginLeft: 0,
    marginTop: spacing.xs,
  },
}); 