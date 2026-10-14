import { create } from 'zustand';
import { CartItem, Product, WarrantyOption } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    warrantyOption?: WarrantyOption,
    installmentNote?: string
  ) => void;
  removeFromCart: (productId: number, warrantyOptionId?: string) => void;
  updateQuantity: (productId: number, quantity: number, warrantyOptionId?: string) => void;
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

  addToCart: (product, quantity = 1, warrantyOption, installmentNote) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      (i) =>
        i.product.id === product.id &&
        i.warrantyOption?.id === warrantyOption?.id &&
        i.installmentNote === installmentNote
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...items, { product, quantity, warrantyOption, installmentNote }];
    }

    localStorage.setItem('cart', JSON.stringify(updated));
    set({ items: updated });
  },

  removeFromCart: (productId, warrantyOptionId) => {
    const updated = get().items.filter((i) => {
      if (i.product.id !== productId) return true;
      if (warrantyOptionId !== undefined) {
        return i.warrantyOption?.id !== warrantyOptionId;
      }
      return false;
    });
    localStorage.setItem('cart', JSON.stringify(updated));
    set({ items: updated });
  },

  updateQuantity: (productId, quantity, warrantyOptionId) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, warrantyOptionId);
      return;
    }
    const updated = get().items.map((i) => {
      const match =
        i.product.id === productId &&
        (warrantyOptionId === undefined || i.warrantyOption?.id === warrantyOptionId);
      return match ? { ...i, quantity } : i;
    });
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
    return get().items.reduce((total, item) => {
      const unitPrice = item.product.salePrice + (item.warrantyOption?.price || 0);
      return total + unitPrice * item.quantity;
    }, 0);
  },
}));
