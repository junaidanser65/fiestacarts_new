import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Button, Icon, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Mock data - replace with API call later
const MOCK_VENDOR = {
  id: '1',
  name: 'Gourmet Catering Co.',
  category: 'Catering',
  rating: 4.8,
  reviews: 124,
  priceRange: '$$',
  description: 'Premium catering services for all types of events. Specializing in corporate events and weddings.',
  address: '123 Main St, San Francisco, CA 94105',
  latitude: 37.78825,
  longitude: -122.4324,
  images: [
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
  ],
  services: [
    {
      name: 'Full-Service Catering',
      description: 'Complete catering service including setup and cleanup',
      price: 'From $25 per person',
    },
    {
      name: 'Buffet Service',
      description: 'Self-service buffet setup with variety of options',
      price: 'From $18 per person',
    },
    {
      name: 'Cocktail Reception',
      description: 'Hors d\'oeuvres and drinks service',
      price: 'From $15 per person',
    },
  ],
};

export default function VendorDetailsScreen({ route, navigation }) {
  const { vendor } = route.params;
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_vendors')
        .select('id')
        .match({ user_id: user.id, vendor_id: vendor.id })
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_vendors')
          .delete()
          .match({ user_id: user.id, vendor_id: vendor.id });

        if (error) throw error;
        setIsSaved(false);
        Alert.alert('Success', 'Vendor removed from saved list');
      } else {
        const { error } = await supabase
          .from('saved_vendors')
          .insert([{ user_id: user.id, vendor_id: vendor.id }]);

        if (error) throw error;
        setIsSaved(true);
        Alert.alert('Success', 'Vendor saved to your list');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to update saved vendors');
    }
  };

  const handleBookNow = () => {
    navigation.navigate('BookingForm', { vendor });
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" color={colors.background} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={toggleSave}
          disabled={loading}
        >
          <Icon 
            name={isSaved ? "favorite" : "favorite-border"} 
            color={colors.background}
            size={24}
          />
        </TouchableOpacity>
        {vendor.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{vendor.badge}</Text>
          </View>
        )}
      </View>

      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
              );
              setActiveImageIndex(newIndex);
            }}
          >
            {vendor.images?.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* Image Pagination Dots */}
          <View style={styles.pagination}>
            {vendor.images?.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <Text style={styles.vendorCategory}>{vendor.category}</Text>
          
          <View style={styles.ratingContainer}>
            <Icon name="star" color={colors.primary} size={20} />
            <Text style={styles.rating}>{vendor.rating}</Text>
            <Text style={styles.reviews}>({vendor.reviews} reviews)</Text>
            <Text style={styles.priceRange}>{vendor.priceRange}</Text>
          </View>

          <Text style={styles.description}>{vendor.description}</Text>

          {/* Services Section */}
          <Text style={styles.sectionTitle}>Services</Text>
          {vendor.services?.map((service, index) => (
            <Card key={index} containerStyle={styles.serviceCard}>
              <Text style={styles.serviceTitle}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </Card>
          ))}

          {/* Location Section */}
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.address}>{vendor.address}</Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: vendor.latitude,
                longitude: vendor.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                }}
                title={vendor.name}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          buttonStyle={styles.bookButton}
          containerStyle={styles.bookButtonContainer}
          icon={<Icon name="event" color={colors.background} style={styles.bookIcon} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
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
  imageContainer: {
    height: 300,
  },
  image: {
    width: Dimensions.get('window').width,
    height: 300,
  },
  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
  },
  infoContainer: {
    padding: spacing.lg,
  },
  vendorName: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rating: {
    ...typography.body,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  reviews: {
    ...typography.body,
    color: colors.textLight,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 'auto',
  },
  description: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  serviceCard: {
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  serviceTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  address: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  bookButtonContainer: {
    width: '100%',
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  bookIcon: {
    marginRight: spacing.sm,
  },
}); 