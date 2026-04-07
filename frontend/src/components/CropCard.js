import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { resolveAssetUrl } from '../services/api';
import { Colors, Typography, Radius, Shadow, Spacing } from '../theme';

const CropCard = ({ listing, onPress, compact = false }) => {
  const image = resolveAssetUrl(listing.images?.[0]);
  const grade = listing.quality_grade || 'A';
  const gradeColor = grade === 'A' ? Colors.success : grade === 'B' ? Colors.warning : Colors.textMuted;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, compact && styles.compactCard]} activeOpacity={0.88}>
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🌾</Text>
          </View>
        )}
        {listing.organic && (
          <View style={styles.organicBadge}><Text style={styles.organicText}>Organic</Text></View>
        )}
        <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
          <Text style={styles.gradeText}>Grade {grade}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.cropName} numberOfLines={1}>{listing.crop_name}</Text>
        {!compact && (
          <Text style={styles.farmerName} numberOfLines={1}>🧑‍🌾 {listing.farmer_name || listing.farm_name}</Text>
        )}
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>₹{listing.price_per_unit}/{listing.unit}</Text>
            {!compact && <Text style={styles.qty}>{listing.quantity} {listing.unit} avail.</Text>}
          </View>
          {!compact && listing.state && (
            <View style={styles.locationChip}>
              <Text style={styles.locationText}>📍 {listing.district || listing.state}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, marginBottom: Spacing.md,
    overflow: 'hidden', ...Shadow.md, borderWidth: 1, borderColor: Colors.borderLight,
  },
  compactCard: { width: 160, marginBottom: 0, marginRight: Spacing.md },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 140 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 40 },
  organicBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.success, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  organicText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  gradeBadge: { position: 'absolute', top: 8, right: 8, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  gradeText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  body: { padding: Spacing.md },
  cropName: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 2 },
  farmerName: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { ...Typography.h3, color: Colors.primary },
  qty: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  locationChip: { backgroundColor: Colors.borderLight, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  locationText: { ...Typography.caption, color: Colors.textSecondary },
});

export default CropCard;
