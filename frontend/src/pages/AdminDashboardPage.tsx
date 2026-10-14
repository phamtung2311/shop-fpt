import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Clock,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle,
  Truck,
  XCircle,
  Cpu,
  Layers,
  Eye,
  X,
  Pencil,
  FolderTree,
  Tag as TagIcon
} from 'lucide-react';
import { adminApi, productApi, categoryApi, authApi } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { DashboardStats, Order, OrderStatus, Product, Category, ComponentType } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, setAuth } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'categories'>('stats');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Laptop');


  // New product form modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('ASUS');
  const [newProductPrice, setNewProductPrice] = useState('15000000');
  const [newProductThumbnail, setNewProductThumbnail] = useState('https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80');
  const [newProductCpu, setNewProductCpu] = useState('Intel Core i5-14400F');
  const [newProductRam, setNewProductRam] = useState('16GB DDR5');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    loadAdminData();
  }, [isAuthenticated, isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllOrders(),
        productApi.getProducts({ size: 100 }),
        categoryApi.getAll(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (productsRes.success && productsRes.data) setProducts(productsRes.data.content);
      if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi tải dữ liệu quản trị!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const res = await adminApi.updateOrderStatus(orderId, status);
      if (res.success) {
        setOrders(orders.map((o) => (o.id === orderId ? res.data : o)));
        adminApi.getStats().then((s) => s.success && setStats(s.data));
        showToast(`Đã chuyển đơn hàng sang trạng thái: ${status}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?')) {
      try {
        await adminApi.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
        showToast('Đã xóa sản phẩm thành công!', 'success');
        adminApi.getStats().then((s) => s.success && setStats(s.data));
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi xóa sản phẩm!', 'error');
      }
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: newProductName,
        brand: newProductBrand,
        originalPrice: Number(newProductPrice) * 1.15,
        salePrice: Number(newProductPrice),
        thumbnail: newProductThumbnail,
        cpu: newProductCpu,
        ram: newProductRam,
        description: 'Sản phẩm mới cập nhật vào hệ thống quản trị FPT TechStore.',
        stockQuantity: 20,
        componentType: 'NONE',
      };
      const res = await adminApi.createProduct(payload);
      if (res.success && res.data) {
        setProducts([res.data, ...products]);
        setShowAddProductModal(false);
        setNewProductName('');
        showToast('Thêm sản phẩm mới thành công!', 'success');
        adminApi.getStats().then((s) => s.success && setStats(s.data));
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi thêm sản phẩm!', 'error');
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await adminApi.updateProduct(editingProduct.id, editingProduct);
      if (res.success && res.data) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.data : p)));
        setEditingProduct(null);
        showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi cập nhật sản phẩm!', 'error');
    }
  };

  // Category handlers
  const handleOpenAddCategory = () => {
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setCategoryIcon('Laptop');
    setShowAddCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryDescription(cat.description || '');
    setCategoryIcon(cat.icon || 'Laptop');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await adminApi.updateCategory(editingCategory.id, {
          name: categoryName,
          icon: categoryIcon,
          description: categoryDescription,
        });
        if (res.success && res.data) {
          setCategories(categories.map((c) => (c.id === editingCategory.id ? res.data : c)));
          setEditingCategory(null);
          showToast('Cập nhật danh mục thành công!', 'success');
        }
      } else {
        const res = await adminApi.createCategory({
          name: categoryName,
          slug: categorySlug.trim() || undefined,
          icon: categoryIcon,
          description: categoryDescription,
        });
        if (res.success && res.data) {
          setCategories([...categories, res.data]);
          setShowAddCategoryModal(false);
          showToast('Thêm danh mục mới thành công!', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi lưu danh mục!', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await adminApi.deleteCategory(id);
        setCategories(categories.filter((c) => c.id !== id));
        showToast('Đã xóa danh mục!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi xóa danh mục (có thể có sản phẩm liên kết)!', 'error');
      }
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      const res = await authApi.login({ email: 'admin@fptshop.com', password: 'admin123' });
      if (res.success && res.data) {
        setAuth(
          {
            id: res.data.id,
            email: res.data.email,
            fullName: res.data.fullName,
            role: res.data.role as any,
          },
          res.data.token
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Khu Vực Quản Trị Hệ Thống</h2>
          <p className="text-xs text-slate-500 mt-1">
            Trang này dành riêng cho Quản trị viên (Admin) để quản lý đơn hàng, kho sản phẩm và xem báo cáo doanh thu.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
          <p className="font-bold text-slate-800">Thông tin tài khoản Admin:</p>
          <p>• Email: <code className="bg-white px-1.5 py-0.5 rounded text-red-600 font-mono font-bold">admin@fptshop.com</code></p>
          <p>• Mật khẩu: <code className="bg-white px-1.5 py-0.5 rounded text-red-600 font-mono font-bold">admin123</code></p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleQuickAdminLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>⚡ Đăng Nhập Nhanh Bằng Tài Khoản Admin (1-Click)</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            Đến trang đăng nhập thông thường
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded">
            PORTAL QUẢN TRỊ VIÊN
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Bảng Điều Khiển FPT TechStore</h1>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Đơn Hàng ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Sản Phẩm ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Danh Mục ({categories.length})
          </button>
        </div>
      </div>

      {/* TAB 1: STATS & OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Doanh Thu Đã Thu</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Tổng Đơn Hàng</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {stats?.totalOrders || 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Đơn Chờ Xử Lý</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Tổng Khách Hàng</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Đơn Hàng Gần Đây</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã Đơn</th>
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Tổng Tiền</th>
                    <th className="py-3 px-4">Phương Thức</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-red-600">{o.orderCode}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{o.customerName}</td>
                      <td className="py-3 px-4 font-bold">{formatCurrency(o.totalAmount)}</td>
                      <td className="py-3 px-4">{o.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Quản Lý Toàn Bộ Đơn Hàng</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Tổng Tiền</th>
                  <th className="py-3 px-4">Thanh Toán</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-red-600">{o.orderCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{o.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{o.customerPhone}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{o.paymentMethod}</span>
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                        o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        o.orderStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        o.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                        o.orderStatus === 'SHIPPING' ? 'bg-purple-50 text-purple-700' :
                        o.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center space-x-1"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem</span>
                      </button>
                      {o.orderStatus === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'CONFIRMED')}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-[11px] font-bold"
                          title="Duyệt đơn hàng"
                        >
                          Duyệt
                        </button>
                      )}
                      {o.orderStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'SHIPPING')}
                          className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-1 rounded text-[11px] font-bold"
                          title="Chuyển giao hàng"
                        >
                          Giao hàng
                        </button>
                      )}
                      {o.orderStatus === 'SHIPPING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'COMPLETED')}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[11px] font-bold"
                          title="Hoàn tất đơn"
                        >
                          Hoàn tất
                        </button>
                      )}
                      {o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded text-[11px] font-bold"
                          title="Hủy đơn"
                        >
                          Hủy
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">Danh Sách Sản Phẩm</h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ảnh</th>
                  <th className="py-3 px-4">Tên Sản Phẩm</th>
                  <th className="py-3 px-4">Hãng</th>
                  <th className="py-3 px-4">Giá Bán</th>
                  <th className="py-3 px-4">Kho</th>
                  <th className="py-3 px-4">Loại PC Builder</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded bg-slate-50 p-1 border border-slate-100"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{p.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{p.brand}</td>
                    <td className="py-3 px-4 font-bold text-red-600">{formatCurrency(p.salePrice)}</td>
                    <td className="py-3 px-4 font-semibold">{p.stockQuantity}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.componentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setEditingProduct({ ...p })}
                        className="text-slate-500 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Quản Lý Danh Mục Ngành Hàng</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quản lý các danh mục phân loại trên toàn hệ thống FPT TechStore</p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Danh Mục Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tên Danh Mục</th>
                  <th className="py-3 px-4">Đường Dẫn (Slug)</th>
                  <th className="py-3 px-4">Biểu Tượng</th>
                  <th className="py-3 px-4">Mô Tả</th>
                  <th className="py-3 px-4 text-center">Số Sản Phẩm</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{cat.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{cat.slug}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {cat.icon || 'Chưa đặt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        {cat.productCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="text-slate-500 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Chỉnh sửa danh mục"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
              Thêm Thiết Bị Mới Vào Kho
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ví dụ: Laptop ASUS TUF Gaming F15..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hãng</label>
                  <input
                    type="text"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Ảnh Thumbnail</label>
                <input
                  type="url"
                  value={newProductThumbnail}
                  onChange={(e) => setNewProductThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thông số CPU</label>
                  <input
                    type="text"
                    value={newProductCpu}
                    onChange={(e) => setNewProductCpu(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thông số RAM</label>
                  <input
                    type="text"
                    value={newProductRam}
                    onChange={(e) => setNewProductRam(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chi tiết đơn hàng</span>
                <h3 className="font-extrabold text-base text-red-600">{selectedOrder.orderCode}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400">Khách nhận hàng:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-slate-600">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-slate-400">Địa chỉ giao hàng:</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.shippingAddress}</p>
                  {selectedOrder.note && (
                    <p className="text-slate-500 italic mt-1">Ghi chú: "{selectedOrder.note}"</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Danh Sách Món Đặt Mua ({selectedOrder.items?.length || 0})</h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center space-x-3 min-w-0">
                        {item.productThumbnail ? (
                          <img
                            src={item.productThumbnail}
                            alt={item.productName}
                            className="w-10 h-10 object-contain rounded bg-slate-50 shrink-0 border border-slate-100 p-0.5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
                            FPT
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-slate-400 text-[11px]">Đơn giá: {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">x{item.quantity}</p>
                        <p className="font-extrabold text-red-600">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-700">Tổng thanh toán:</span>
                <span className="font-black text-xl text-red-600">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">
                Trạng thái hiện tại: <strong className="text-slate-900">{selectedOrder.orderStatus}</strong>
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chỉnh sửa thông tin thiết bị</span>
                <h3 className="font-extrabold text-base text-slate-900">{editingProduct.name}</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hãng sản xuất</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.salePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá gốc niêm yết (VNĐ)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng trong kho</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-white"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slot PC Builder</label>
                  <select
                    value={editingProduct.componentType || 'NONE'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, componentType: e.target.value as ComponentType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-white"
                  >
                    <option value="NONE">NONE (Không phải linh kiện PC)</option>
                    <option value="CPU">CPU (Bộ vi xử lý)</option>
                    <option value="MAINBOARD">MAINBOARD (Bo mạch chủ)</option>
                    <option value="RAM">RAM (Bộ nhớ trong)</option>
                    <option value="VGA">VGA (Card đồ họa)</option>
                    <option value="SSD">SSD (Ổ cứng lưu trữ)</option>
                    <option value="PSU">PSU (Nguồn máy tính)</option>
                    <option value="CASE">CASE (Vỏ máy tính)</option>
                    <option value="COOLER">COOLER (Tản nhiệt)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Ảnh Sản Phẩm (Thumbnail)</label>
                <input
                  type="url"
                  value={editingProduct.thumbnail}
                  onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thông số CPU</label>
                  <input
                    type="text"
                    value={editingProduct.cpu || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cpu: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thông số RAM</label>
                  <input
                    type="text"
                    value={editingProduct.ram || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ram: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ổ cứng / Lưu trữ</label>
                  <input
                    type="text"
                    value={editingProduct.storage || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, storage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card màn hình (VGA)</label>
                  <input
                    type="text"
                    value={editingProduct.vga || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, vga: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow"
                >
                  Cập Nhật Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {(showAddCategoryModal || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ví dụ: Màn hình máy tính, Bàn phím cơ..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đường dẫn slug (để trống sẽ tự sinh)</label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="vi-du: man-hinh-may-tinh"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biểu tượng (Icon)</label>
                <select
                  value={categoryIcon}
                  onChange={(e) => setCategoryIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-white"
                >
                  <option value="Smartphone">Smartphone (Điện thoại)</option>
                  <option value="Laptop">Laptop (Máy tính xách tay)</option>
                  <option value="Monitor">Monitor (Màn hình / PC)</option>
                  <option value="Cpu">Cpu (Linh kiện máy tính)</option>
                  <option value="Headphones">Headphones (Tai nghe & Loa)</option>
                  <option value="Briefcase">Briefcase (Văn phòng)</option>
                  <option value="Package">Package (Khác)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Mô tả ngành hàng hiển thị trên trang chủ và danh mục..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow"
                >
                  {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

