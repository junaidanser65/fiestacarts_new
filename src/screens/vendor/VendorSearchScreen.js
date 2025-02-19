import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, SearchBar, Icon, Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import VendorCard from './components/VendorCard';
import { debounce } from 'lodash';

export default function VendorSearchScreen({ navigation, route }) {
  const { filters = {} } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const [debouncedSearch] = useState(
    debounce((text) => {
      setSearchQuery(text);
    }, 500)
  );

  const fetchVendors = async () => {
    try {
      let query = supabase
        .from('vendors')
        .select('*');

      // Apply filters
      if (filters.categories?.length > 0 && !filters.categories.includes('All')) {
        query = query.in('category', filters.categories);
      }

      if (filters.priceRanges?.length > 0) {
        query = query.in('price_range', filters.priceRanges);
      }

      if (filters.rating > 0) {
        query = query.gte('rating', filters.rating);
      }

      // Apply search query
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'reviews':
          query = query.order('reviews_count', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price_range', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price_range', { ascending: false });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }

      // Add pagination
      query = query
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        .limit(PAGE_SIZE);

      const { data, error } = await query;

      if (error) throw error;
      if (page === 0) {
        setVendors(data);
      } else {
        setVendors(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchVendors();
  }, [filters, searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchVendors();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <SearchBar
        placeholder="Search vendors..."
        onChangeText={debouncedSearch}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        platform="default"
      />
      <Button
        icon={<Icon name="filter-list" color={colors.primary} />}
        type="clear"
        onPress={() => navigation.navigate('SearchFilters', { currentFilters: filters })}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={vendors}
        renderItem={({ item }) => (
          <VendorCard
            vendor={item}
            onPress={() => navigation.navigate('VendorDetails', { vendor: item })}
            loading={loading && !item}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <View>
              {[...Array(3)].map((_, index) => (
                <VendorCard
                  key={index}
                  vendor={{
                    id: `loading-${index}`,
                    name: '',
                    category: '',
                    description: '',
                    rating: 0,
                    reviews_count: 0,
                    price_range: '',
                    image_url: '',
                  }}
                  onPress={() => {}}
                  loading={true}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>No vendors found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    marginVertical: 0,
  },
  searchInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
}); 