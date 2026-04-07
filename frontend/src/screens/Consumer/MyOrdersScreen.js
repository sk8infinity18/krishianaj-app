import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { api } from '../../services/api';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const STATUS_COLORS = { pending: Colors.warning, confirmed: Colors.info, processing: Colors.info, dispatched: Colors.secondary, delivered: Colors.success, cancelled: Colors.error };
const STATUS_EMOJI = { pending: '⏳', confirmed: '✅', processing: '⚙️', dispatched: '🚚', delivered: '🎉', cancelled: '❌' };

const MyOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const FILTERS = ['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

  useEffect(() => {
    api.getConsumerOrders(filter !== 'all' ? { status: filter } : {}).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, [filter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>My Orders</Text></View>
      <View style={styles.filterRow}>
        <FlatList horizontal data={FILTERS} keyExtractor={i => i} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.filterChip, filter === item && styles.activeFilterChip]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, filter === item && styles.activeFilterText]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
            </TouchableOpacity>
          )} />
      </View>
      {loading ? <Text style={styles.loadingText}>Loading orders... ⏳</Text> :
        orders.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyEmoji}>📦</Text><Text style={styles.emptyText}>No orders yet</Text></View>
        ) : (
          <FlatList data={orders} keyExtractor={i => i.id} contentContainerStyle={{ padding: Spacing.md }}
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>#{item.order_number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || Colors.textMuted }]}>
                    <Text style={styles.statusText}>{STATUS_EMOJI[item.status]} {item.status}</Text>
                  </View>
                </View>
                <Text style={styles.cropName}>{item.crop_name}</Text>
                <Text style={styles.farmerName}>🧑‍🌾 {item.farmer_name} • {item.farm_name}</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.qty}>{item.quantity} {item.unit}</Text>
                  <Text style={styles.amount}>₹{parseFloat(item.total_amount).toFixed(2)}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                {item.status === 'delivered' && (
                  <TouchableOpacity style={styles.reviewBtn} onPress={() => navigation.navigate('AddReview', { order: item })}>
                    <Text style={styles.reviewBtnText}>⭐ Write a Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            )} />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.md, paddingTop: 48, paddingBottom: Spacing.md },
  headerTitle: { ...Typography.h2, color: '#fff' },
  filterRow: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  activeFilterChip: { backgroundColor: Colors.primary },
  filterText: { ...Typography.label, color: Colors.textSecondary },
  activeFilterText: { color: '#fff' },
  loadingText: { textAlign: 'center', marginTop: Spacing.xxl, ...Typography.bodyMedium, color: Colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3, color: Colors.textSecondary },
  orderCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderNumber: { ...Typography.label, color: Colors.textMuted },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  cropName: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 2 },
  farmerName: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  qty: { ...Typography.bodyMedium, color: Colors.textSecondary },
  amount: { ...Typography.h4, color: Colors.primary },
  date: { ...Typography.caption, color: Colors.textMuted, marginTop: 6 },
  reviewBtn: { marginTop: Spacing.sm, backgroundColor: Colors.surfaceWarm, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.secondary },
  reviewBtnText: { ...Typography.label, color: Colors.secondaryDark },
});

export default MyOrdersScreen;
