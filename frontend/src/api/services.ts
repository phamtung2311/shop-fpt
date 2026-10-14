import api from './client';
import {
  ApiResponse,
  AuthRequest,
  AuthResponse,
  Category,
  ComponentType,
  DashboardStats,
  Order,
  OrderRequest,
  OrderStatus,
  PageResponse,
  Product,
  RegisterRequest,
  Review,
} from '../types';

export const authApi = {
  register: async (data: RegisterRequest) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data;
  },
  login: async (data: AuthRequest) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<ApiResponse<AuthResponse>>('/auth/me');
    return res.data;
  },
};

export const categoryApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data;
  },
};

export const productApi = {
  getProducts: async (params?: {
    categoryId?: number;
    categorySlug?: string;
    brand?: string;
    componentType?: ComponentType;
    minPrice?: number;
    maxPrice?: number;
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return res.data;
  },
  getFeatured: async () => {
    const res = await api.get<ApiResponse<Product[]>>('/products/featured');
    return res.data;
  },
  getBestSellers: async () => {
    const res = await api.get<ApiResponse<Product[]>>('/products/best-sellers');
    return res.data;
  },
  getComponentsByType: async (type: ComponentType) => {
    const res = await api.get<ApiResponse<Product[]>>(`/products/components/${type}`);
    return res.data;
  },
};

export const orderApi = {
  createOrder: async (data: OrderRequest) => {
    const res = await api.post<ApiResponse<Order>>('/orders', data);
    return res.data;
  },
  getByCode: async (orderCode: string) => {
    const res = await api.get<ApiResponse<Order>>(`/orders/${orderCode}`);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my-orders');
    return res.data;
  },
};

export const reviewApi = {
  getByProductSlug: async (slug: string) => {
    const res = await api.get<ApiResponse<Review[]>>(`/products/${slug}/reviews`);
    return res.data;
  },
  createReview: async (slug: string, data: { authorName: string; rating: number; content: string }) => {
    const res = await api.post<ApiResponse<Review>>(`/products/${slug}/reviews`, data);
    return res.data;
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
    return res.data;
  },
  getAllOrders: async () => {
    const res = await api.get<ApiResponse<Order[]>>('/admin/orders');
    return res.data;
  },
  updateOrderStatus: async (orderId: number, status: OrderStatus) => {
    const res = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/status?status=${status}`);
    return res.data;
  },
  createProduct: async (data: Partial<Product>) => {
    const res = await api.post<ApiResponse<Product>>('/admin/products', data);
    return res.data;
  },
  updateProduct: async (id: number, data: Partial<Product>) => {
    const res = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: number) => {
    const res = await api.delete<ApiResponse<void>>(`/admin/products/${id}`);
    return res.data;
  },
  createCategory: async (data: Partial<Category>) => {
    const res = await api.post<ApiResponse<Category>>('/admin/categories', data);
    return res.data;
  },
  updateCategory: async (id: number, data: Partial<Category>) => {
    const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: number) => {
    const res = await api.delete<ApiResponse<void>>('/admin/categories/' + id);
    return res.data;
  },
};
