import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { api, resolveAssetUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useSnackbar } from '../../context/SnackbarContext';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const { addItem } = useCart();
  const { showSuccess, showError } = useSnackbar();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    api.getListing(id).then(d => { setListing(d.listing); setReviews(d.reviews || []); }).finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addItem(id, quantity);
      showSuccess('Added to cart');
    } catch (err) { showError(err.message); }
    finally { setAddingToCart(false); }
  };

  if (loading) return <View style={styles.center}><Text>Loading... 🌱</Text></View>;
  if (!listing) return <View style={styles.center}><Text>Product not found</Text></View>;

  const images = listing.images?.length ? listing.images.map(resolveAssetUrl) : [];
  const total = (quantity * parseFloat(listing.price_per_unit)).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
          {images.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={e => setCurrentImg(Math.round(e.nativeEvent.contentOffset.x / width))}>
              {images.map((img, i) => <Image key={i} source={{ uri: img }} style={styles.image} resizeMode="cover" />)}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}><Text style={{ fontSize: 64 }}>🌾</Text></View>
          )}
          {images.length > 1 && (
            <View style={styles.dots}>{images.map((_, i) => <View key={i} style={[styles.dot, i === currentImg && styles.activeDot]} />)}</View>
          )}
          {listing.organic && <View style={styles.organicBadge}><Text style={styles.organicText}>Organic 🌿</Text></View>}
        </View>

        <View style={styles.content}>
          {/* Crop Name & Grade */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropName}>{listing.crop_name}</Text>
              <Text style={styles.category}>{listing.category}</Text>
            </View>
            <View style={styles.gradeBadge}><Text style={styles.gradeText}>Grade {listing.quality_grade}</Text></View>
          </View>

          {/* Price */}
          <View style={styles.priceBox}>
            <Text style={styles.price}>₹{listing.price_per_unit}</Text>
            <Text style={styles.priceUnit}>per {listing.unit}</Text>
            <Text style={styles.availQty}>{listing.quantity} {listing.unit} available</Text>
          </View>

          {/* Farmer */}
          <TouchableOpacity style={styles.farmerCard} onPress={() => navigation.navigate('FarmerProfile', { id: listing.farmer_id })}>
            <View style={styles.farmerAvatarWrap}>
              {listing.farmer_image ? <Image source={{ uri: resolveAssetUrl(listing.farmer_image) }} style={styles.farmerAvatar} /> : <View style={styles.farmerAvatarPlaceholder}><Text style={{ fontSize: 24 }}>🧑‍🌾</Text></View>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>{listing.farmer_name}</Text>
              <Text style={styles.farmName}>{listing.farm_name}</Text>
              <Text style={styles.farmLocation}>📍 {listing.district}, {listing.state}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {parseFloat(listing.farmer_rating || 0).toFixed(1)}</Text>
            </View>
          </TouchableOpacity>

          {/* Details */}
          <View style={styles.detailsGrid}>
            {listing.harvest_date && <View style={styles.detailItem}><Text style={styles.detailLabel}>Harvested</Text><Text style={styles.detailValue}>{new Date(listing.harvest_date).toLocaleDateString('en-IN')}</Text></View>}
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Min Order</Text><Text style={styles.detailValue}>{listing.min_order_quantity} {listing.unit}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Quality</Text><Text style={styles.detailValue}>Grade {listing.quality_grade}</Text></View>
            <View style={styles.detailItem}><Text style={styles.detailLabel}>Type</Text><Text style={styles.detailValue}>{listing.organic ? 'Organic 🌿' : 'Conventional'}</Text></View>
          </View>

          {listing.description && (
            <View style={styles.descBox}>
              <Text style={styles.descLabel}>Description</Text>
              <Text style={styles.descText}>{listing.description}</Text>
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              {reviews.map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{r.consumer_name}</Text>
                    <Text style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
                  </View>
                  {r.review_text && <Text style={styles.reviewText}>{r.review_text}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Order Bar */}
      <View style={styles.orderBar}>
        <View style={styles.qtyControl}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(listing.min_order_quantity, quantity - 1))} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>−</Text></TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(Math.min(listing.quantity, quantity + 1))} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={styles.totalLabel}>Total: <Text style={styles.totalValue}>₹{total}</Text></Text>
          <Button title="Add to Cart 🛒" onPress={handleAddToCart} loading={addingToCart} size="sm" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageWrap: { height: 280, position: 'relative' },
  backBtn: { position: 'absolute', top: 48, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  image: { width, height: 280 },
  imagePlaceholder: { width: '100%', height: 280, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 2 },
  activeDot: { backgroundColor: '#fff', width: 18 },
  organicBadge: { position: 'absolute', top: 52, right: 16, backgroundColor: Colors.success, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4 },
  organicText: { ...Typography.label, color: '#fff' },
  content: { padding: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  cropName: { ...Typography.displaySmall, color: Colors.textPrimary },
  category: { ...Typography.label, color: Colors.textMuted, marginTop: 2 },
  gradeBadge: { backgroundColor: Colors.success, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  gradeText: { ...Typography.label, color: '#fff' },
  priceBox: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: Spacing.md, backgroundColor: Colors.surfaceWarm, borderRadius: Radius.md, padding: Spacing.md },
  price: { ...Typography.displaySmall, color: Colors.primary },
  priceUnit: { ...Typography.bodySmall, color: Colors.textSecondary },
  availQty: { ...Typography.caption, color: Colors.textMuted, marginLeft: 'auto' },
  farmerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  farmerAvatarWrap: { marginRight: Spacing.md },
  farmerAvatar: { width: 48, height: 48, borderRadius: 24 },
  farmerAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  farmerName: { ...Typography.h4, color: Colors.textPrimary },
  farmName: { ...Typography.bodySmall, color: Colors.textSecondary },
  farmLocation: { ...Typography.caption, color: Colors.textMuted },
  ratingBadge: { backgroundColor: Colors.secondary, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 4 },
  ratingText: { ...Typography.label, color: Colors.primaryDark },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  detailItem: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, flex: 1, minWidth: '45%', borderWidth: 1, borderColor: Colors.borderLight },
  detailLabel: { ...Typography.caption, color: Colors.textMuted, marginBottom: 4 },
  detailValue: { ...Typography.h4, color: Colors.textPrimary },
  descBox: { backgroundColor: Colors.surfaceWarm, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  descLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 4 },
  descText: { ...Typography.bodyMedium, color: Colors.textPrimary, lineHeight: 22 },
  reviewsSection: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewName: { ...Typography.h4, color: Colors.textPrimary },
  reviewRating: { fontSize: 14 },
  reviewText: { ...Typography.bodySmall, color: Colors.textSecondary },
  orderBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, ...Shadow.md },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.borderLight, borderRadius: Radius.md },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  qtyValue: { ...Typography.h4, minWidth: 30, textAlign: 'center', color: Colors.textPrimary },
  totalLabel: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  totalValue: { ...Typography.h4, color: Colors.primary },
});

export default ProductDetailScreen;
