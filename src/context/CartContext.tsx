import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant, StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';
import { getProductById, getStoreSettings, subscribeToStore } from '../services/store';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  isAlwaysFreeShipping: boolean;
  deliveryTime: string;
  total: number;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  revalidateCart: () => Promise<void>;
  notification: string | null;
  dismissNotification: () => void;
}

const CART_STORAGE_KEY = 'princelys_tech_cart_v2';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Sync settings and listen for updates
  useEffect(() => {
    let isMounted = true;
    getStoreSettings().then((s) => {
      if (isMounted && s) setSettings(s);
    });
    const unsubscribe = subscribeToStore(() => {
      getStoreSettings().then((s) => {
        if (isMounted && s) setSettings(s);
      });
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items]);

  // Revalidate prices and stock against store database
  const revalidateCart = async () => {
    const updatedItems: CartItem[] = [];
    for (const item of items) {
      const liveProduct = await getProductById(item.productId);
      if (liveProduct && liveProduct.isPublished && liveProduct.stock > 0) {
        let unitPrice = liveProduct.price;
        let variantStock = liveProduct.stock;
        let liveVariant = item.variant;

        if (item.variantId) {
          const foundVariant = liveProduct.variants.find((v) => v.id === item.variantId);
          if (foundVariant) {
            liveVariant = foundVariant;
            if (foundVariant.priceOverride) {
              unitPrice = foundVariant.priceOverride;
            }
            variantStock = foundVariant.stock;
          }
        }

        const safeQty = Math.min(item.quantity, Math.max(1, variantStock));
        updatedItems.push({
          ...item,
          product: liveProduct,
          variant: liveVariant,
          unitPrice,
          quantity: safeQty,
        });
      }
    }
    setItems(updatedItems);
  };

  const addItem = (product: Product, variant?: ProductVariant, quantity = 1) => {
    setItems((prevItems) => {
      const variantId = variant?.id;
      const existingIdx = prevItems.findIndex(
        (it) => it.productId === product.id && it.variantId === variantId
      );

      const unitPrice = variant?.priceOverride ?? product.price;
      const maxStock = variant ? variant.stock : product.stock;

      if (existingIdx !== -1) {
        const next = [...prevItems];
        const newQty = Math.min(next[existingIdx].quantity + quantity, maxStock);
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: newQty,
          unitPrice,
        };
        return next;
      } else {
        const initialQty = Math.min(quantity, Math.max(1, maxStock));
        return [
          ...prevItems,
          {
            productId: product.id,
            variantId,
            product,
            variant,
            quantity: initialQty,
            unitPrice,
          },
        ];
      }
    });

    const label = variant ? `${product.name} (${variant.optionValue})` : product.name;
    setNotification(`Added "${label}" to cart!`);
    setTimeout(() => {
      setNotification((curr) => (curr?.includes(product.name) ? null : curr));
    }, 3500);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) => prev.filter((it) => !(it.productId === productId && it.variantId === variantId)));
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((it) => {
        if (it.productId === productId && it.variantId === variantId) {
          const maxStock = it.variant ? it.variant.stock : it.product.stock;
          return { ...it, quantity: Math.min(quantity, maxStock) };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const dismissNotification = () => setNotification(null);

  // Computations based on live store settings
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const baseDeliveryFee = Math.max(0, Number(settings?.deliveryFee) || 0);
  const freeDeliveryThreshold = Math.max(0, Number(settings?.freeDeliveryThreshold) || 0);
  const isAlwaysFreeShipping = baseDeliveryFee === 0;

  // Free delivery applies if:
  // 1. Store flat fee is 0 (free shipping on all orders)
  // 2. Or subtotal meets/exceeds the free delivery threshold (when threshold > 0)
  const qualifiesForFreeDelivery = isAlwaysFreeShipping || (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold);
  const deliveryFee = subtotal === 0 || qualifiesForFreeDelivery ? 0 : baseDeliveryFee;

  const freeDeliveryRemaining = (isAlwaysFreeShipping || freeDeliveryThreshold <= 0)
    ? 0
    : Math.max(0, freeDeliveryThreshold - subtotal);

  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        baseDeliveryFee,
        freeDeliveryThreshold,
        freeDeliveryRemaining,
        isAlwaysFreeShipping,
        deliveryTime: settings?.deliveryTime || '5–7 days nationwide',
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        revalidateCart,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
