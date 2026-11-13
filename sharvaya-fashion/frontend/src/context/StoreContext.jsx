import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/*
 * Holds what is specific to one shopper's browser: the cart and the small toast messages.
 * Products come from the API (see src/hooks/useProducts.js), not from here.
 */

const StoreContext = createContext(null);
const CART_KEY = 'sharvaya.cart.v1';

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* storage is full or blocked: the cart just won't persist */
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(readCart);
  const [toast, setToast] = useState(null);

  // Keep the cart in sync across open tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY) setCart(readCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message) => setToast({ id: Date.now(), message }), []);

  const addToCart = useCallback((id) => {
    setCart((current) => {
      const found = current.some((item) => item.id === id);
      const next = found
        ? current.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
        : [...current, { id, qty: 1 }];
      writeCart(next);
      return next;
    });
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const value = useMemo(
    () => ({ cart, cartCount, addToCart, toast, notify }),
    [cart, cartCount, addToCart, toast, notify]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
