import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, Image, Switch } from 'react-native';
import { api, resolveAssetUrl } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const MyListingsScreen = ({ navigation }) => {
  const { showSuccess, showError } = useSnackbar();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    api.getMyListings().then(d => setListings(d.listings || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
    const unsubscribe = navigation.addListener('focus', fetchListings);
    return unsubscribe;
  }, [navigation]);

  const toggleAvailability = async (id, current) => {
    try {
      await api.updateListing(id, { is_available: !current });
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_available: !current } : l));
      showSuccess(!current ? 'Listing is live now' : 'Listing has been turned off');
    } catch (err) { showError(err.message); }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Listing', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteListing(id);
            showSuccess('Listing deleted successfully');
            fetchListings();
          } catch (err) {
            showError(err.message);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings ({listings.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddListing')}><Text style={styles.addBtn}>+ Add</Text></TouchableOpacity>
      </View>

      {loading ? <Text style={styles.loadingText}>Loading your crops... 🌱</Text> :
        listings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌾</Text>
            <Text style={styles.emptyText}>No listings yet</Text>
            <Button title="List Your First Crop" onPress={() => navigation.navigate('AddListing')} style={{ marginTop: Spacing.xl }} />
          </View>
        ) : (
          <FlatList data={listings} keyExtractor={i => i.id} contentContainerStyle={{ padding: Spacing.md }}
            renderItem={({ item }) => (
              <View style={[styles.card, !item.is_available && styles.cardInactive]}>
                <View style={styles.cardRow}>
                  {item.images?.[0] ? <Image source={{ uri: resolveAssetUrl(item.images[0]) }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder}><Text style={{ fontSize: 28 }}>🌾</Text></View>}
                  <View style={styles.info}>
                    <Text style={styles.cropName}>{item.crop_name}</Text>
                    <Text style={styles.category}>{item.category} • Grade {item.quality_grade}</Text>
                    <Text style={styles.price}>₹{item.price_per_unit}/{item.unit}</Text>
                    <Text style={styles.qty}>{item.quantity} {item.unit} remaining</Text>
                  </View>
                  <View style={styles.actions}>
                    <Switch value={item.is_available} onValueChange={() => toggleAvailability(item.id, item.is_available)} thumbColor={item.is_available ? Colors.primary : Colors.textMuted} trackColor={{ true: Colors.primaryLight + '80', false: Colors.borderLight }} />
                    <Text style={[styles.availText, { color: item.is_available ? Colors.success : Colors.textMuted }]}>{item.is_available ? 'Live' : 'Off'}</Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.crop_name)} style={styles.deleteBtn}><Text style={styles.deleteIcon}>🗑</Text></TouchableOpacity>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.stat}>Sold: {item.total_sold} {item.unit}</Text>
                  <Text style={styles.stat}>Listed: {new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
                  {item.organic && <View style={styles.organicBadge}><Text style={styles.organicText}>Organic</Text></View>}
                </View>
              </View>
            )} />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryDark, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  addBtn: { ...Typography.h4, color: Colors.secondaryLight, fontWeight: '700' },
  loadingText: { textAlign: 'center', marginTop: Spacing.xxl, ...Typography.bodyMedium, color: Colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3, color: Colors.textSecondary },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  cardInactive: { opacity: 0.6 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 72, height: 72, borderRadius: Radius.md },
  thumbPlaceholder: { width: 72, height: 72, borderRadius: Radius.md, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: Spacing.md },
  cropName: { ...Typography.h4, color: Colors.textPrimary },
  category: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  price: { ...Typography.h4, color: Colors.primary, marginTop: 4 },
  qty: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  actions: { alignItems: 'center', gap: 4 },
  availText: { ...Typography.caption, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 18 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  stat: { ...Typography.caption, color: Colors.textMuted },
  organicBadge: { backgroundColor: Colors.success, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  organicText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
});

export default MyListingsScreen;
