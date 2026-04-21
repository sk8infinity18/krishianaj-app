import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const FarmerReviewsScreen = ({ navigation }) => {
  const { showError } = useSnackbar();
  const [reviews, setReviews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const data = await api.getMyFarmerReviews();
      setReviews(data.reviews || []);
    } catch (err) {
      showError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading reviews...</Text>
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{'\u2B50'}</Text>
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubText}>Customer reviews will appear here after delivered orders.</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.consumerName}>{item.consumer_name}</Text>
                  <Text style={styles.cropName}>{item.crop_name}</Text>
                </View>
                <Text style={styles.rating}>{'\u2B50'.repeat(item.rating)}</Text>
              </View>
              {item.review_text ? <Text style={styles.reviewText}>{item.review_text}</Text> : null}
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  list: { padding: Spacing.md },
  loadingText: { textAlign: 'center', marginTop: Spacing.xxl, ...Typography.bodyMedium, color: Colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3, color: Colors.textSecondary },
  emptySubText: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  consumerName: { ...Typography.h4, color: Colors.textPrimary },
  cropName: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  rating: { fontSize: 14 },
  reviewText: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 22 },
  date: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.sm },
});

export default FarmerReviewsScreen;
