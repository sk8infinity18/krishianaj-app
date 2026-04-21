import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography } from '../theme';

// Auth Screens
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import FarmerRegisterScreen from '../screens/Auth/FarmerRegisterScreen';
import ConsumerRegisterScreen from '../screens/Auth/ConsumerRegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

// Farmer Screens
import FarmerDashboardScreen from '../screens/Farmer/FarmerDashboardScreen';
import AddListingScreen from '../screens/Farmer/AddListingScreen';
import MyListingsScreen from '../screens/Farmer/MyListingsScreen';
import FarmerOrdersScreen from '../screens/Farmer/FarmerOrdersScreen';
import EarningsScreen from '../screens/Farmer/EarningsScreen';
import FarmerProfileScreen from '../screens/Farmer/FarmerProfileScreen';
import FarmerReviewsScreen from '../screens/Farmer/FarmerReviewsScreen';

// Consumer Screens
import HomeScreen from '../screens/Consumer/HomeScreen';
import ProductDetailScreen from '../screens/Consumer/ProductDetailScreen';
import CartScreen from '../screens/Consumer/CartScreen';
import PlaceOrderScreen from '../screens/Consumer/PlaceOrderScreen';
import MyOrdersScreen from '../screens/Consumer/MyOrdersScreen';
import AddReviewScreen from '../screens/Consumer/AddReviewScreen';
import ConsumerProfileScreen from '../screens/Consumer/ConsumerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={{ alignItems: 'center', gap: 2 }}>
    <Text style={{ fontSize: 20 }}>{icon}</Text>
    <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '400', color: focused ? Colors.primary : Colors.textMuted }}>{label}</Text>
  </View>
);

const ICONS = {
  home: '\u{1F3E0}',
  listings: '\u{1F33F}',
  add: '\u2795',
  orders: '\u{1F4E6}',
  earnings: '\u{1F4B0}',
  search: '\u{1F50D}',
  cart: '\u{1F6D2}',
  splash: '\u{1F33E}',
};

const FarmerTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#fff', borderTopColor: Colors.border, height: 60, paddingBottom: 8 }, tabBarShowLabel: false }}>
    <Tab.Screen name="Dashboard" component={FarmerDashboardScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.home} label="Home" focused={focused} /> }} />
    <Tab.Screen name="MyListings" component={MyListingsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.listings} label="Listings" focused={focused} /> }} />
    <Tab.Screen name="AddListing" component={AddListingScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.add} label="Add" focused={focused} /> }} />
    <Tab.Screen name="FarmerOrders" component={FarmerOrdersScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.orders} label="Orders" focused={focused} /> }} />
    <Tab.Screen name="Earnings" component={EarningsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.earnings} label="Earnings" focused={focused} /> }} />
  </Tab.Navigator>
);

const ConsumerTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#fff', borderTopColor: Colors.border, height: 60, paddingBottom: 8 }, tabBarShowLabel: false }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.home} label="Home" focused={focused} /> }} />
    <Tab.Screen name="Search" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.search} label="Search" focused={focused} /> }} />
    <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.cart} label="Cart" focused={focused} /> }} />
    <Tab.Screen name="MyOrders" component={MyOrdersScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={ICONS.orders} label="Orders" focused={focused} /> }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }}>
      <Text style={{ fontSize: 52 }}>{ICONS.splash}</Text>
      <Text style={{ ...Typography.h2, color: '#fff', marginTop: 12 }}>KrishiAnaj</Text>
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="FarmerRegister" component={FarmerRegisterScreen} />
            <Stack.Screen name="ConsumerRegister" component={ConsumerRegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : user.role === 'farmer' ? (
          <>
            <Stack.Screen name="FarmerMain" component={FarmerTabs} />
            <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
            <Stack.Screen name="AddListing" component={AddListingScreen} />
            <Stack.Screen name="FarmerReviews" component={FarmerReviewsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="ConsumerMain" component={ConsumerTabs} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
            <Stack.Screen name="AddReview" component={AddReviewScreen} />
            <Stack.Screen name="ConsumerProfile" component={ConsumerProfileScreen} />
            <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
