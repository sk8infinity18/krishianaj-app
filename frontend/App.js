import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation';
import { Colors } from './src/theme';

const App = () => (
  <AuthProvider>
    <CartProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <AppNavigator />
    </CartProvider>
  </AuthProvider>
);

export default App;
