import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Alert, Share } from 'react-native';
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
  id: '123e4567-e89b-12d3-a456-426614174000',
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

// Add mock services data
const MOCK_SERVICES = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    vendor_id: MOCK_VENDOR.id,
    name: 'Full-Service Catering',
    description: 'Complete catering service including setup and cleanup',
    price: 2500,
    created_at: new Date().toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    vendor_id: MOCK_VENDOR.id,
    name: 'Buffet Service',
    description: 'Self-service buffet setup with variety of options',
    price: 1800,
    created_at: new Date().toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    vendor_id: MOCK_VENDOR.id,
    name: 'Cocktail Reception',
    description: 'Hors d\'oeuvres and drinks service',
    price: 1500,
    created_at: new Date().toISOString(),
  },
];

const VendorDetailsScreen = ({ route, navigation }) => {
  const [vendor, setVendor] = useState(MOCK_VENDOR);
  const [vendorImages, setVendorImages] = useState([]);
  const [vendorServices, setVendorServices] = useState([]);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        let vendorId;
        
        // Safely get vendorId from route params or use mock
        if (route.params?.vendorId) {
          vendorId = route.params.vendorId;
        } else {
          // Use mock data if no vendorId provided
          setVendor(MOCK_VENDOR);
          setVendorImages([MOCK_VENDOR.image_url]);
          setVendorServices(MOCK_SERVICES); // Use mock services
          return;
        }

        // Fetch vendor details
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', vendorId)
          .single();

        if (vendorError) {
          console.error('Vendor fetch error:', vendorError);
          throw vendorError;
        }

        if (!vendorData) {
          setVendor(MOCK_VENDOR);
          return;
        }

        // Fetch vendor images
        const { data: imagesData, error: imagesError } = await supabase
          .from('vendor_images')
          .select('image_url')
          .eq('vendor_id', vendorId)
          .order('is_primary', { ascending: false });

        if (imagesError) {
          console.error('Images fetch error:', imagesError);
        }

        // Fetch vendor services
        const { data: servicesData, error: servicesError } = await supabase
          .from('vendor_services')
          .select('*')
          .eq('vendor_id', vendorId);

        if (servicesError) {
          console.error('Services fetch error:', servicesError);
        }

        setVendor(vendorData);
        setVendorImages(imagesData?.map(img => img.image_url) || [vendorData.image_url]);
        setVendorServices(servicesData || MOCK_SERVICES); // Fallback to mock services
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        Alert.alert('Error', 'Failed to load vendor details');
        setVendor(MOCK_VENDOR);
        setVendorServices(MOCK_SERVICES); // Use mock services on error
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [route.params]);

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

  const handleBookNow = () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select an available date first');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service before booking');
      return;
    }

    // Find the availability for the selected date
    const dateAvailability = availability.find(a => a.date === selectedDate);
    
    // If we're using mock data (no availability records), consider all dates available
    if (availability.length === 0) {
      // Navigate to BookingForm directly
      navigation.navigate('BookingForm', { 
        vendor,
        selectedDate,
        availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        selectedServices: vendorServices.filter(service => selectedServices.includes(service.id)),
        totalPrice,
      });
      return;
    }

    // Check real availability data
    if (!dateAvailability || !dateAvailability.is_available) {
      Alert.alert('Not Available', 'Please select an available date');
      return;
    }

    // Navigate to BookingForm directly
    navigation.navigate('BookingForm', { 
      vendor,
      selectedDate,
      availableSlots: dateAvailability.available_slots,
      selectedServices: vendorServices.filter(service => selectedServices.includes(service.id)),
      totalPrice,
    });
  };

  const fetchAvailability = async () => {
    if (!vendor?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', vendor.id)
        .gte('date', today)
        .order('date');

      if (error) {
        console.error('Availability fetch error:', error);
        // When there's an error, we'll use empty availability array
        // This will make the calendar treat all dates as available
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
            onDateSelect={setSelectedDate}
          />
        </Card>

        <Card containerStyle={styles.section}>
          <Text style={styles.sectionTitle}>Services & Pricing</Text>
          <PricingCalculator
            services={vendorServices}
            onServiceSelect={handleServiceSelection}
          />
        </Card>

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
});

export default VendorDetailsScreen; 