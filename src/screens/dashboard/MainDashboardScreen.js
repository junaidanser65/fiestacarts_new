import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Button, SearchBar, Card, Icon } from '@rneui/themed';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

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

const SECTIONS = [
  { id: 'offers', title: 'Special Offers', icon: 'local-offer' },
  { id: 'categories', title: 'Categories', icon: 'category' },
  { id: 'featured', title: 'Featured', icon: 'star' },
  { id: 'vendors', title: 'All Vendors', icon: 'store' },
  { id: 'map', title: 'Map View', icon: 'map' },
];

export default function MainDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFAB, setShowFAB] = useState(true);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const scrollViewRef = useRef(null);
  const sectionRefs = {
    offers: useRef(null),
    categories: useRef(null),
    featured: useRef(null),
    vendors: useRef(null),
    map: useRef(null),
  };

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    setShowFAB(currentOffset < 100);
  };

  const scrollToSection = (sectionId) => {
    if (sectionRefs[sectionId]?.current) {
      sectionRefs[sectionId].current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({
            y: y - 100, // Offset to account for header
            animated: true,
          });
        },
        () => console.log('Failed to measure'),
      );
    }
  };

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
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user.firstName}!</Text>
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
          <SearchBar
            placeholder="Search vendors..."
            onChangeText={handleSearch}
            value={search}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            platform="default"
          />
        </View>

        {/* Special Offers */}
        <View style={styles.section} ref={sectionRefs.offers}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
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

        {/* Categories */}
        <View style={styles.section} ref={sectionRefs.categories}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCK_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.name && styles.selectedCategory,
                ]}
                onPress={() => handleCategoryPress(category.name)}
              >
                <View style={[
                  styles.categoryIcon,
                  selectedCategory === category.name && styles.selectedCategoryIcon,
                ]}>
                  <Icon 
                    name={category.icon} 
                    color={selectedCategory === category.name ? colors.background : colors.primary} 
                    size={24} 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.name && styles.selectedCategoryText,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Vendors */}
        <View style={styles.section} ref={sectionRefs.featured}>
          <Text style={styles.sectionTitle}>Featured Vendors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FEATURED_VENDORS.map((vendor) => (
              <TouchableOpacity
                key={vendor.id}
                onPress={() => handleVendorPress(vendor)}
              >
                <Card containerStyle={styles.featuredCard}>
                  <Card.Image source={{ uri: vendor.image }} style={styles.featuredImage}>
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{vendor.badge}</Text>
                    </View>
                  </Card.Image>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    <Text style={styles.vendorCategory}>{vendor.category}</Text>
                    <View style={styles.vendorDetails}>
                      <View style={styles.ratingContainer}>
                        <Icon name="star" color={colors.primary} size={16} />
                        <Text style={styles.rating}>{vendor.rating}</Text>
                        <Text style={styles.reviews}>({vendor.reviews} reviews)</Text>
                      </View>
                      <Text style={styles.priceRange}>{vendor.priceRange}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Vendors */}
        <View style={styles.section} ref={sectionRefs.vendors}>
          <Text style={styles.sectionTitle}>
            {selectedCategory || 'All'} Vendors
          </Text>
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <TouchableOpacity
                key={vendor.id}
                onPress={() => handleVendorPress(vendor)}
                activeOpacity={0.7}
              >
                <Card containerStyle={styles.vendorCard}>
                  <Card.Image
                    source={{ uri: vendor.image }}
                    style={styles.vendorImage}
                  />
                  <View style={styles.vendorInfo}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    <Text style={styles.vendorCategory}>{vendor.category}</Text>
                    <View style={styles.vendorDetails}>
                      <View style={styles.ratingContainer}>
                        <Icon name="star" color={colors.primary} size={16} />
                        <Text style={styles.rating}>{vendor.rating}</Text>
                        <Text style={styles.reviews}>({vendor.reviews} reviews)</Text>
                      </View>
                      <Text style={styles.priceRange}>{vendor.priceRange}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={48} color={colors.textLight} />
              <Text style={styles.emptyStateText}>No vendors found</Text>
            </View>
          )}
        </View>

        {/* Map View */}
        <View style={styles.mapContainer} ref={sectionRefs.map}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Nearby Vendors</Text>
            <Button
              title="View Full Map"
              type="clear"
              onPress={() => navigation.navigate('FullMap')}
            />
          </View>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {[...filteredVendors, ...FEATURED_VENDORS].map((vendor) => (
              <Marker
                key={vendor.id}
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                }}
                title={vendor.name}
                description={`${vendor.category} • ${vendor.rating}⭐`}
                onPress={() => handleVendorPress(vendor)}
              />
            ))}
          </MapView>
        </View>
      </ScrollView>

      {showFAB && (
        <View style={styles.fabContainer}>
          {SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.fabItem}
              onPress={() => scrollToSection(section.id)}
            >
              <Icon name={section.icon} color={colors.background} size={20} />
              <Text style={styles.fabText}>{section.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  welcomeText: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
  },
  userName: {
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
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  categoryIcon: {
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
  fabContainer: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  fabText: {
    ...typography.caption,
    color: colors.background,
    marginLeft: spacing.sm,
  },
}); 