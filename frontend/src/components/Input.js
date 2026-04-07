import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../theme';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, icon, multiline, numberOfLines, editable = true, style }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, focused && styles.focused, error && styles.errorBorder, !editable && styles.disabled]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, multiline && { height: numberOfLines * 22, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType || 'default'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eye}>
            <Text style={{ color: Colors.textMuted }}>{showPass ? '👁' : '👁‍🗨'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.md,
  },
  focused: { borderColor: Colors.primary, backgroundColor: Colors.surfaceWarm },
  errorBorder: { borderColor: Colors.error },
  disabled: { opacity: 0.6, backgroundColor: Colors.borderLight },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, paddingVertical: 14, ...Typography.bodyLarge, color: Colors.textPrimary },
  eye: { padding: 4 },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: 4, marginLeft: 4 },
});

export default Input;
