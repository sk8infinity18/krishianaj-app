import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const PAYMENT_METHODS = [
  { id: 'pay_on_delivery', label: 'Pay On Delivery', icon: '\u20B9' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '\u{1F3E6}' },
];

const PlaceOrderScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clear } = useCart();
  const { showSuccess, showError, showWarning } = useSnackbar();
  const [address, setAddress] = useState(user?.delivery_address || '');
  const [city, setCity] = useState(user?.delivery_city || '');
  const [state, setState] = useState(user?.delivery_state || '');
  const [pincode, setPincode] = useState(user?.delivery_pincode || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
  const [bankDetails, setBankDetails] = useState({ account_name: '', reference_number: '' });
  const [bankDetailsNotified, setBankDetailsNotified] = useState(false);
  const [loading, setLoading] = useState(false);
  const setBank = (key) => (val) => setBankDetails(details => ({ ...details, [key]: val }));

  useEffect(() => {
    const hasDetails = bankDetails.account_name.trim() && bankDetails.reference_number.trim();
    if (paymentMethod === 'bank_transfer' && hasDetails && !bankDetailsNotified) {
      showSuccess('Bank transfer details entered');
      setBankDetailsNotified(true);
    }
    if (!hasDetails && bankDetailsNotified) setBankDetailsNotified(false);
  }, [bankDetails, bankDetailsNotified, paymentMethod, showSuccess]);

  const handlePlaceOrders = async () => {
    if (!address || !city) {
      showWarning('Please enter delivery address');
      return;
    }
    if (cartItems.length === 0) {
      showWarning('Your cart is empty');
      return;
    }
    if (paymentMethod === 'bank_transfer' && (!bankDetails.account_name.trim() || !bankDetails.reference_number.trim())) {
      showWarning('Please enter bank transfer details');
      return;
    }
    setLoading(true);
    try {
      const promises = cartItems.map(item =>
        api.placeOrder({
          listing_id: item.listing_id,
          quantity: item.quantity,
          delivery_address: address,
          delivery_city: city,
          delivery_state: state,
          delivery_pincode: pincode,
          notes,
          payment_method: paymentMethod,
        })
      );
      await Promise.all(promises);
      await clear();
      showSuccess('Order placed successfully');
      navigation.reset({ index: 0, routes: [{ name: 'ConsumerMain' }] });
    } catch (err) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>{'\u2190'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Input label="Full Address *" value={address} onChangeText={setAddress} placeholder="House/Plot No., Street, Area" multiline numberOfLines={3} />
        <View style={styles.row}>
          <Input label="City *" value={city} onChangeText={setCity} placeholder="Mumbai" style={styles.half} />
          <Input label="State" value={state} onChangeText={setState} placeholder="Maharashtra" style={styles.half} />
        </View>
        <Input label="PIN Code" value={pincode} onChangeText={setPincode} placeholder="400001" keyboardType="number-pad" />
        <Input label="Order Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any special instructions..." multiline numberOfLines={2} />

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentGroup}>
          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity key={pm.id} style={[styles.paymentCard, paymentMethod === pm.id && styles.paymentCardActive]} onPress={() => setPaymentMethod(pm.id)}>
              <Text style={styles.paymentIcon}>{pm.icon}</Text>
              <Text style={[styles.paymentLabel, paymentMethod === pm.id && styles.paymentLabelActive]}>{pm.label}</Text>
              {paymentMethod === pm.id && <Text style={styles.checkmark}>{'\u2713'}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {paymentMethod === 'bank_transfer' && (
          <View style={styles.bankBox}>
            <Text style={styles.bankInfo}>Demo Bank: KrishiAnaj Farmers Account</Text>
            <Text style={styles.bankInfo}>Account No: 0000000000 | IFSC: KRSH0001234</Text>
            <Input label="Account Holder Name *" value={bankDetails.account_name} onChangeText={setBank('account_name')} placeholder="Name used for transfer" />
            <Input label="Transaction Reference *" value={bankDetails.reference_number} onChangeText={setBank('reference_number')} placeholder="Dummy reference number" returnKeyType="done" />
          </View>
        )}

        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map(item => (
          <View key={item.listing_id} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>{item.crop_name} {'\u00D7'} {item.quantity} {item.unit}</Text>
            <Text style={styles.summaryPrice}>{'\u20B9'}{Number(item.quantity * item.price_per_unit).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{'\u20B9'}{parseFloat(cartTotal).toFixed(2)}</Text>
        </View>

        <Button title={`Confirm Order - \u20B9${parseFloat(cartTotal).toFixed(2)}`} onPress={handlePlaceOrders} loading={loading} variant="accent" style={styles.orderBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.md, paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: '#fff', fontWeight: '700', width: 40 },
  headerTitle: { ...Typography.h3, color: '#fff' },
  scroll: { padding: Spacing.md, paddingBottom: 48 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  paymentGroup: { gap: Spacing.sm, marginBottom: Spacing.lg },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border },
  paymentCardActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceWarm },
  paymentIcon: { fontSize: 20, marginRight: Spacing.md },
  paymentLabel: { ...Typography.h4, color: Colors.textSecondary, flex: 1 },
  paymentLabelActive: { color: Colors.primary },
  checkmark: { color: Colors.primary, fontWeight: '700', fontSize: 18 },
  bankBox: { marginBottom: Spacing.lg },
  bankInfo: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: Spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  summaryItem: { ...Typography.bodyMedium, color: Colors.textSecondary },
  summaryPrice: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, marginBottom: Spacing.md },
  totalLabel: { ...Typography.h3, color: Colors.textPrimary },
  totalValue: { ...Typography.h2, color: Colors.primary },
  orderBtn: { marginTop: Spacing.md },
});

export default PlaceOrderScreen;
