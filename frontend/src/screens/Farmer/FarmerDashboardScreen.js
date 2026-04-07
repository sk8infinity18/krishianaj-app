import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const StatCard = ({ label, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const FarmerDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const [earnings, setEarnings] = useState({ total_earnings: 0, monthly: [], top_crops: [] });
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [earningData, orderData, listingData] = await Promise.all([
        api.getFarmerEarnings(),
        api.getFarmerOrders({ limit: 5 }),
        api.getMyListings(),
      ]);
      setEarnings(earningData);
      setOrders(orderData.orders || []);
      setListings(listingData.listings || []);
    } catch (err) { console.error(err); showError(err.message); }
    finally { setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeListings = listings.filter(l => l.is_available).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {user?.first_name}! 🌾</Text>
          <Text style={styles.farmName}>{user?.farm_name || 'Your Farm'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('FarmerProfile')} style={styles.avatarBtn}>
          <Text style={styles.avatarText}>{user?.first_name?.[0]?.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Earnings" value={`₹${parseFloat(earnings.total_earnings || 0).toFixed(0)}`} icon="💰" color={Colors.success} />
          <StatCard label="Pending Orders" value={pendingOrders} icon="⏳" color={Colors.warning} />
          <StatCard label="Active Listings" value={activeListings} icon="🌿" color={Colors.primary} />
          <StatCard label="Total Crops" value={listings.length} icon="🌾" color={Colors.secondary} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Add Listing', icon: '➕', screen: 'AddListing', color: Colors.primary },
            { label: 'My Listings', icon: '📋', screen: 'MyListings', color: Colors.info },
            { label: 'Orders', icon: '📦', screen: 'FarmerOrders', color: Colors.secondary },
            { label: 'Earnings', icon: '💹', screen: 'Earnings', color: Colors.success },
          ].map(a => (
            <TouchableOpacity key={a.screen} style={[styles.actionCard, { borderColor: a.color }]} onPress={() => navigation.navigate(a.screen)}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FarmerOrders')}><Text style={styles.seeAll}>See all →</Text></TouchableOpacity>
        </View>
        {orders.length === 0 ? (
          <View style={styles.emptyBox}><Text style={styles.emptyText}>No orders yet. Add listings to start selling!</Text></View>
        ) : orders.slice(0, 4).map(o => (
          <TouchableOpacity key={o.id} style={styles.orderCard} onPress={() => navigation.navigate('FarmerOrders')}>
            <View style={styles.orderRow}>
              <View>
                <Text style={styles.orderCrop}>{o.crop_name}</Text>
                <Text style={styles.orderConsumer}>👤 {o.consumer_name}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>₹{parseFloat(o.total_amount).toFixed(0)}</Text>
                <View style={[styles.statusDot, { backgroundColor: o.status === 'delivered' ? Colors.success : o.status === 'pending' ? Colors.warning : Colors.info }]} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Top Crops */}
        {earnings.top_crops?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Top Performing Crops</Text>
            {earnings.top_crops.map((c, i) => (
              <View key={i} style={styles.cropRow}>
                <Text style={styles.cropRank}>#{i + 1}</Text>
                <Text style={styles.cropName}>{c.crop_name}</Text>
                <Text style={styles.cropRevenue}>₹{parseFloat(c.revenue).toFixed(0)}</Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity onPress={async () => { await logout(); showSuccess('Logged out successfully'); }} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryDark, padding: Spacing.xl, paddingBottom: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...Typography.h2, color: '#fff' },
  farmName: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.h3, color: Colors.primaryDark },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: Spacing.sm },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderLeftWidth: 4, ...Shadow.sm },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { ...Typography.h2, marginBottom: 2 },
  statLabel: { ...Typography.caption, color: Colors.textMuted },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm },
  seeAll: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  actionCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 2, ...Shadow.sm },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { ...Typography.label },
  emptyBox: { margin: Spacing.md, backgroundColor: Colors.surfaceWarm, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  emptyText: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  orderCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCrop: { ...Typography.h4, color: Colors.textPrimary },
  orderConsumer: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderAmount: { ...Typography.h4, color: Colors.primary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cropRow: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  cropRank: { ...Typography.h4, color: Colors.textMuted, width: 28 },
  cropName: { ...Typography.h4, color: Colors.textPrimary, flex: 1 },
  cropRevenue: { ...Typography.h4, color: Colors.success },
  logoutBtn: { margin: Spacing.xl, padding: Spacing.md, alignItems: 'center', borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.error },
  logoutText: { ...Typography.button, color: Colors.error },
});

export default FarmerDashboardScreen;
