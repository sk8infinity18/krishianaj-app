import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { api } from '../../services/api';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'processing', processing: 'dispatched', dispatched: 'delivered' };
const STATUS_COLORS = { pending: Colors.warning, confirmed: Colors.info, processing: '#8B5CF6', dispatched: Colors.secondary, delivered: Colors.success, cancelled: Colors.error };
const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered'];

const FarmerOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = () => {
    api.getFarmerOrders(filter !== 'all' ? { status: filter } : {}).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleUpdateStatus = (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    Alert.alert('Update Status', `Mark as "${next}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: async () => {
        try { await api.updateOrderStatus(order.id, next); fetchOrders(); }
        catch (err) { Alert.alert('Error', err.message); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <FlatList horizontal data={FILTERS} keyExtractor={i => i} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.filterChip, filter === item && styles.activeChip]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, filter === item && styles.activeChipText]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
            </TouchableOpacity>
          )} />
      </View>

      {loading ? <Text style={styles.loadingText}>Loading orders... ⏳</Text> :
        orders.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyEmoji}>📦</Text><Text style={styles.emptyText}>No {filter} orders</Text></View>
        ) : (
          <FlatList data={orders} keyExtractor={i => i.id} contentContainerStyle={{ padding: Spacing.md }}
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderNum}>#{item.order_number}</Text>
                    <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[item.status] }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.cropName}>{item.crop_name}</Text>
                <Text style={styles.consumerName}>👤 {item.consumer_name} • 📞 {item.consumer_phone}</Text>
                <Text style={styles.orderDetail}>{item.quantity} {item.unit} @ ₹{item.price_per_unit}/{item.unit}</Text>

                <View style={styles.amountRow}>
                  <Text style={styles.totalAmount}>₹{parseFloat(item.total_amount).toFixed(2)}</Text>
                  <Text style={styles.paymentMethod}>{item.payment_method?.toUpperCase()}</Text>
                </View>

                {NEXT_STATUS[item.status] && (
                  <TouchableOpacity style={styles.updateBtn} onPress={() => handleUpdateStatus(item)}>
                    <Text style={styles.updateBtnText}>Mark as {NEXT_STATUS[item.status]} →</Text>
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
  header: { backgroundColor: Colors.primaryDark, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  filterBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  activeChip: { backgroundColor: Colors.primary },
  filterText: { ...Typography.label, color: Colors.textSecondary },
  activeChipText: { color: '#fff' },
  loadingText: { textAlign: 'center', marginTop: Spacing.xxl, ...Typography.bodyMedium, color: Colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3, color: Colors.textSecondary },
  orderCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderNum: { ...Typography.label, color: Colors.textMuted },
  orderDate: { ...Typography.caption, color: Colors.textMuted },
  statusPill: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { ...Typography.caption, color: '#fff', fontWeight: '800' },
  cropName: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 4 },
  consumerName: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  orderDetail: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  totalAmount: { ...Typography.h2, color: Colors.primary },
  paymentMethod: { ...Typography.label, color: Colors.textMuted },
  updateBtn: { marginTop: Spacing.md, backgroundColor: Colors.primaryDark, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  updateBtnText: { ...Typography.button, color: Colors.textLight },
});

export default FarmerOrdersScreen;
