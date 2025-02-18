import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Alert, Share, Animated } from 'react-native';
import { Button, Icon, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ImageGallery from '../../components/vendor/ImageGallery';
import AvailabilityCalendar from '../../components/vendor/AvailabilityCalendar';
import PricingCalculator from '../../components/vendor/PricingCalculator';
import ShareButton from '../../components/common/ShareButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useFavorites } from '../../contexts/FavoritesContext';
import BackButton from '../../components/common/BackButton';

// Mock data - replace with API call later
const MOCK_VENDOR = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Gourmet Catering Co.',
  category: 'Catering',
  description: 'Premium catering services for all types of events. Specializing in corporate events and weddings.',
  rating: 4.8,
  reviews_count: 124,
  price_range: '$$',
  image_url: 'https://via.placeholder.com/400x300',
  latitude: 37.78825,
  longitude: -122.4324,
  address: '123 Main St, San Francisco, CA 94105',
  contact_phone: '+1234567890',
  contact_email: 'info@gourmetcatering.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Update the MOCK_SERVICES to include services for all vendors
const MOCK_SERVICES = {
  // Gourmet Catering Co. services
  '123e4567-e89b-12d3-a456-426614174001': [
    {
      id: '123e4567-e89b-12d3-a456-426614174101',
      vendor_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Full-Service Catering',
      description: 'Complete catering service including setup and cleanup',
      price: 2500,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174102',
      vendor_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Buffet Service',
      description: 'Self-service buffet setup with variety of options',
      price: 1800,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174103',
      vendor_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Cocktail Reception',
      description: 'Hors d\'oeuvres and drinks service',
      price: 1500,
      created_at: new Date().toISOString(),
    },
  ],
  
  // Elegant Events Venue services
  '123e4567-e89b-12d3-a456-426614174002': [
    {
      id: '123e4567-e89b-12d3-a456-426614174201',
      vendor_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Full Venue Rental',
      description: 'Exclusive access to entire venue for your event',
      price: 5000,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174202',
      vendor_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Partial Venue Rental',
      description: 'Access to main hall and garden area',
      price: 3500,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174203',
      vendor_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Basic Decoration Package',
      description: 'Standard decoration setup for your event',
      price: 1200,
      created_at: new Date().toISOString(),
    },
  ],
  
  // Capture Moments services
  '123e4567-e89b-12d3-a456-426614174003': [
    {
      id: '123e4567-e89b-12d3-a456-426614174301',
      vendor_id: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Full Day Photography',
      description: 'Complete event coverage with edited photos',
      price: 2000,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174302',
      vendor_id: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Half Day Photography',
      description: '4-hour event coverage with edited photos',
      price: 1200,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174303',
      vendor_id: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Photo Booth Service',
      description: 'Setup with props and unlimited prints',
      price: 800,
      created_at: new Date().toISOString(),
    },
  ],

  // Royal Palace services
  '123e4567-e89b-12d3-a456-426614174004': [
    {
      id: '123e4567-e89b-12d3-a456-426614174401',
      vendor_id: '123e4567-e89b-12d3-a456-426614174004',
      name: 'Grand Ballroom Package',
      description: 'Complete ballroom rental with luxury amenities',
      price: 8000,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174402',
      vendor_id: '123e4567-e89b-12d3-a456-426614174004',
      name: 'Garden Wedding Package',
      description: 'Outdoor venue with tent and garden setup',
      price: 6000,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174403',
      vendor_id: '123e4567-e89b-12d3-a456-426614174004',
      name: 'Premium Catering Add-on',
      description: 'High-end catering service for up to 200 guests',
      price: 4000,
      created_at: new Date().toISOString(),
    },
  ],

  // Elite Decorators services
  '123e4567-e89b-12d3-a456-426614174005': [
    {
      id: '123e4567-e89b-12d3-a456-426614174501',
      vendor_id: '123e4567-e89b-12d3-a456-426614174005',
      name: 'Luxury Decoration Package',
      description: 'Premium decor with floral arrangements and lighting',
      price: 3500,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174502',
      vendor_id: '123e4567-e89b-12d3-a456-426614174005',
      name: 'Theme-based Decoration',
      description: 'Customized themed decoration for your event',
      price: 2800,
      created_at: new Date().toISOString(),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174503',
      vendor_id: '123e4567-e89b-12d3-a456-426614174005',
      name: 'Basic Decoration Setup',
      description: 'Essential decoration elements for your event',
      price: 1500,
      created_at: new Date().toISOString(),
    },
  ],
};

// Verify the structure of MOCK_SERVICES
console.log('Available mock service IDs:', Object.keys(MOCK_SERVICES));

const VendorDetailsScreen = ({ route, navigation }) => {
  // Get vendor from route params
  const initialVendor = route.params?.vendor || MOCK_VENDOR;
  
  // Initialize vendorServices with mock data for the initial vendor
  const initialServices = MOCK_SERVICES[initialVendor.id] || [];
  
  const [vendor, setVendor] = useState(initialVendor);
  const [vendorImages, setVendorImages] = useState([initialVendor.image_url]);
  const [vendorServices, setVendorServices] = useState(initialServices); // Initialize with mock services
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [dateAvailability, setDateAvailability] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        
        if (route.params?.vendor) {
          const vendorFromParams = route.params.vendor;
          console.log('Full vendor data:', vendorFromParams);
          console.log('Vendor ID type:', typeof vendorFromParams.id);
          console.log('Loading vendor:', vendorFromParams.name);
          console.log('Vendor ID:', vendorFromParams.id);
          console.log('All available mock service IDs:', Object.keys(MOCK_SERVICES));
          console.log('Trying to find services for ID:', vendorFromParams.id);
          console.log('Found services:', MOCK_SERVICES[vendorFromParams.id]);
          
          setVendor(vendorFromParams);
          setVendorImages([vendorFromParams.image_url]);
          
          // Get mock services for this vendor
          const mockServicesForVendor = MOCK_SERVICES[vendorFromParams.id];
          
          if (mockServicesForVendor) {
            console.log('Setting services:', mockServicesForVendor);
            setVendorServices(mockServicesForVendor);
          } else {
            console.log('No mock services found for vendor ID:', vendorFromParams.id);
            setVendorServices([]);
          }
          
          fetchAvailability(vendorFromParams.id);
        } else {
          console.log('No vendor in params, using mock vendor');
          setVendor(MOCK_VENDOR);
          setVendorImages([MOCK_VENDOR.image_url]);
          const mockServices = MOCK_SERVICES[MOCK_VENDOR.id];
          console.log('Setting mock vendor services:', mockServices?.length || 0, 'services');
          setVendorServices(mockServices || []);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        Alert.alert('Error', 'Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [route.params?.vendor]);

  const toggleFavorite = () => {
    setLoading(true);
    try {
      if (isFavorite(vendor.id)) {
        removeFavorite(vendor.id);
        Alert.alert('Success', 'Vendor removed from favorites');
      } else {
        addFavorite(vendor);
        Alert.alert('Success', 'Vendor added to favorites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Find availability for selected date
    const availabilityForDate = availability.find(a => a.date === date);
    setDateAvailability(availabilityForDate);
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select an available date first');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service before booking');
      return;
    }

    navigation.navigate('BookingForm', { 
      vendor,
      selectedDate,
      availableSlots: dateAvailability?.available_slots || ['09:00', '10:00', '11:00', '14:00', '15:00'],
      selectedServices: vendorServices.filter(service => selectedServices.includes(service.id)),
      totalPrice,
    });
  };

  const fetchAvailability = async (vendorId) => {
    // Add validation for UUID format
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vendorId);
    
    if (!vendorId || !isValidUUID) {
      console.log('Invalid vendor ID format, using mock availability');
      setAvailability([]);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', vendorId)
        .gte('date', today)
        .order('date');

      if (error) {
        console.error('Availability fetch error:', error);
        setAvailability([]);
        return;
      }

      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability([]);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${vendor.name} on our app!`,
        url: `vendorapp://vendor/${vendor.id}`,
        title: vendor.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share vendor');
    }
  };

  const handleServiceSelection = (services, total) => {
    setSelectedServices(services);
    setTotalPrice(total);
  };

  const renderPricingCalculator = () => {
    console.log('Rendering PricingCalculator with services:', vendorServices);
    return (
      <Card containerStyle={styles.section}>
        <Text style={styles.sectionTitle}>Services & Pricing</Text>
        <Text>Number of services: {vendorServices?.length || 0}</Text>
        <PricingCalculator
          services={vendorServices || []}
          onServiceSelect={handleServiceSelection}
        />
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return <ErrorMessage message="Vendor not found" />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
      <ScrollView>
        <ImageGallery images={vendorImages} />
        
        <View style={styles.contentContainer}>
          <Text style={styles.vendorName}>{vendor.name}</Text>

          <View style={styles.ratingContainer}>
            <Icon name="star" color={colors.primary} size={20} />
            <Text style={styles.rating}>{vendor.rating}</Text>
            <Text style={styles.reviews}>({vendor.reviews_count} reviews)</Text>
            <Text style={styles.priceRange}>{vendor.price_range}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite(vendor.id) && styles.favoriteButtonActive]}
              onPress={toggleFavorite}
              disabled={loading}
            >
              <Icon
                name={isFavorite(vendor.id) ? 'favorite' : 'favorite-border'}
                color={isFavorite(vendor.id) ? colors.error : colors.primary}
                size={24}
              />
              <Text style={[
                styles.favoriteButtonText,
                isFavorite(vendor.id) && styles.favoriteButtonTextActive
              ]}>
                {loading ? 'Updating...' : (isFavorite(vendor.id) ? 'Saved' : 'Save')}
              </Text>
            </TouchableOpacity>
            <ShareButton onPress={handleShare} />
          </View>
        </View>

        <Card containerStyle={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <AvailabilityCalendar
            availability={availability}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </Card>

        {renderPricingCalculator()}

        <Button
          title="Book Now"
          onPress={handleBookNow}
          disabled={!selectedDate || selectedServices.length === 0}
          containerStyle={styles.bookButton}
          buttonStyle={styles.bookButtonStyle}
          titleStyle={styles.bookButtonText}
          disabledStyle={styles.bookButtonDisabled}
          disabledTitleStyle={styles.bookButtonDisabledText}
        />
      </ScrollView>
    </View>
  );
};

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
  contentContainer: {
    padding: spacing.md,
  },
  vendorName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rating: {
    ...typography.body,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  reviews: {
    ...typography.body,
    color: colors.textLight,
    marginRight: spacing.md,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 'auto',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  favoriteButtonActive: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
  },
  favoriteButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  favoriteButtonTextActive: {
    color: colors.error,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  bookButton: {
    margin: spacing.md,
  },
  bookButtonStyle: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  bookButtonText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  bookButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  bookButtonDisabledText: {
    color: colors.white,
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default VendorDetailsScreen; 