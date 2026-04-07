import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'consumer') fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCartItems(data.cart || []);
      setCartTotal(data.total || 0);
    } catch (err) {}
  };

  const addItem = async (listing_id, quantity) => {
    await api.addToCart({ listing_id, quantity });
    fetchCart();
  };

  const removeItem = async (id) => {
    await api.removeFromCart(id);
    fetchCart();
  };

  const clear = async () => {
    await api.clearCart();
    setCartItems([]);
    setCartTotal(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, fetchCart, addItem, removeItem, clear, itemCount: cartItems.length }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
