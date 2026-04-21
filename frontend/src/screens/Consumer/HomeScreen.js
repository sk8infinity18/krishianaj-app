import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, RefreshControl, SafeAreaView } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { confirmAction } from '../../utils/confirmAction';
import CropCard from '../../components/CropCard';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Oilseeds'];

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      const params = {};
      if (selectedCat !== 'All') params.category = selectedCat;
      if (search) params.search = search;
      const data = await api.getListings(params);
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
      showError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchListings(); }, [selectedCat]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleSearch = () => fetchListings();

  const handleLogout = async () => {
    const confirmed = await confirmAction('Logout', 'Do you want to log out?');
    if (!confirmed) return;

    try {
      await logout();
      showSuccess('Logged out successfully');
    } catch (err) {
      showError(err.message || 'Failed to log out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {user?.first_name}! {'\u{1F64F}'}</Text>
          <Text style={styles.headerSub}>Explore fresh produce from farmers</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('ConsumerProfile')} style={styles.headerActionBtn}>
            <Text style={styles.headerActionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerActionBtn}>
            <Text style={styles.headerActionText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
            <Text style={styles.cartIcon}>{'\u{1F6D2}'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>{'\u{1F50D}'}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search crops, vegetables..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.heroBanner}>
          <View>
            <Text style={styles.heroTitle}>Fresh from the Farm</Text>
            <Text style={styles.heroSub}>No middlemen. Fair prices. {'\u{1F33F}'}</Text>
          </View>
          <Text style={styles.heroEmoji}>{'\u{1F69C}'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.catChip, selectedCat === cat && styles.activeCat]} onPress={() => setSelectedCat(cat)}>
              <Text style={[styles.catText, selectedCat === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>{selectedCat === 'All' ? 'All Produce' : selectedCat}</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading fresh produce... {'\u{1F331}'}</Text>
          ) : listings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>{'\u{1F33E}'}</Text>
              <Text style={styles.emptyText}>No produce found</Text>
              <Text style={styles.emptySubText}>Try a different category or search term</Text>
            </View>
          ) : (
            listings.map(item => (
              <CropCard key={item.id} listing={item} onPress={() => navigation.navigate('ProductDetail', { id: item.id })} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.xl, paddingBottom: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...Typography.h2, color: Colors.textLight },
  headerSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: { ...Typography.bodySmall, color: Colors.textLight, fontWeight: '600' },
  cartBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 20 },
  searchRow: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, ...Typography.bodyMedium, color: Colors.textPrimary, outlineStyle: 'none' },
  heroBanner: { marginHorizontal: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.primaryDark, padding: Spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  heroTitle: { ...Typography.h2, color: Colors.textLight },
  heroSub: { ...Typography.bodySmall, color: Colors.secondaryLight, marginTop: 4 },
  heroEmoji: { fontSize: 48 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, marginTop: Spacing.md },
  catScroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, marginRight: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border },
  activeCat: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { ...Typography.label, color: Colors.textSecondary },
  activeCatText: { color: Colors.textLight },
  listingsSection: { padding: Spacing.md },
  loadingText: { ...Typography.bodyMedium, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
  empty: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3, color: Colors.textSecondary },
  emptySubText: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4 },
});

export default HomeScreen;
