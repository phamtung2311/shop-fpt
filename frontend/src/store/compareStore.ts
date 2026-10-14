import { create } from 'zustand';
import { Product } from '../types';
import { useToastStore } from './toastStore';

interface CompareState {
  products: Product[];
  addProduct: (product: Product) => boolean;
  removeProduct: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
}

const STORAGE_KEY = 'shop-fpt-compare-storage';

const loadSavedCompare = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse compare storage:', e);
    return [];
  }
};

export const useCompareStore = create<CompareState>((set, get) => ({
  products: loadSavedCompare(),

  addProduct: (product: Product) => {
    const { products } = get();
    const showToast = useToastStore.getState().showToast;

    // Check if already in list
    if (products.some((p) => p.id === product.id)) {
      showToast('Sản phẩm này đã có trong danh sách so sánh!', 'info');
      return false;
    }

    // Check max limit (3 products)
    if (products.length >= 3) {
      showToast('Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!', 'info');
      return false;
    }

    // Check category consistency
    if (products.length > 0) {
      const firstProduct = products[0];
      const sameCategory =
        (firstProduct.categoryId && product.categoryId && firstProduct.categoryId === product.categoryId) ||
        (firstProduct.categoryName && product.categoryName && firstProduct.categoryName === product.categoryName) ||
        firstProduct.componentType === product.componentType;

      if (!sameCategory) {
        showToast(
          `Khuyên dùng: Nên so sánh các sản phẩm cùng ngành hàng (Danh mục hiện tại: ${firstProduct.categoryName || 'Thiết bị'})`,
          'info'
        );
      }
    }

    const updated = [...products, product];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    set({ products: updated });
    showToast(`Đã thêm "${product.name}" vào bảng so sánh!`, 'success');
    return true;
  },

  removeProduct: (productId: number) => {
    const updated = get().products.filter((p) => p.id !== productId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    set({ products: updated });
  },

  clearCompare: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    set({ products: [] });
  },

  isInCompare: (productId: number) => {
    return get().products.some((p) => p.id === productId);
  },
}));
