/**
 * Глобальное состояние корзины. Хранится в localStorage (mebel_cart).
 * Используется в CatalogPage, ProductPage, CartPage. Не трогать без понимания типов CartItem.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '../types/cart';

const CART_STORAGE_KEY = 'mebel_cart';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productUid: string) => void;
  updateQuantity: (productUid: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalSum: number;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Cart save failed', e);
  }
}

const TOAST_DURATION = 3000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredCart);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToastMessage(null);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = Math.max(1, item.quantity ?? 1);
    setItems((prev) => {
      const existing = prev.find((i) => i.productUid === item.productUid);
      if (existing) {
        return prev.map((i) =>
          i.productUid === item.productUid
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setToastMessage('Товар добавлен в корзину');
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION);
  }, []);

  const removeItem = useCallback((productUid: string) => {
    setItems((prev) => prev.filter((i) => i.productUid !== productUid));
  }, []);

  const updateQuantity = useCallback((productUid: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.productUid !== productUid));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productUid === productUid ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );
  const totalSum = useMemo(
    () => items.reduce((acc, i) => acc + i.priceNum * i.quantity, 0),
    [items]
  );

  const value: CartContextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalCount,
      totalSum,
      toastMessage,
      clearToast,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalCount, totalSum, toastMessage, clearToast]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
