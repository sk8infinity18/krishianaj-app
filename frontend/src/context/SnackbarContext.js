import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../theme';

const SnackbarContext = createContext(null);

const TYPE_STYLES = {
  success: { backgroundColor: Colors.success },
  error: { backgroundColor: Colors.error },
  info: { backgroundColor: Colors.primaryDark },
  warning: { backgroundColor: Colors.warning },
};

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState(null);
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hideSnackbar = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 24, duration: 180, useNativeDriver: true }),
    ]).start(() => setSnackbar(null));
  }, [opacity, translateY]);

  const showSnackbar = useCallback((message, type = 'info', duration = 2400) => {
    if (!message) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSnackbar({ message, type });
    opacity.setValue(0);
    translateY.setValue(24);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(hideSnackbar, duration);
  }, [hideSnackbar, opacity, translateY]);

  const value = useMemo(() => ({
    showSnackbar,
    showSuccess: (message, duration) => showSnackbar(message, 'success', duration),
    showError: (message, duration) => showSnackbar(message, 'error', duration),
    showInfo: (message, duration) => showSnackbar(message, 'info', duration),
    showWarning: (message, duration) => showSnackbar(message, 'warning', duration),
  }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {snackbar ? (
        <View pointerEvents="none" style={styles.portal}>
          <Animated.View
            style={[
              styles.snackbar,
              TYPE_STYLES[snackbar.type] || TYPE_STYLES.info,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.message}>{snackbar.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  portal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  snackbar: {
    minWidth: '92%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    ...Shadow.md,
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '600',
  },
});
