import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, SafeAreaView } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CropCard from '../../components/CropCard';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Oilseeds'];

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const fetchFeatured = async () => {
    try {
      const data = await api.getListings({ limit: 6 });
      setFeatured(data.listings?.slice(0, 6) || []);
    } catch (err) {}
  };

  useEffect(() => { fetchListings(); }, [selectedCat]);
  useEffect(() => { fetchFeatured(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchListings(); };

  const handleSearch = () => fetchListings();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {user?.first_name}! 🙏</Text>
          <Text style={styles.headerSub}>Explore fresh produce from farmers</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View>
            <Text style={styles.heroTitle}>Fresh from the Farm</Text>
            <Text style={styles.heroSub}>No middlemen. Fair prices. 🌿</Text>
          </View>
          <Text style={styles.heroEmoji}>🚜</Text>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.catChip, selectedCat === cat && styles.activeCat]} onPress={() => setSelectedCat(cat)}>
              <Text style={[styles.catText, selectedCat === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>{selectedCat === 'All' ? 'All Produce' : selectedCat}</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading fresh produce... 🌱</Text>
          ) : listings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌾</Text>
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
  cartBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 20 },
  searchRow: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, ...Typography.bodyMedium, color: Colors.textPrimary },
  filterBtn: { backgroundColor: Colors.primary, width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 20 },
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
