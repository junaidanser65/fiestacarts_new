import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Animated, SafeAreaView, FlatList, TextInput, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import { Button, SearchBar, Card, Icon } from '@rneui/themed';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import VendorCard from '../vendor/components/VendorCard';
import { VENDOR_IMAGES } from '../../constants/images';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import Slider from '@react-native-community/slider';

// Mock data - replace with API call later
const MOCK_CATEGORIES = [
  { id: '1', name: 'Catering', icon: 'restaurant' },
  { id: '2', name: 'Venues', icon: 'location-on' },
  { id: '3', name: 'Photography', icon: 'camera-alt' },
  { id: '4', name: 'Music', icon: 'music-note' },
  { id: '5', name: 'Decoration', icon: 'celebration' },
];

const MOCK_VENDORS = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Gourmet Catering Co.',
    category: 'Catering',
    rating: 4.8,
    reviews_count: 124,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    latitude: 37.78825,
    longitude: -122.4324,
    description: 'Premium catering services for all types of events.',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Elegant Events Venue',
    category: 'Venues',
    rating: 4.9,
    reviews_count: 89,
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    latitude: 37.78925,
    longitude: -122.4344,
    description: 'Luxurious venue for weddings and corporate events.',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'Capture Moments',
    category: 'Photography',
    rating: 4.7,
    reviews_count: 156,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    latitude: 37.78725,
    longitude: -122.4354,
    description: 'Professional photography services for your special moments.',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'Royal Palace',
    category: 'Venues',
    rating: 5.0,
    reviews_count: 230,
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    description: 'Luxurious venue for all your special occasions',
    latitude: 37.78625,
    longitude: -122.4344,
    address: '456 Grand Ave, San Francisco, CA 94102',
    contact_phone: '+1234567890',
    contact_email: 'info@royalpalace.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    badge: 'Featured',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    name: 'Elite Decorators',
    category: 'Decoration',
    rating: 4.9,
    reviews_count: 180,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80',
    description: 'Premium decoration services for all events',
    latitude: 37.78525,
    longitude: -122.4364,
    address: '789 Design St, San Francisco, CA 94103',
    contact_phone: '+1234567891',
    contact_email: 'info@elitedecorators.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    badge: 'Top Rated',
  },
];

// Mock data for special offers
const SPECIAL_OFFERS = [
  {
    id: '1',
    title: '20% Off First Booking',
    description: 'Get 20% off on your first booking with any vendor',
    code: 'FIRST20',
    expiryDate: '2024-04-30',
  },
  {
    id: '2',
    title: 'Free Decoration',
    description: 'Book a venue and get free decoration services',
    code: 'FREEDECOR',
    expiryDate: '2024-05-15',
  },
];

// Mock data for featured vendors
const FEATURED_VENDORS = [
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'Royal Palace',
    category: 'Venues',
    rating: 5.0,
    reviews_count: 230,
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    description: 'Luxurious venue for all your special occasions',
    latitude: 37.78625,
    longitude: -122.4344,
    address: '456 Grand Ave, San Francisco, CA 94102',
    contact_phone: '+1234567890',
    contact_email: 'info@royalpalace.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    badge: 'Featured',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    name: 'Elite Decorators',
    category: 'Decoration',
    rating: 4.9,
    reviews_count: 180,
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80',
    description: 'Premium decoration services for all events',
    latitude: 37.78525,
    longitude: -122.4364,
    address: '789 Design St, San Francisco, CA 94103',
    contact_phone: '+1234567891',
    contact_email: 'info@elitedecorators.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    badge: 'Top Rated',
  },
];

