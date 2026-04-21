import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const { showError, showWarning, showSuccess } = useSnackbar();
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState({ identifier: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleReset = async () => {
    if (!form.identifier || !form.password) return showWarning('Please enter your account ID and new password');
    if (form.password !== form.confirm_password) return showWarning('Passwords do not match');
    if (form.password.length < 6) return showWarning('Password must be at least 6 characters');

    setLoading(true);
    try {
      await api.forgotPassword({ role, identifier: form.identifier, new_password: form.password });
      showSuccess('Password updated successfully');
      navigation.navigate('Login');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>{'\u{1F33E}'}</Text>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Use your Farmer ID or Consumer ID</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, role === 'farmer' && styles.activeTab]} onPress={() => setRole('farmer')}>
            <Text style={[styles.tabText, role === 'farmer' && styles.activeTabText]}>{'\u{1F9D1}\u200D\u{1F33E}'} Farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, role === 'consumer' && styles.activeTab]} onPress={() => setRole('consumer')}>
            <Text style={[styles.tabText, role === 'consumer' && styles.activeTabText]}>{'\u{1F6D2}'} Consumer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input label={role === 'farmer' ? 'Farmer ID' : 'Consumer ID'} value={form.identifier} onChangeText={set('identifier')} placeholder={role === 'farmer' ? 'Enter your Farmer ID' : 'Enter your Consumer ID'} returnKeyType="next" />
          <Input label="New Password" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureTextEntry returnKeyType="next" />
          <Input label="Confirm New Password" value={form.confirm_password} onChangeText={set('confirm_password')} placeholder="Re-enter password" secureTextEntry returnKeyType="done" onSubmitEditing={handleReset} />
        </View>

        <Button title="Update Password" onPress={handleReset} loading={loading} style={styles.btn} />
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
  logo: { fontSize: 52, marginBottom: 8 },
  title: { ...Typography.displaySmall, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.borderLight, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.xl },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  activeTab: { backgroundColor: Colors.primary, ...Shadow.sm },
  tabText: { ...Typography.h4, color: Colors.textSecondary },
  activeTabText: { color: '#fff' },
  form: { marginBottom: Spacing.sm },
  btn: { marginTop: Spacing.md },
});

export default ForgotPasswordScreen;
