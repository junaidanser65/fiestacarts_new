import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import PropTypes from 'prop-types';
import { colors, spacing, typography } from '../../../styles/theme';

export default function VendorCard({ vendor, onPress, loading, featured, style }) {
  if (loading) {
    return (
      <Card containerStyle={[styles.card, featured && styles.featuredCard, style]}>
        <View style={[styles.image, styles.loadingImage]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.loadingText, { width: '60%' }]} />
            <View style={[styles.loadingText, { width: '20%' }]} />
          </View>
          <View style={[styles.loadingText, { width: '40%', marginBottom: spacing.sm }]} />
          <View style={styles.ratingContainer}>
            <View style={[styles.loadingText, { width: '30%' }]} />
          </View>
          <View style={[styles.loadingText, { width: '100%' }]} />
          <View style={[styles.loadingText, { width: '80%', marginTop: spacing.xs }]} />
        </View>
      </Card>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Card containerStyle={[styles.card, featured && styles.featuredCard, style]}>
        <Card.Image
          source={{ uri: vendor.image_url }}
          style={styles.image}
          PlaceholderContent={<Icon name="image" size={40} color={colors.textLight} />}
        />
        {featured && vendor.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{vendor.badge}</Text>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{vendor.name}</Text>
            <Text style={styles.priceRange}>{vendor.price_range}</Text>
          </View>
          <Text style={styles.category}>{vendor.category}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" color={colors.primary} size={16} />
            <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({vendor.reviews_count} reviews)</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {vendor.description}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

VendorCard.propTypes = {
  vendor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string,
    rating: PropTypes.number,
    reviews_count: PropTypes.number,
    price_range: PropTypes.string,
    image_url: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  featured: PropTypes.bool,
  style: PropTypes.object,
};

VendorCard.defaultProps = {
  loading: false,
  featured: false,
};

const styles = StyleSheet.create({
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
  image: {
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
  },
  category: {
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
  },
  description: {
    ...typography.body,
    color: colors.textLight,
  },
  loadingImage: {
    backgroundColor: colors.surface,
  },
  loadingText: {
    height: 16,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginVertical: 2,
  },
  featuredCard: {
    marginVertical: spacing.xs,
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    elevation: 3,
  },
  badgeText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
}); 