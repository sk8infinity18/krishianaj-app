import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing } from '../../theme';

const ConsumerRegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone_number: '', email: '', password: '', confirm_password: '', delivery_city: '', delivery_state: '' });
  const [loading, setLoading] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.phone_number || !form.password)
      return Alert.alert('Missing Info', 'Please fill all required fields');
    if (form.password !== form.confirm_password)
      return Alert.alert('Password Mismatch', 'Passwords do not match');
    setLoading(true);
    try {
      const data = await api.consumerRegister(form);
      await login(data.user, data.token);
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.emoji}>🛒</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Buy fresh produce directly from farmers</Text>
        </View>

        <View style={styles.row}>
          <Input label="First Name *" value={form.first_name} onChangeText={set('first_name')} placeholder="Priya" style={styles.half} />
          <Input label="Last Name *" value={form.last_name} onChangeText={set('last_name')} placeholder="Sharma" style={styles.half} />
        </View>
        <Input label="Phone Number *" value={form.phone_number} onChangeText={set('phone_number')} placeholder="+91XXXXXXXXXX" keyboardType="phone-pad" />
        <Input label="Email (optional)" value={form.email} onChangeText={set('email')} placeholder="priya@email.com" keyboardType="email-address" />
        <View style={styles.row}>
          <Input label="City" value={form.delivery_city} onChangeText={set('delivery_city')} placeholder="Mumbai" style={styles.half} />
          <Input label="State" value={form.delivery_state} onChangeText={set('delivery_state')} placeholder="Maharashtra" style={styles.half} />
        </View>
        <Input label="Password *" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureTextEntry />
        <Input label="Confirm Password *" value={form.confirm_password} onChangeText={set('confirm_password')} placeholder="Re-enter password" secureTextEntry />

        <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.btn} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? <Text style={{ color: Colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
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
  title: { ...Typography.displaySmall, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  btn: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  loginLink: { alignItems: 'center' },
  loginText: { ...Typography.bodyMedium, color: Colors.textSecondary },
});

export default ConsumerRegisterScreen;
