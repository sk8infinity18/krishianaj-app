import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const EarningsScreen = ({ navigation }) => {
  const [data, setData] = useState({ total_earnings: 0, monthly: [], top_crops: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getFarmerEarnings().then(d => setData(d)).finally(() => setLoading(false)); }, []);

  const maxRevenue = Math.max(...(data.monthly?.map(m => parseFloat(m.revenue)) || [1]), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Total Earnings */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Lifetime Earnings</Text>
          <Text style={styles.totalValue}>₹{parseFloat(data.total_earnings || 0).toFixed(2)}</Text>
          <Text style={styles.totalSub}>from all delivered orders</Text>
        </View>

        {/* Monthly Bar Chart */}
        {data.monthly?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Monthly Revenue (Last 6 Months)</Text>
            <View style={styles.chartCard}>
              {[...data.monthly].reverse().map((m, i) => {
                const pct = (parseFloat(m.revenue) / maxRevenue) * 100;
                return (
                  <View key={i} style={styles.barRow}>
                    <Text style={styles.barMonth}>{m.month?.slice(5)}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.barValue}>₹{parseFloat(m.revenue).toFixed(0)}</Text>
                    <Text style={styles.barOrders}>{m.orders} orders</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Top Crops */}
        {data.top_crops?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Top Revenue Crops</Text>
            {data.top_crops.map((c, i) => (
              <View key={i} style={styles.cropCard}>
                <View style={styles.cropRankBadge}><Text style={styles.cropRankText}>#{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropName}>{c.crop_name}</Text>
                  <Text style={styles.cropSold}>{parseFloat(c.qty_sold).toFixed(1)} units sold</Text>
                </View>
                <Text style={styles.cropRevenue}>₹{parseFloat(c.revenue).toFixed(0)}</Text>
              </View>
            ))}
          </>
        )}

        {data.monthly?.length === 0 && data.top_crops?.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyEmoji}>📊</Text><Text style={styles.emptyText}>No earnings data yet</Text><Text style={styles.emptySub}>Start selling to see your stats here</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryDark, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  scroll: { padding: Spacing.md, paddingBottom: 48 },
  totalCard: { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.lg },
  totalLabel: { ...Typography.label, color: 'rgba(255,255,255,0.7)' },
  totalValue: { fontSize: 48, fontWeight: '800', color: Colors.secondaryLight, marginVertical: 4 },
  totalSub: { ...Typography.caption, color: 'rgba(255,255,255,0.6)' },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md, marginTop: Spacing.md },
  chartCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.lg },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  barMonth: { ...Typography.label, color: Colors.textMuted, width: 28 },
  barTrack: { flex: 1, height: 12, backgroundColor: Colors.borderLight, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 6 },
  barValue: { ...Typography.caption, color: Colors.primary, fontWeight: '700', width: 56, textAlign: 'right' },
  barOrders: { ...Typography.caption, color: Colors.textMuted, width: 50 },
  cropCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm, gap: Spacing.md },
  cropRankBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  cropRankText: { ...Typography.label, color: Colors.primaryDark },
  cropName: { ...Typography.h4, color: Colors.textPrimary },
  cropSold: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  cropRevenue: { ...Typography.h3, color: Colors.success },
  empty: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3, color: Colors.textSecondary },
  emptySub: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4 },
});

export default EarningsScreen;
