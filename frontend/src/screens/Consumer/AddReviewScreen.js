import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const AddReviewScreen = ({ navigation, route }) => {
  const { order } = route.params;
  const { showError, showWarning, showSuccess } = useSnackbar();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating === 0) return showWarning('Please select a star rating');
    setLoading(true);
    try {
      await api.addReview({ order_id: order.id, rating, review_text: reviewText });
      showSuccess('Review submitted successfully');
      navigation.goBack();
    } catch (err) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Write Review</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.orderInfo}>
          <Text style={styles.cropName}>{order.crop_name}</Text>
          <Text style={styles.farmerName}>from {order.farmer_name}</Text>
        </View>
        <Text style={styles.ratingLabel}>Your Rating *</Text>
        <View style={styles.stars}>
          {[1,2,3,4,5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={[styles.star, s <= rating && styles.starActive]}>{s <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Review (optional)" value={reviewText} onChangeText={setReviewText} placeholder="Share your experience with this produce and farmer..." multiline numberOfLines={5} />
        <Button title="Submit Review" onPress={submit} loading={loading} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  scroll: { padding: Spacing.xl },
  orderInfo: { backgroundColor: Colors.surfaceWarm, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.xl, alignItems: 'center' },
  cropName: { ...Typography.h2, color: Colors.textPrimary },
  farmerName: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4 },
  ratingLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.md },
  stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xl, gap: 8 },
  star: { fontSize: 40 },
  starActive: { fontSize: 40 },
  btn: { marginTop: Spacing.md },
});

export default AddReviewScreen;
