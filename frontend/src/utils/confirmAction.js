import { Alert, Platform } from 'react-native';

export const confirmAction = async (title, message) => {
  if (Platform.OS === 'web') {
    if (typeof globalThis.confirm === 'function') {
      return globalThis.confirm(`${title}\n\n${message}`);
    }
    return true;
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'OK', onPress: () => resolve(true) },
    ]);
  });
};
