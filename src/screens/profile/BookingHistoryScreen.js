import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

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

export default function BookingHistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredBookings = MOCK_BOOKINGS.filter(
    booking => booking.status === activeTab
  );

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { booking });
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText,
          ]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'completed' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'completed' && styles.activeTabText,
          ]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} containerStyle={styles.bookingCard}>
              <TouchableOpacity
                onPress={() => handleBookingPress(booking)}
                activeOpacity={0.7}
              >
                <Card.Image
                  source={{ uri: booking.vendor.image }}
                  style={styles.vendorImage}
                />
                <View style={styles.bookingInfo}>
                  <View style={styles.headerRow}>
                    <Text style={styles.vendorName}>{booking.vendor.name}</Text>
                    <Text style={styles.amount}>${booking.totalAmount}</Text>
                  </View>
                  <Text style={styles.vendorCategory}>{booking.vendor.category}</Text>
                  
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Icon name="event" size={16} color={colors.textLight} />
                      <Text style={styles.detailText}>
                        {booking.date.toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="access-time" size={16} color={colors.textLight} />
                      <Text style={styles.detailText}>
                        {booking.time.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="people" size={16} color={colors.textLight} />
                      <Text style={styles.detailText}>
                        {booking.guests} guests
                      </Text>
                    </View>
                  </View>

                  {activeTab === 'upcoming' && (
                    <View style={styles.actionButtons}>
                      <Button
                        title="Modify"
                        type="outline"
                        buttonStyle={styles.modifyButton}
                        titleStyle={styles.modifyButtonText}
                        onPress={() => navigation.navigate('BookingForm', { 
                          vendor: booking.vendor,
                          booking 
                        })}
                      />
                      <Button
                        title="Cancel"
                        type="outline"
                        buttonStyle={styles.cancelButton}
                        titleStyle={styles.cancelButtonText}
                        onPress={() => {
                          // TODO: Implement cancellation logic
                        }}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Card>
          ))
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
    borderRadius: 8,
    padding: 0,
    margin: spacing.md,
    marginBottom: 0,
  },
  vendorImage: {
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bookingInfo: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vendorName: {
    ...typography.h3,
  },
  amount: {
    ...typography.h3,
    color: colors.primary,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  modifyButton: {
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
  },
  modifyButtonText: {
    color: colors.primary,
  },
  cancelButton: {
    borderColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
  },
  cancelButtonText: {
    color: colors.error,
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