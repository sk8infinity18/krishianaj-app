import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import AppNavigator from './src/navigation';
import { Colors } from './src/theme';

const App = () => (
  <AuthProvider>
    <SnackbarProvider>
      <CartProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <AppNavigator />
      </CartProvider>
    </SnackbarProvider>
  </AuthProvider>
);

export default App;
