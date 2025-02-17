import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Icon, Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function SavedVendorsScreen({ navigation }) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_vendors')
        .select(`
          vendor_id,
          vendors (
            id,
            name,
            category,
            rating,
            reviews_count,
            price_range,
            image_url,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setVendors(data.map(item => item.vendors));
    } catch (error) {
      console.error('Error fetching saved vendors:', error);
      Alert.alert('Error', 'Failed to load saved vendors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveVendor = async (vendorId) => {
    try {
      const { error } = await supabase
        .from('saved_vendors')
        .delete()
        .match({ user_id: user.id, vendor_id: vendorId });

      if (error) throw error;

      setVendors(vendors.filter(vendor => vendor.id !== vendorId));
      Alert.alert('Success', 'Vendor removed from saved list');
    } catch (error) {
      console.error('Error removing vendor:', error);
      Alert.alert('Error', 'Failed to remove vendor');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSavedVendors();
  };

  useEffect(() => {
    fetchSavedVendors();
  }, []);

  const renderVendorCard = ({ item: vendor }) => (
    <Card containerStyle={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('VendorDetails', { vendor })}
      >
        <Card.Image
          source={{ uri: vendor.image_url }}
          style={styles.vendorImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Remove Vendor',
                  'Are you sure you want to remove this vendor from your saved list?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', onPress: () => handleRemoveVendor(vendor.id), style: 'destructive' },
                  ]
                );
              }}
            >
              <Icon name="favorite" color={colors.error} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.vendorCategory}>{vendor.category}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" color={colors.primary} size={16} />
            <Text style={styles.rating}>{vendor.rating}</Text>
            <Text style={styles.reviews}>({vendor.reviews_count} reviews)</Text>
            <Text style={styles.priceRange}>{vendor.price_range}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {vendor.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (vendors.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="favorite-border" size={64} color={colors.textLight} />
        <Text style={styles.emptyText}>No saved vendors yet</Text>
        <Button
          title="Browse Vendors"
          onPress={() => navigation.navigate('MainApp')}
          type="outline"
          containerStyle={styles.browseButton}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={vendors}
      renderItem={renderVendorCard}
      keyExtractor={vendor => vendor.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.sm,
  },
  card: {
    padding: 0,
    margin: spacing.sm,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vendorImage: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vendorName: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    ...typography.body,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  reviews: {
    ...typography.caption,
    color: colors.textLight,
    marginRight: spacing.md,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    color: colors.textLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textLight,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  browseButton: {
    width: '100%',
    maxWidth: 300,
  },
}); 