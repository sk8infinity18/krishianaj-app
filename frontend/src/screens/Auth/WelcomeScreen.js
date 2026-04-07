import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ImageBackground } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top decorative section */}
      <View style={styles.hero}>
        <View style={styles.circleDecor1} />
        <View style={styles.circleDecor2} />
        <View style={styles.circleDecor3} />
        <Text style={styles.emoji}>🌾</Text>
        <Text style={styles.brandName}>KrishiAnaj</Text>
        <Text style={styles.tagline}>खेत से थाली तक</Text>
        <Text style={styles.taglineEn}>From Farm to Table — Direct</Text>
      </View>

      {/* Bottom panel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Fresh Produce,{'\n'}Straight from Farmers</Text>
        <Text style={styles.body}>Connect directly with farmers across India. No middlemen, fair prices, fresh produce.</Text>

        <View style={styles.roleRow}>
          <TouchableOpacity style={[styles.roleCard, styles.farmerCard]} onPress={() => navigation.navigate('FarmerRegister')}>
            <Text style={styles.roleEmoji}>🧑‍🌾</Text>
            <Text style={styles.roleTitle}>I'm a Farmer</Text>
            <Text style={styles.roleSub}>Sell my produce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleCard, styles.consumerCard]} onPress={() => navigation.navigate('ConsumerRegister')}>
            <Text style={styles.roleEmoji}>🛒</Text>
            <Text style={styles.roleTitle}>I'm a Consumer</Text>
            <Text style={styles.roleSub}>Buy fresh crops</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  circleDecor1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -60 },
  circleDecor2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.04)', bottom: 20, left: -50 },
  circleDecor3: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.secondary, opacity: 0.2, top: 40, left: 30 },
  emoji: { fontSize: 64, marginBottom: 8 },
  brandName: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  tagline: { fontSize: 18, color: Colors.secondaryLight, fontWeight: '600', marginTop: 4 },
  taglineEn: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 0.5 },
  panel: {
    backgroundColor: Colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: Spacing.xl, paddingBottom: 40,
  },
  heading: { ...Typography.displaySmall, color: Colors.textPrimary, marginBottom: Spacing.sm },
  body: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 22 },
  roleRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  roleCard: {
    flex: 1, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', ...Shadow.md,
  },
  farmerCard: { backgroundColor: Colors.primary },
  consumerCard: { backgroundColor: Colors.secondary },
  roleEmoji: { fontSize: 32, marginBottom: 8 },
  roleTitle: { ...Typography.h4, color: '#fff', marginBottom: 2 },
  roleSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.8)' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  loginLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '700' },
});

export default WelcomeScreen;
