import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, Typography, Radius } from '../theme';

const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, icon, style, textStyle, size = 'md' }) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isAccent = variant === 'accent';

  const bgColor = isOutline || isGhost ? 'transparent' : isSecondary ? Colors.secondary : isAccent ? Colors.accent : Colors.primary;
  const txtColor = isOutline ? Colors.primary : isGhost ? Colors.textSecondary : Colors.textLight;
  const borderColor = isOutline ? Colors.primary : 'transparent';
  const paddingV = size === 'sm' ? 8 : size === 'lg' ? 18 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: bgColor, borderColor, borderWidth: isOutline ? 2 : 0, paddingVertical: paddingV, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[Typography.button, { color: txtColor, fontSize: size === 'sm' ? 13 : 15 }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: 8 },
});

export default Button;
