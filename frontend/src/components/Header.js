import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

const Header = ({ title, subtitle, onBack, rightAction, rightLabel, transparent = false }) => (
  <View style={[styles.header, transparent && styles.transparent]}>
    <StatusBar barStyle="light-content" backgroundColor={transparent ? 'transparent' : Colors.primary} translucent={transparent} />
    <View style={styles.row}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : <View style={styles.backBtn} />}

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {rightAction ? (
        <TouchableOpacity onPress={rightAction} style={styles.rightBtn}>
          <Text style={styles.rightLabel}>{rightLabel || '⋮'}</Text>
        </TouchableOpacity>
      ) : <View style={styles.backBtn} />}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.primary, paddingTop: StatusBar.currentHeight || 44, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  transparent: { backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: Colors.textLight, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center' },
  title: { ...Typography.h3, color: Colors.textLight },
  subtitle: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  rightBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  rightLabel: { fontSize: 16, color: Colors.textLight, fontWeight: '700' },
});

export default Header;
