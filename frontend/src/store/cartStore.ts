import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const savedCartStr = localStorage.getItem('cart');
let initialCart: CartItem[] = [];
if (savedCartStr) {
  try {
    initialCart = JSON.parse(savedCartStr);
  } catch (e) {
    console.error(e);
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: initialCart,

  addToCart: (product, quantity = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...items, { product, quantity }];
    }

    localStorage.setItem('cart', JSON.stringify(updated));
    set({ items: updated });
  },

  removeFromCart: (productId) => {
    const updated = get().items.filter((i) => i.product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updated));
    set({ items: updated });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updated = get().items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    localStorage.setItem('cart', JSON.stringify(updated));
    set({ items: updated });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.salePrice * item.quantity,
      0
    );
  },
}));
