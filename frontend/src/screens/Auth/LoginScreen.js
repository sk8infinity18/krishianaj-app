import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { showError, showWarning, showSuccess } = useSnackbar();
  const [role, setRole] = useState('farmer'); // 'farmer' | 'consumer'
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleLogin = async () => {
    if (!form.identifier || !form.password)
      return showWarning('Please enter your credentials');
    setLoading(true);
    try {
      let data;
      if (role === 'farmer') {
        data = await api.farmerLogin({ first_name: form.identifier, password: form.password });
      } else {
        data = await api.consumerLogin({ first_name: form.identifier, password: form.password });
      }
      await login(data.user, data.token);
      showSuccess('Signed in successfully');
    } catch (err) {
      showError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>{'\u{1F33E}'}</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to KrishiAnaj</Text>
        </View>

        {/* Role Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, role === 'farmer' && styles.activeTab]} onPress={() => setRole('farmer')}>
            <Text style={[styles.tabText, role === 'farmer' && styles.activeTabText]}>{'\u{1F9D1}\u200D\u{1F33E}'} Farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, role === 'consumer' && styles.activeTab]} onPress={() => setRole('consumer')}>
            <Text style={[styles.tabText, role === 'consumer' && styles.activeTabText]}>{'\u{1F6D2}'} Consumer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="First Name"
            value={form.identifier}
            onChangeText={set('identifier')}
            placeholder="Enter your first name"
            keyboardType="default"
            returnKeyType="next"
          />
          <Input label="Password" value={form.password} onChangeText={set('password')} placeholder="Enter password" secureTextEntry returnKeyType="done" onSubmitEditing={handleLogin} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role })} style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password? Reset via OTP</Text>
        </TouchableOpacity>

        <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(role === 'farmer' ? 'FarmerRegister' : 'ConsumerRegister')}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
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
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.borderLight, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.xl },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  activeTab: { backgroundColor: Colors.primary, ...Shadow.sm },
  tabText: { ...Typography.h4, color: Colors.textSecondary },
  activeTabText: { color: '#fff' },
  form: { marginBottom: Spacing.sm },
  forgot: { alignItems: 'flex-end', marginBottom: Spacing.xl },
  forgotText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  btn: { marginBottom: Spacing.lg },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  registerLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },
});

export default LoginScreen;
