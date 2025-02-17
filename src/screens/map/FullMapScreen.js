import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SearchBar, Icon, Button, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

// Using the same mock data from MainDashboardScreen
const ALL_VENDORS = [
  {
    id: '1',
    name: 'Gourmet Catering Co.',
    category: 'Catering',
    rating: 4.8,
    reviews: 124,
    priceRange: '$$',
    image: 'https://via.placeholder.com/300x200',
    latitude: 37.78825,
    longitude: -122.4324,
    description: 'Premium catering services for all types of events.',
  },
  {
    id: '2',
    name: 'Elegant Events Venue',
    category: 'Venues',
    rating: 4.9,
    reviews: 89,
    priceRange: '$$$',
    image: 'https://via.placeholder.com/300x200',
    latitude: 37.78925,
    longitude: -122.4344,
    description: 'Luxurious venue for weddings and corporate events.',
  },
  {
    id: '3',
    name: 'Capture Moments',
    category: 'Photography',
    rating: 4.7,
    reviews: 156,
    priceRange: '$$',
    image: 'https://via.placeholder.com/300x200',
    latitude: 37.78725,
    longitude: -122.4354,
    description: 'Professional photography services for your special moments.',
  },
  {
    id: '4',
    name: 'Royal Palace',
    category: 'Venues',
    rating: 5.0,
    reviews: 230,
    priceRange: '$$$',
    image: 'https://via.placeholder.com/300x200',
    badge: 'Featured',
    latitude: 37.78625,
    longitude: -122.4344,
  },
  {
    id: '5',
    name: 'Elite Decorators',
    category: 'Decoration',
    rating: 4.9,
    reviews: 180,
    priceRange: '$$',
    image: 'https://via.placeholder.com/300x200',
    badge: 'Top Rated',
    latitude: 37.78525,
    longitude: -122.4364,
  },
];

export default function FullMapScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const filteredVendors = ALL_VENDORS.filter(vendor =>
    vendor.name.toLowerCase().includes(search.toLowerCase()) ||
    vendor.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorDetails', { vendor });
  };

  const handleMarkerPress = (vendor) => {
    setSelectedVendor(vendor);
    setRegion({
      latitude: vendor.latitude,
      longitude: vendor.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <SearchBar
          placeholder="Search vendors..."
          onChangeText={setSearch}
          value={search}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInputContainer}
          platform="default"
        />
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {filteredVendors.map((vendor) => (
          <Marker
            key={vendor.id}
            coordinate={{
              latitude: vendor.latitude,
              longitude: vendor.longitude,
            }}
            title={vendor.name}
            description={`${vendor.category} • ${vendor.rating}⭐`}
            onPress={() => handleVendorPress(vendor)}
          >
            <View style={styles.markerContainer}>
              <Icon 
                name={vendor.badge ? 'star' : 'location-on'} 
                color={colors.primary} 
                size={24} 
              />
              {vendor.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Featured</Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Back Button */}
      <Button
        icon={<Icon name="arrow-back" color={colors.text} size={24} />}
        buttonStyle={styles.backButton}
        onPress={() => navigation.goBack()}
      />

      {/* Selected Vendor Card */}
      {selectedVendor && (
        <View style={styles.vendorCardContainer}>
          <Card containerStyle={styles.vendorCard}>
            <View style={styles.vendorInfo}>
              <View style={styles.vendorHeader}>
                <View>
                  <Text style={styles.vendorName}>{selectedVendor.name}</Text>
                  <Text style={styles.vendorCategory}>{selectedVendor.category}</Text>
                </View>
                {selectedVendor.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{selectedVendor.badge}</Text>
                  </View>
                )}
              </View>
              <View style={styles.vendorDetails}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" color={colors.primary} size={16} />
                  <Text style={styles.rating}>{selectedVendor.rating}</Text>
                  <Text style={styles.reviews}>({selectedVendor.reviews})</Text>
                </View>
                <Text style={styles.priceRange}>{selectedVendor.priceRange}</Text>
              </View>
              <Button
                title="View Details"
                onPress={() => navigation.navigate('VendorDetails', { vendor: selectedVendor })}
                buttonStyle={styles.detailsButton}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  searchOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: spacing.md,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    margin: 0,
  },
  searchInputContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    height: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerContainer: {
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 8,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg + 60,
    left: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    width: 40,
    height: 40,
    padding: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vendorCardContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  vendorCard: {
    margin: 0,
    borderRadius: 8,
    padding: spacing.md,
  },
  vendorInfo: {
    flexDirection: 'column',
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...typography.body,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  reviews: {
    ...typography.caption,
    color: colors.textLight,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
  },
  detailsButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
}); 