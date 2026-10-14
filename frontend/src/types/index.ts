export type Role = 'ROLE_CUSTOMER' | 'ROLE_ADMIN';

export type ComponentType =
  | 'NONE'
  | 'CPU'
  | 'MAINBOARD'
  | 'RAM'
  | 'VGA'
  | 'SSD'
  | 'PSU'
  | 'CASE'
  | 'COOLER';

export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount?: number;
}

export interface Review {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  content: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  originalPrice: number;
  salePrice: number;
  stockQuantity: number;
  thumbnail: string;
  images?: string[];
  description: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  vga?: string;
  screen?: string;
  battery?: string;
  warrantyMonths?: number;
  componentType: ComponentType;
  featured: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  categoryId?: number;
  categoryName?: string;
  createdAt: string;
  specs?: Record<string, string>;
}

export interface WarrantyOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  warrantyOption?: WarrantyOption;
  installmentNote?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productThumbnail?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  voucherCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  cancelReason?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface OrderRequestItem {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  items: OrderRequestItem[];
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface TopProduct {
  id: number;
  name: string;
  imageUrl?: string;
  categoryName?: string;
  soldQuantity: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus?: Record<string, number>;
  topSellingProducts?: TopProduct[];
  monthlyRevenues?: MonthlyRevenue[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ApplyVoucherResponse {
  code: string;
  description?: string;
  discountAmount: number;
  finalTotal: number;
}

export interface VoucherRequest {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

