import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Animated, SafeAreaView, FlatList } from 'react-native';
import { Button, SearchBar, Card, Icon } from '@rneui/themed';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import VendorCard from '../vendor/components/VendorCard';

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
    id: '1',
    name: 'Gourmet Catering Co.',
    category: 'Catering',
    rating: 4.8,
    reviews_count: 124,
    price_range: '$$',
    image_url: 'https://via.placeholder.com/300x200',
    latitude: 37.78825,
    longitude: -122.4324,
    description: 'Premium catering services for all types of events.',
  },
  {
    id: '2',
    name: 'Elegant Events Venue',
    category: 'Venues',
    rating: 4.9,
    reviews_count: 89,
    price_range: '$$$',
    image_url: 'https://via.placeholder.com/300x200',
    latitude: 37.78925,
    longitude: -122.4344,
    description: 'Luxurious venue for weddings and corporate events.',
  },
  {
    id: '3',
    name: 'Capture Moments',
    category: 'Photography',
    rating: 4.7,
    reviews_count: 156,
    price_range: '$$',
    image_url: 'https://via.placeholder.com/300x200',
    latitude: 37.78725,
    longitude: -122.4354,
    description: 'Professional photography services for your special moments.',
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
    id: '4',
    name: 'Royal Palace',
    category: 'Venues',
    rating: 5.0,
    reviews_count: 230,
    price_range: '$$$',
    image_url: 'https://via.placeholder.com/300x200',
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
    id: '5',
    name: 'Elite Decorators',
    category: 'Decoration',
    rating: 4.9,
    reviews_count: 180,
    price_range: '$$',
    image_url: 'https://via.placeholder.com/300x200',
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
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const scrollViewRef = useRef(null);

  const handleSearch = (text) => {
    setSearch(text);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const filteredVendors = MOCK_VENDORS.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorDetails', { vendor });
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

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => navigation.navigate('VendorSearch')}
          >
            <Icon name="search" color={colors.textLight} />
            <Text style={styles.searchText}>Search vendors...</Text>
          </TouchableOpacity>
        </View>

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SPECIAL_OFFERS.map((offer) => (
              <Card key={offer.id} containerStyle={styles.offerCard}>
                <View style={styles.offerContent}>
                  <Icon name="local-offer" color={colors.primary} size={24} />
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerDescription}>{offer.description}</Text>
                    <View style={styles.offerMeta}>
                      <Text style={styles.offerCode}>Code: {offer.code}</Text>
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

        {/* Map Preview */}
        <View style={styles.section}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Nearby Vendors</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FullMap')}>
              <Text style={styles.seeAllText}>View Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {MOCK_VENDORS.map((vendor) => (
                <Marker
                  key={vendor.id}
                  coordinate={{
                    latitude: vendor.latitude,
                    longitude: vendor.longitude,
                  }}
                  title={vendor.name}
                />
              ))}
            </MapView>
          </View>
        </View>
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
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingVertical: 0,
    padding: 0,
    margin: 0,
  },
  searchInputContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 45,
    minHeight: 45,
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
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    margin: spacing.md,
    height: 300,
  },
  map: {
    width: Dimensions.get('window').width - spacing.md * 2,
    height: 300,
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
  searchWrapper: {
    marginTop: -25,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'transparent',
    position: 'relative',
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
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  offerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  offerTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  offerDescription: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  featuredCard: {
    width: 280,
    marginRight: spacing.md,
    padding: 0,
    borderRadius: 8,
  },
  featuredImage: {
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
  featuredInfo: {
    padding: spacing.md,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mapTitle: {
    ...typography.h3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    elevation: 4,
  },
  searchText: {
    ...typography.body,
    color: colors.textLight,
    marginLeft: spacing.sm,
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
}); 