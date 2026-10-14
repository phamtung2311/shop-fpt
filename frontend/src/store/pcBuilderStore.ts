import { create } from 'zustand';
import { ComponentType, Product } from '../types';

export interface PCSlot {
  type: ComponentType;
  title: string;
  iconName: string;
  required: boolean;
  selectedProduct: Product | null;
}

export const INITIAL_SLOTS: PCSlot[] = [
  { type: 'CPU', title: 'Vi xử lý (CPU)', iconName: 'Cpu', required: true, selectedProduct: null },
  { type: 'MAINBOARD', title: 'Bo mạch chủ (Mainboard)', iconName: 'Layers', required: true, selectedProduct: null },
  { type: 'RAM', title: 'Bộ nhớ RAM', iconName: 'HardDrive', required: true, selectedProduct: null },
  { type: 'VGA', title: 'Card màn hình (VGA)', iconName: 'Monitor', required: false, selectedProduct: null },
  { type: 'SSD', title: 'Ổ cứng SSD/HDD', iconName: 'Database', required: true, selectedProduct: null },
  { type: 'PSU', title: 'Nguồn máy tính (PSU)', iconName: 'Zap', required: true, selectedProduct: null },
  { type: 'CASE', title: 'Vỏ máy tính (Case)', iconName: 'Box', required: true, selectedProduct: null },
  { type: 'COOLER', title: 'Tản nhiệt CPU', iconName: 'Wind', required: false, selectedProduct: null },
];

interface PCBuilderState {
  slots: PCSlot[];
  setComponent: (type: ComponentType, product: Product) => void;
  removeComponent: (type: ComponentType) => void;
  resetBuild: () => void;
  getTotalPrice: () => number;
  getSelectedCount: () => number;
}

export const usePCBuilderStore = create<PCBuilderState>((set, get) => ({
  slots: INITIAL_SLOTS,

  setComponent: (type, product) => {
    set({
      slots: get().slots.map((slot) =>
        slot.type === type ? { ...slot, selectedProduct: product } : slot
      ),
    });
  },

  removeComponent: (type) => {
    set({
      slots: get().slots.map((slot) =>
        slot.type === type ? { ...slot, selectedProduct: null } : slot
      ),
    });
  },

  resetBuild: () => {
    set({ slots: INITIAL_SLOTS });
  },

  getTotalPrice: () => {
    return get().slots.reduce((total, slot) => {
      return total + (slot.selectedProduct ? slot.selectedProduct.salePrice : 0);
    }, 0);
  },

  getSelectedCount: () => {
    return get().slots.filter((slot) => slot.selectedProduct !== null).length;
  },
}));
