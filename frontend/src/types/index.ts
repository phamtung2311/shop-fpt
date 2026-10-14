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

export type PaymentMethod = 'COD' | 'VNPAY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
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
}

export interface CartItem {
  product: Product;
  quantity: number;
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
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
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
  items: OrderRequestItem[];
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalUsers: number;
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