export default function MainDashboardScreen({ navigation }) {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [vendorsWithLocations, setVendorsWithLocations] = useState([]);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [radiusKm, setRadiusKm] = useState(10); // Default 10km
  const [isMapLoading, setIsMapLoading] = useState(true);

  const scrollViewRef = useRef(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchWidthAnim = useRef(new Animated.Value(1)).current;
  const searchOpacityAnim = useRef(new Animated.Value(1)).current;
  const searchInputRef = useRef(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to see nearby vendors');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      // Set user location and center map on it
      setUserLocation(userCoords);
      setRegion(userCoords);
      
      // Generate vendor locations relative to user's location
      if (vendorsWithLocations.length === 0) {
        const newVendorsWithLocation = MOCK_VENDORS.map(vendor => ({
          ...vendor,
          latitude: location.coords.latitude + (Math.random() - 0.5) * 0.02,
          longitude: location.coords.longitude + (Math.random() - 0.5) * 0.02,
        }));
        setVendorsWithLocations(newVendorsWithLocation);
        
        // Initial filtering of vendors within radius
        const initialVendorsInRange = newVendorsWithLocation.filter(vendor => {
          const distance = getDistance(
            { latitude: userCoords.latitude, longitude: userCoords.longitude },
            { latitude: vendor.latitude, longitude: vendor.longitude }
          );
          return distance <= radiusKm * 1000;
        });
        
        setNearbyVendors(initialVendorsInRange);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location');
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const filteredVendors = MOCK_VENDORS.filter(vendor => {
    const query = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.category.toLowerCase().includes(query) ||
      vendor.description.toLowerCase().includes(query)
    );
  });

  const handleVendorPress = (vendor) => {
    console.log('Pressing vendor with ID:', vendor.id, 'Type:', typeof vendor.id);
    navigation.navigate('VendorDetails', { vendor });
  };

  const animateSearch = (show) => {
    Animated.parallel([
      Animated.timing(searchWidthAnim, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchOpacityAnim, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (show) {
        searchInputRef.current?.focus();
      }
    });
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
    animateSearch(true);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    animateSearch(false);
  };

  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      <Animated.View 
        style={[
          styles.searchContainer,
          isSearchActive ? {
            flex: 1,
            marginRight: spacing.sm,
          } : {
            width: 45,
          }
        ]}
      >
        {isSearchActive ? (
          <>
            <Icon name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search vendors..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
              }}
              placeholderTextColor={colors.textLight}
              autoFocus={true}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={styles.searchCloseButton}
              onPress={handleSearchClose}
            >
              <Icon name="close" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearchPress}
          >
            <Icon name="search" size={24} color={colors.background} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );

  const renderMap = () => (
    <View style={styles.section}>
      <View style={styles.mapHeader}>
        <Text style={styles.sectionTitle}>Nearby Vendors</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FullMap', { 
          userLocation,
          nearbyVendors: vendorsWithLocations
        })}>
          <Text style={styles.seeAllText}>View Full Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.radiusControl}>
        <View style={styles.radiusHeader}>
          <Text style={styles.radiusLabel}>Search Radius: {radiusKm}km</Text>
          <TouchableOpacity 
            style={styles.radiusButton}
            onPress={() => {
              if (userLocation) {
                const vendorsInRange = vendorsWithLocations.filter(vendor => {
                  const distance = getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: vendor.latitude, longitude: vendor.longitude }
                  );
                  return distance <= radiusKm * 1000;
                });
                setNearbyVendors(vendorsInRange);
              }
            }}
          >
            <Text style={styles.radiusButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
        <Slider
          style={styles.radiusSlider}
          minimumValue={1}
          maximumValue={50}
          step={1}
          value={radiusKm}
          onValueChange={setRadiusKm}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      <View style={styles.mapContainer}>
        {isMapLoading && (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        
        {region && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={[
              styles.map,
              isMapLoading && styles.hiddenMap
            ]}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onMapReady={() => {
              setIsMapLoading(false);
              if (userLocation) {
                setRegion(userLocation);
              }
            }}
          >
            {userLocation && (
              <Circle
                center={userLocation}
                radius={radiusKm * 1000}
                fillColor="rgba(255, 99, 71, 0.1)"
                strokeColor="rgba(255, 99, 71, 0.3)"
                strokeWidth={1}
              />
            )}
            {nearbyVendors.map((vendor) => (
              <Marker
                key={vendor.id}
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                }}
                title={vendor.name}
                description={`${vendor.category} • ${vendor.rating}⭐`}
                onPress={() => navigation.navigate('VendorDetails', { vendor })}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    <Icon 
                      name={getCategoryIcon(vendor.category)} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text style={styles.markerLabel} numberOfLines={1}>
                    {vendor.name}
                  </Text>
                </View>
              </Marker>
            ))}
          </MapView>
        )}
      </View>
    </View>
  );

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    const categoryMap = {
      'Catering': 'restaurant',
      'Venues': 'location-on',
      'Photography': 'camera-alt',
      'Music': 'music-note',
      'Decoration': 'celebration',
    };
    return categoryMap[category] || 'store';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
      >
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>
                {loading ? 'Loading...' : 'Welcome back,'}
              </Text>
              <Text style={styles.nameText}>
                {loading ? '' : user?.first_name ? `${user.first_name}!` : 'Guest!'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchHeader />

        {searchQuery.length > 0 ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>
              Search Results ({filteredVendors.length})
            </Text>
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onPress={() => {
                    handleSearchClose();
                    navigation.navigate('VendorDetails', { vendor });
                  }}
                />
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Icon name="search-off" size={48} color={colors.textLight} />
                <Text style={styles.noResultsText}>
                  No vendors found matching "{searchQuery}"
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {MOCK_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => navigation.navigate('VendorSearch', {
                      filters: { categories: [category.name] }
                    })}
                  >
                    <View style={styles.categoryIconContainer}>
                      <Icon name={category.icon} size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Special Offers */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Special Offers</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offersContainer}
              >
                {SPECIAL_OFFERS.map((offer) => (
                  <Card key={offer.id} containerStyle={styles.offerCard}>
                    <View style={styles.offerContent}>
                      <View style={styles.offerIconContainer}>
                        <Icon name="local-offer" color={colors.primary} size={24} />
                      </View>
                      <View style={styles.offerInfo}>
                        <Text style={styles.offerTitle}>{offer.title}</Text>
                        <Text style={styles.offerDescription}>{offer.description}</Text>
                        <View style={styles.offerMeta}>
                          <View style={styles.offerCodeContainer}>
                            <Text style={styles.offerCode}>{offer.code}</Text>
                          </View>
                          <Text style={styles.offerExpiry}>Expires: {offer.expiryDate}</Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </ScrollView>
            </View>

            {/* Featured Vendors */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Vendors</Text>
                <TouchableOpacity onPress={() => navigation.navigate('VendorSearch', { filters: { featured: true } })}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredContainer}
              >
                {FEATURED_VENDORS.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onPress={() => navigation.navigate('VendorDetails', { vendor })}
                    featured={true}
                    style={styles.featuredVendorCard}
                  />
                ))}
              </ScrollView>
            </View>

            {/* All Vendors Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Vendors</Text>
                <TouchableOpacity onPress={() => navigation.navigate('VendorSearch')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={MOCK_VENDORS}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.vendorList}
                renderItem={({ item }) => (
                  <VendorCard
                    vendor={item}
                    onPress={() => navigation.navigate('VendorDetails', { vendor: item })}
                  />
                )}
                keyExtractor={item => item.id}
              />
            </View>

            {renderMap()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl + 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: spacing.lg,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
  },
  nameText: {
    ...typography.h1,
    color: colors.background,
    marginTop: spacing.xs,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: -25,
    marginBottom: spacing.md,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    height: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: '100%',
  },
  searchIcon: {
    marginLeft: spacing.sm,
  },
  searchButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  searchCloseButton: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 80,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryName: {
    ...typography.caption,
    textAlign: 'center',
    width: '100%',
  },
  vendorCard: {
    padding: 0,
    margin: 0,
    marginBottom: spacing.md,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vendorImage: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  vendorInfo: {
    padding: spacing.md,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  mapContainer: {
    height: 300,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  selectedCategory: {
    transform: [{ scale: 1.05 }],
  },
  selectedCategoryIcon: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedCategoryText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  searchResults: {
    padding: spacing.md,
    flex: 1,
  },
  searchResultsTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  vendorList: {
    paddingHorizontal: spacing.md,
  },
  featuredContainer: {
    paddingHorizontal: spacing.md,
  },
  featuredVendorCard: {
    width: 280,
    marginRight: spacing.md,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mapTitle: {
    ...typography.h3,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  noResultsText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  offersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  offerCard: {
    width: 300,
    marginRight: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: colors.white,
    borderWidth: 0,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  offerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  offerDescription: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerCodeContainer: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  offerCode: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  offerExpiry: {
    ...typography.caption,
    color: colors.textLight,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  marker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  markerLabel: {
    ...typography.caption,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
    marginTop: spacing.xs,
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    maxWidth: 90,
  },
  radiusControl: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radiusLabel: {
    ...typography.body,
    color: colors.text,
  },
  radiusButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  radiusButtonText: {
    ...typography.button,
    color: colors.white,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  hiddenMap: {
    opacity: 0,
  },
}); 