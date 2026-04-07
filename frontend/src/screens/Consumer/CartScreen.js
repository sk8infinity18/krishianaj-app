import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, Image } from 'react-native';
import { useCart } from '../../context/CartContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { resolveAssetUrl } from '../../services/api';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const CartScreen = ({ navigation }) => {
  const { cartItems, cartTotal, fetchCart, removeItem } = useCart();
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = (id, name) => {
    Alert.alert('Remove Item', `Remove ${name} from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeItem(id);
            showSuccess('Removed from cart');
          } catch (err) {
            showError(err.message);
          }
        }
      }
    ]);
  };

  if (cartItems.length === 0) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.headerTitle}>My Cart</Text><View style={{ width: 40 }} /></View>
      <View style={styles.empty}><Text style={styles.emptyEmoji}>🛒</Text><Text style={styles.emptyText}>Your cart is empty</Text><Text style={styles.emptySub}>Explore fresh produce from farmers</Text>
        <Button title="Browse Produce" onPress={() => navigation.navigate('Home')} style={styles.browseBtn} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={cartItems}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: Spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            {item.images?.[0] ? <Image source={{ uri: resolveAssetUrl(item.images[0]) }} style={styles.itemImg} /> : <View style={styles.itemImgPlaceholder}><Text style={{ fontSize: 28 }}>🌾</Text></View>}
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.itemName}>{item.crop_name}</Text>
              <Text style={styles.itemFarmer}>{item.farmer_name}</Text>
              <Text style={styles.itemQty}>{item.quantity} {item.unit} × ₹{item.price_per_unit}</Text>
              <Text style={styles.itemTotal}>₹{(item.quantity * item.price_per_unit).toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id, item.crop_name)} style={styles.removeBtn}>
              <Text style={styles.removeIcon}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{parseFloat(cartTotal).toFixed(2)}</Text>
        </View>
        <Button title="Proceed to Order" onPress={() => navigation.navigate('PlaceOrder')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyText: { ...Typography.h2, color: Colors.textSecondary },
  emptySub: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  browseBtn: { marginTop: Spacing.xl },
  cartItem: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, alignItems: 'center' },
  itemImg: { width: 70, height: 70, borderRadius: Radius.md },
  itemImgPlaceholder: { width: 70, height: 70, borderRadius: Radius.md, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  itemName: { ...Typography.h4, color: Colors.textPrimary },
  itemFarmer: { ...Typography.caption, color: Colors.textMuted },
  itemQty: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  itemTotal: { ...Typography.h4, color: Colors.primary, marginTop: 4 },
  removeBtn: { padding: 8 },
  removeIcon: { fontSize: 20 },
  footer: { backgroundColor: Colors.surface, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  totalLabel: { ...Typography.h3, color: Colors.textSecondary },
  totalValue: { ...Typography.h2, color: Colors.primary },
});

export default CartScreen;
