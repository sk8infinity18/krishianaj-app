import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const FarmerRegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { showError, showWarning, showSuccess } = useSnackbar();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone_number: '', farmer_id: '', password: '', confirm_password: '', farm_name: '', farm_state: '', farm_district: '' });
  const [loading, setLoading] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.phone_number || !form.farmer_id || !form.password)
      return showWarning('Please fill all required fields');
    if (form.password !== form.confirm_password)
      return showWarning('Passwords do not match');
    if (form.password.length < 6)
      return showWarning('Password must be at least 6 characters');

    setLoading(true);
    try {
      const data = await api.farmerRegister(form);
      await login(data.user, data.token);
      showSuccess('Account created successfully');
    } catch (err) {
      showError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.emoji}>🧑‍🌾</Text>
          <Text style={styles.title}>Farmer Registration</Text>
          <Text style={styles.subtitle}>Join KrishiAnaj and sell directly to consumers</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal Details</Text>
          <View style={styles.row}>
            <Input label="First Name *" value={form.first_name} onChangeText={set('first_name')} placeholder="Rajesh" style={styles.half} />
            <Input label="Last Name *" value={form.last_name} onChangeText={set('last_name')} placeholder="Kumar" style={styles.half} />
          </View>
          <Input label="Phone Number *" value={form.phone_number} onChangeText={set('phone_number')} placeholder="+91XXXXXXXXXX" keyboardType="phone-pad" />
          <Input label="Farmer ID (Govt. Issued) *" value={form.farmer_id} onChangeText={set('farmer_id')} placeholder="e.g. PM-KISAN / State ID" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Farm Details</Text>
          <Input label="Farm Name" value={form.farm_name} onChangeText={set('farm_name')} placeholder="e.g. Green Valley Farm" />
          <View style={styles.row}>
            <Input label="State" value={form.farm_state} onChangeText={set('farm_state')} placeholder="Punjab" style={styles.half} />
            <Input label="District" value={form.farm_district} onChangeText={set('farm_district')} placeholder="Ludhiana" style={styles.half} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Set Password</Text>
          <Input label="Password *" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureTextEntry />
          <Input label="Confirm Password *" value={form.confirm_password} onChangeText={set('confirm_password')} placeholder="Re-enter password" secureTextEntry />
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>📋 Your Farmer ID will be verified. Please enter your valid government-issued farmer ID (PM-KISAN, State Kisan Card, etc.)</Text>
        </View>

        <Button title="Register as Farmer" onPress={handleRegister} loading={loading} style={styles.btn} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>Already registered? <Text style={{ color: Colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: 48 },
  back: { marginBottom: Spacing.md },
  backText: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { ...Typography.displaySmall, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { ...Typography.label, color: Colors.primary, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  noteBox: { backgroundColor: Colors.surfaceWarm, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xl, borderLeftWidth: 3, borderLeftColor: Colors.secondary },
  noteText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 20 },
  btn: { marginBottom: Spacing.lg },
  loginLink: { alignItems: 'center' },
  loginText: { ...Typography.bodyMedium, color: Colors.textSecondary },
});

export default FarmerRegisterScreen;
