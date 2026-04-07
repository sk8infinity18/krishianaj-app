import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const { showError, showWarning, showSuccess } = useSnackbar();
  const userType = route.params?.role || 'farmer';
  const [step, setStep] = useState(1); // 1: enter phone, 2: enter OTP+newPW
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!phone) return showWarning('Enter your phone number');
    setLoading(true);
    try {
      await api.sendOTP({ phone_number: phone, user_type: userType });
      showSuccess('OTP sent successfully');
      setStep(2);
    } catch (err) { showError(err.message); }
    finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!otp || !newPw) return showWarning('Enter OTP and new password');
    if (newPw !== confirmPw) return showWarning('Passwords do not match');
    setLoading(true);
    try {
      await api.resetPassword({ phone_number: phone, otp_code: otp, new_password: newPw, user_type: userType });
      showSuccess('Password reset successfully');
      navigation.navigate('Login');
    } catch (err) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>We'll send an OTP to your registered phone number</Text>

        {step === 1 ? (
          <>
            <View style={styles.stepBadge}><Text style={styles.stepText}>Step 1 of 2 — Enter Phone</Text></View>
            <Input label="Registered Phone Number" value={phone} onChangeText={setPhone} placeholder="+91XXXXXXXXXX" keyboardType="phone-pad" />
            <Button title="Send OTP" onPress={sendOTP} loading={loading} style={styles.btn} />
          </>
        ) : (
          <>
            <View style={styles.stepBadge}><Text style={styles.stepText}>Step 2 of 2 — Enter OTP & New Password</Text></View>
            <View style={styles.otpHint}>
              <Text style={styles.otpHintText}>OTP sent to {phone}</Text>
              <TouchableOpacity onPress={sendOTP}><Text style={styles.resend}>Resend OTP</Text></TouchableOpacity>
            </View>
            <Input label="OTP Code" value={otp} onChangeText={setOtp} placeholder="6-digit OTP" keyboardType="number-pad" />
            <Input label="New Password" value={newPw} onChangeText={setNewPw} placeholder="Min 6 characters" secureTextEntry />
            <Input label="Confirm Password" value={confirmPw} onChangeText={setConfirmPw} placeholder="Re-enter new password" secureTextEntry />
            <Button title="Reset Password" onPress={resetPassword} loading={loading} style={styles.btn} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: 48 },
  back: { marginBottom: Spacing.md },
  backText: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '600' },
  emoji: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
  title: { ...Typography.displaySmall, color: Colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  subtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  stepBadge: { backgroundColor: Colors.surfaceWarm, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'center', marginBottom: Spacing.xl },
  stepText: { ...Typography.label, color: Colors.primary },
  otpHint: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  otpHintText: { ...Typography.bodySmall, color: Colors.textSecondary },
  resend: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  btn: { marginTop: Spacing.md },
});

export default ForgotPasswordScreen;
