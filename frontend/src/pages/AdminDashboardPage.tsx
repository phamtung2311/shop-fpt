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
  Tag as TagIcon,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Ticket,
  Percent,
  Calendar,
  Upload,
  Image as ImageIcon,
  Star as StarIcon,
  TrendingUp,
  BarChart3,
  PieChart,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { adminApi, productApi, categoryApi, authApi, uploadApi } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { DashboardStats, Order, OrderStatus, Product, Category, ComponentType, UserProfile, Voucher, VoucherRequest, DiscountType } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, setAuth } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'categories' | 'users' | 'vouchers'>('stats');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [statusModalUser, setStatusModalUser] = useState<UserProfile | null>(null);

  // Voucher states
  const [vouchersList, setVouchersList] = useState<Voucher[]>([]);
  const [voucherSearchKeyword, setVoucherSearchKeyword] = useState('');
  const [showAddVoucherModal, setShowAddVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);

  // Voucher form states
  const [vCode, setVCode] = useState('');
  const [vDescription, setVDescription] = useState('');
  const [vDiscountType, setVDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [vDiscountValue, setVDiscountValue] = useState<number | string>(10);
  const [vMinOrderValue, setVMinOrderValue] = useState<number | string>(0);
  const [vMaxDiscountAmount, setVMaxDiscountAmount] = useState<number | string>('');
  const [vUsageLimit, setVUsageLimit] = useState<number | string>(100);
  const [vStartDate, setVStartDate] = useState('');
  const [vEndDate, setVEndDate] = useState('');
  const [vIsActive, setVIsActive] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
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
  const [newProductImages, setNewProductImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'
  ]);
  const [newProductCpu, setNewProductCpu] = useState('Intel Core i5-14400F');
  const [newProductRam, setNewProductRam] = useState('16GB DDR5');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [albumInputUrl, setAlbumInputUrl] = useState('');
  const [editAlbumInputUrl, setEditAlbumInputUrl] = useState('');

  const handleUploadFile = async (
    file: File,
    target: 'new_thumb' | 'new_album' | 'edit_thumb' | 'edit_album'
  ) => {
    try {
      setUploadingImage(true);
      const res = await uploadApi.uploadImage(file);
      if (res.success && res.data) {
        const url = res.data.url;
        showToast('Tải ảnh lên hệ thống thành công!', 'success');
        if (target === 'new_thumb') {
          setNewProductThumbnail(url);
          if (!newProductImages.includes(url)) {
            setNewProductImages([url, ...newProductImages]);
          }
        } else if (target === 'new_album') {
          if (!newProductImages.includes(url)) {
            setNewProductImages([...newProductImages, url]);
          }
        } else if (target === 'edit_thumb' && editingProduct) {
          const currentImgs = editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : []);
          const updatedImgs = currentImgs.includes(url) ? currentImgs : [url, ...currentImgs];
          setEditingProduct({
            ...editingProduct,
            thumbnail: url,
            images: updatedImgs,
          });
        } else if (target === 'edit_album' && editingProduct) {
          const currentImgs = editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : []);
          if (!currentImgs.includes(url)) {
            setEditingProduct({
              ...editingProduct,
              images: [...currentImgs, url],
            });
          }
        }
      } else {
        showToast(res.message || 'Lỗi khi tải ảnh lên!', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh!', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddNewAlbumUrl = () => {
    if (!albumInputUrl.trim()) return;
    const url = albumInputUrl.trim();
    if (!newProductImages.includes(url)) {
      setNewProductImages([...newProductImages, url]);
    }
    setAlbumInputUrl('');
  };

  const handleRemoveNewAlbumImage = (imgUrl: string) => {
    const updated = newProductImages.filter((img) => img !== imgUrl);
    setNewProductImages(updated);
    if (newProductThumbnail === imgUrl && updated.length > 0) {
      setNewProductThumbnail(updated[0]);
    }
  };

  const handleSetNewProductMainImage = (imgUrl: string) => {
    setNewProductThumbnail(imgUrl);
    const reordered = [imgUrl, ...newProductImages.filter((img) => img !== imgUrl)];
    setNewProductImages(reordered);
    showToast('Đã đặt làm ảnh chính sản phẩm!', 'success');
  };

  const handleAddEditAlbumUrl = () => {
    if (!editAlbumInputUrl.trim() || !editingProduct) return;
    const url = editAlbumInputUrl.trim();
    const currentImgs = editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : []);
    if (!currentImgs.includes(url)) {
      setEditingProduct({
        ...editingProduct,
        images: [...currentImgs, url],
      });
    }
    setEditAlbumInputUrl('');
  };

  const handleRemoveEditAlbumImage = (imgUrl: string) => {
    if (!editingProduct) return;
    const currentImgs = editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : []);
    const updated = currentImgs.filter((img) => img !== imgUrl);
    const newThumb = editingProduct.thumbnail === imgUrl && updated.length > 0 ? updated[0] : editingProduct.thumbnail;
    setEditingProduct({
      ...editingProduct,
      thumbnail: newThumb,
      images: updated,
    });
  };

  const handleSetEditProductMainImage = (imgUrl: string) => {
    if (!editingProduct) return;
    const currentImgs = editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : []);
    const reordered = [imgUrl, ...currentImgs.filter((img) => img !== imgUrl)];
    setEditingProduct({
      ...editingProduct,
      thumbnail: imgUrl,
      images: reordered,
    });
    showToast('Đã đặt làm ảnh chính sản phẩm!', 'success');
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    loadAdminData();
  }, [isAuthenticated, isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, usersRes, vouchersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllOrders(),
        productApi.getProducts({ size: 100 }),
        categoryApi.getAll(),
        adminApi.getUsers(),
        adminApi.getVouchers(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (productsRes.success && productsRes.data) setProducts(productsRes.data.content);
      if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
      if (usersRes.success && usersRes.data) setUsersList(usersRes.data);
      if (vouchersRes.success && vouchersRes.data) setVouchersList(vouchersRes.data);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi tải dữ liệu quản trị!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Voucher Handlers
  const handleOpenAddVoucher = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatInputDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setVCode('');
    setVDescription('');
    setVDiscountType('PERCENTAGE');
    setVDiscountValue(10);
    setVMinOrderValue(0);
    setVMaxDiscountAmount('');
    setVUsageLimit(100);
    setVStartDate(formatInputDate(now));
    setVEndDate(formatInputDate(nextMonth));
    setVIsActive(true);
    setEditingVoucher(null);
    setShowAddVoucherModal(true);
  };

  const handleOpenEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setVCode(voucher.code);
    setVDescription(voucher.description || '');
    setVDiscountType(voucher.discountType);
    setVDiscountValue(voucher.discountValue);
    setVMinOrderValue(voucher.minOrderValue ?? 0);
    setVMaxDiscountAmount(voucher.maxDiscountAmount ?? '');
    setVUsageLimit(voucher.usageLimit);
    setVStartDate(voucher.startDate ? voucher.startDate.substring(0, 16) : '');
    setVEndDate(voucher.endDate ? voucher.endDate.substring(0, 16) : '');
    setVIsActive(voucher.isActive);
    setShowAddVoucherModal(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim()) {
      showToast('Vui lòng nhập mã voucher!', 'error');
      return;
    }
    if (!vStartDate || !vEndDate) {
      showToast('Vui lòng chọn thời gian bắt đầu và kết thúc!', 'error');
      return;
    }

    const payload: VoucherRequest = {
      code: vCode.trim().toUpperCase(),
      description: vDescription.trim() || undefined,
      discountType: vDiscountType,
      discountValue: Number(vDiscountValue),
      minOrderValue: vMinOrderValue !== '' ? Number(vMinOrderValue) : undefined,
      maxDiscountAmount: vMaxDiscountAmount !== '' ? Number(vMaxDiscountAmount) : undefined,
      usageLimit: vUsageLimit !== '' ? Number(vUsageLimit) : 100,
      startDate: vStartDate.length === 16 ? `${vStartDate}:00` : vStartDate,
      endDate: vEndDate.length === 16 ? `${vEndDate}:00` : vEndDate,
      isActive: vIsActive,
    };

    try {
      setActionLoading(true);
      if (editingVoucher) {
        const res = await adminApi.updateVoucher(editingVoucher.id, payload);
        if (res.success && res.data) {
          setVouchersList(vouchersList.map((v) => (v.id === editingVoucher.id ? res.data : v)));
          setShowAddVoucherModal(false);
          setEditingVoucher(null);
          showToast(`Cập nhật voucher ${res.data.code} thành công!`, 'success');
        } else {
          showToast(res.message || 'Lỗi khi cập nhật voucher', 'error');
        }
      } else {
        const res = await adminApi.createVoucher(payload);
        if (res.success && res.data) {
          setVouchersList([res.data, ...vouchersList]);
          setShowAddVoucherModal(false);
          showToast(`Tạo mã voucher ${res.data.code} thành công!`, 'success');
        } else {
          showToast(res.message || 'Lỗi khi tạo voucher', 'error');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu voucher!';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteVoucher = async () => {
    if (!deletingVoucher) return;
    try {
      setActionLoading(true);
      const res = await adminApi.deleteVoucher(deletingVoucher.id);
      if (res.success) {
        setVouchersList(vouchersList.filter((v) => v.id !== deletingVoucher.id));
        showToast(`Đã xóa voucher ${deletingVoucher.code}!`, 'success');
        setDeletingVoucher(null);
      } else {
        showToast(res.message || 'Lỗi khi xóa voucher', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa voucher!';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmChangeRole = async () => {
    if (!roleModalUser) return;
    const targetRole = roleModalUser.role === 'ROLE_ADMIN' ? 'ROLE_CUSTOMER' : 'ROLE_ADMIN';
    try {
      setActionLoading(true);
      const res = await adminApi.updateUserRole(roleModalUser.id, targetRole);
      if (res.success && res.data) {
        setUsersList(usersList.map((u) => (u.id === roleModalUser.id ? res.data : u)));
        showToast(`Đã thay đổi quyền của "${roleModalUser.fullName}" thành ${targetRole === 'ROLE_ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}!`, 'success');
        setRoleModalUser(null);
      } else {
        showToast(res.message || 'Lỗi khi cập nhật quyền người dùng', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật quyền';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusModalUser) return;
    if (statusModalUser.email === user?.email) {
      showToast('Bạn không thể tự khóa tài khoản của chính mình!', 'error');
      setStatusModalUser(null);
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminApi.toggleUserStatus(statusModalUser.id);
      if (res.success && res.data) {
        setUsersList(usersList.map((u) => (u.id === statusModalUser.id ? res.data : u)));
        showToast(res.message || (res.data.isActive ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!'), 'success');
        setStatusModalUser(null);
      } else {
        showToast(res.message || 'Lỗi khi thay đổi trạng thái tài khoản', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi thay đổi trạng thái';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
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
      const finalImages = newProductImages.length > 0
        ? (newProductImages.includes(newProductThumbnail) ? newProductImages : [newProductThumbnail, ...newProductImages])
        : (newProductThumbnail ? [newProductThumbnail] : []);

      const payload: Partial<Product> = {
        name: newProductName,
        brand: newProductBrand,
        originalPrice: Number(newProductPrice) * 1.15,
        salePrice: Number(newProductPrice),
        thumbnail: newProductThumbnail,
        images: finalImages,
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
        setNewProductImages(['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80']);
        setNewProductThumbnail('https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80');
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


  const filteredUsers = usersList.filter((u) => {
    if (!userSearchKeyword.trim()) return true;
    const kw = userSearchKeyword.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
      (u.email && u.email.toLowerCase().includes(kw)) ||
      (u.phone && u.phone.includes(kw))
    );
  });

  const filteredVouchers = vouchersList.filter((v) => {
    if (!voucherSearchKeyword.trim()) return true;
    const kw = voucherSearchKeyword.toLowerCase();
    return (
      v.code.toLowerCase().includes(kw) ||
      (v.description && v.description.toLowerCase().includes(kw))
    );
  });

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
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 gap-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
              activeTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Đơn Hàng ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
              activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Sản Phẩm ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
              activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Danh Mục ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Người Dùng ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'vouchers' ? 'bg-white text-red-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Khuyến Mãi ({vouchersList.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STATS & OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Khối 1: 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-semibold">Doanh Thu Đã Thu</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +18.5%
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 mt-1 truncate">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-semibold">Tổng Đơn Hàng</p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {stats?.totalOrders || 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-semibold">Đơn Chờ Xử Lý</p>
                <p className="text-xl font-black text-amber-600 mt-1">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-semibold">Tổng Khách Hàng</p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Grid Khối 2: Monthly Revenue Chart + Khối 3: Order Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Khối 2: Biểu Đồ Doanh Thu 6 Tháng Gần Nhất (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                    <span>Doanh Thu 6 Tháng Gần Nhất</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Xu hướng tăng trưởng doanh thu FPT TechStore</p>
                </div>
                {stats?.monthlyRevenues && stats.monthlyRevenues.length > 0 && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-semibold">Tổng 6 tháng: </span>
                    <span className="text-xs font-black text-red-600">
                      {formatCurrency(
                        stats.monthlyRevenues.reduce((acc, m) => acc + (m.revenue || 0), 0)
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Pure CSS Column Bar Chart */}
              {(() => {
                const months = stats?.monthlyRevenues || [];
                const maxRev = Math.max(...months.map((m) => m.revenue || 0), 1);

                return (
                  <div className="pt-6">
                    <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 border-b border-slate-200 pb-2">
                      {months.map((item, idx) => {
                        const heightPct = Math.max(14, Math.round(((item.revenue || 0) / maxRev) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            {/* Hover Tooltip Popup */}
                            <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl text-center whitespace-nowrap -translate-y-1">
                              <p className="font-bold text-amber-300">{formatCurrency(item.revenue || 0)}</p>
                              <p className="text-[10px] text-slate-300">{item.orderCount || 0} đơn thành công</p>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mb-1 mt-0.5" />
                            </div>

                            {/* Column Bar */}
                            <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end">
                              <div
                                className="w-full bg-gradient-to-t from-red-600 to-rose-500 rounded-t-xl group-hover:from-red-500 group-hover:to-rose-400 transition-all duration-500 shadow-sm"
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>

                            {/* Month Label */}
                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-red-600 mt-2 transition-colors">
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Khối 3: Phân Bố Trạng Thái Đơn Hàng (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    <span>Phân Bố Trạng Thái Đơn Hàng</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">{orders.length} đơn</span>
                </div>

                {/* Status Breakdown Logic */}
                {(() => {
                  const statusMap: Record<string, number> = stats?.ordersByStatus || {};
                  const total = Math.max(
                    1,
                    Object.values(statusMap).reduce((a, b) => a + b, 0)
                  );

                  const statusConfig = [
                    { key: 'PENDING', label: 'Chờ xác nhận', barColor: 'bg-amber-400', textColor: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-200' },
                    { key: 'CONFIRMED', label: 'Đã xác nhận', barColor: 'bg-blue-500', textColor: 'text-blue-700', badgeBg: 'bg-blue-50 border-blue-200' },
                    { key: 'SHIPPING', label: 'Đang giao hàng', barColor: 'bg-purple-500', textColor: 'text-purple-700', badgeBg: 'bg-purple-50 border-purple-200' },
                    { key: 'COMPLETED', label: 'Đã hoàn thành', barColor: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' },
                    { key: 'CANCELLED', label: 'Đã hủy đơn', barColor: 'bg-rose-500', textColor: 'text-rose-700', badgeBg: 'bg-rose-50 border-rose-200' },
                  ];

                  return (
                    <div className="space-y-5 pt-3">
                      {/* Multi-segment Progress Bar */}
                      <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        {statusConfig.map((item) => {
                          const count = statusMap[item.key] || 0;
                          const pct = Math.round((count / total) * 100);
                          if (pct === 0) return null;
                          return (
                            <div
                              key={item.key}
                              className={`${item.barColor} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                              title={`${item.label}: ${count} đơn (${pct}%)`}
                            />
                          );
                        })}
                      </div>

                      {/* Status Badges List */}
                      <div className="space-y-2 text-xs">
                        {statusConfig.map((item) => {
                          const count = statusMap[item.key] || 0;
                          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                          return (
                            <div
                              key={item.key}
                              className={`flex items-center justify-between p-2.5 rounded-xl border ${item.badgeBg}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.barColor}`} />
                                <span className={`font-bold ${item.textColor}`}>{item.label}</span>
                              </div>
                              <div className="flex items-center space-x-2 font-semibold">
                                <span className="text-slate-800 font-extrabold">{count} đơn</span>
                                <span className="text-slate-400 text-[11px]">({pct}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Khối 4: Bảng Top 5 Sản Phẩm Bán Chạy Nhất */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Top 5 Sản Phẩm Bán Chạy Nhất</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Xếp hạng dựa trên doanh số và sản lượng tiêu thụ thực tế</p>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center space-x-1"
              >
                <span>Xem kho sản phẩm</span>
                <span>→</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-center w-14">#</th>
                    <th className="py-3 px-4">Sản Phẩm</th>
                    <th className="py-3 px-4">Ngành Hàng</th>
                    <th className="py-3 px-4 text-center">Số Lượng Bán</th>
                    <th className="py-3 px-4 text-right">Tổng Doanh Thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                    stats.topSellingProducts.map((p, idx) => {
                      const medalBg =
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : idx === 1
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-[11px] border ${medalBg}`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'}
                                alt={p.name}
                                className="w-11 h-11 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0"
                              />
                              <span className="font-bold text-slate-900 max-w-xs truncate">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                              {p.categoryName || 'Thiết bị'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 font-extrabold px-3 py-1 rounded-full text-xs">
                              {p.soldQuantity} cái
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-red-600 text-sm">
                            {formatCurrency(p.totalRevenue)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Chưa có dữ liệu sản phẩm bán chạy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Khối 5: Đơn Hàng Gần Đây */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Đơn Hàng Gần Đây</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-red-600 hover:text-red-700 font-bold"
              >
                Xem tất cả ({orders.length}) →
              </button>
            </div>
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
                      <td className="py-3 px-4 font-semibold text-slate-600">{o.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.orderStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.orderStatus === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
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
                        onClick={() =>
                          setEditingProduct({
                            ...p,
                            images: p.images && p.images.length > 0 ? p.images : (p.thumbnail ? [p.thumbnail] : []),
                          })
                        }
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

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Quản Lý Người Dùng & Phân Quyền</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem danh sách tài khoản, phân quyền quản trị viên và khóa/mở khóa truy cập
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchKeyword}
                onChange={(e) => setUserSearchKeyword(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Người Dùng</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Địa Chỉ</th>
                  <th className="py-3 px-4 text-center">Vai Trò</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Tạo</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Không tìm thấy người dùng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.email === user?.email;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{u.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center shrink-0">
                              {u.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.2 rounded">
                                    Bạn
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{u.phone || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{u.address || '—'}</td>
                        <td className="py-3.5 px-4 text-center">
                          {u.role === 'ROLE_ADMIN' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              CUSTOMER
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {u.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 mr-1" /> Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Button đổi vai trò */}
                          <button
                            onClick={() => setRoleModalUser(u)}
                            className="p-1.5 rounded-lg border text-slate-600 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                            title={u.role === 'ROLE_ADMIN' ? 'Hạ quyền xuống CUSTOMER' : 'Nâng quyền lên ADMIN'}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>

                          {/* Button Khóa / Mở khóa */}
                          <button
                            onClick={() => setStatusModalUser(u)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                                : u.isActive
                                ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                            title={
                              isSelf
                                ? 'Không thể tự khóa tài khoản của bạn'
                                : u.isActive
                                ? 'Khóa tài khoản này'
                                : 'Mở khóa tài khoản này'
                            }
                          >
                            {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: VOUCHERS MANAGEMENT */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-base text-slate-900">Quản Lý Mã Giảm Giá & Vouchers</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tạo mã khuyến mãi chiến dịch, giới hạn lượt dùng, chiết khấu theo % hoặc số tiền cố định
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={voucherSearchKeyword}
                  onChange={(e) => setVoucherSearchKeyword(e.target.value)}
                  placeholder="Tìm theo mã hoặc mô tả..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
              <button
                onClick={handleOpenAddVoucher}
                className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Voucher</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã Voucher</th>
                  <th className="py-3 px-4">Mô Tả Khuyến Mãi</th>
                  <th className="py-3 px-4">Mức Giảm</th>
                  <th className="py-3 px-4">Điều Kiện Áp Dụng</th>
                  <th className="py-3 px-4 text-center">Lượt Dùng</th>
                  <th className="py-3 px-4">Thời Hạn Hiệu Lực</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy mã giảm giá nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => {
                    const now = new Date();
                    const startDate = new Date(v.startDate);
                    const endDate = new Date(v.endDate);
                    const isExpired = endDate < now;
                    const isUpcoming = startDate > now;
                    const isExhausted = v.usageLimit > 0 && v.usedCount >= v.usageLimit;

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg tracking-wider">
                              {v.code}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs">
                          {v.description || <span className="text-slate-400 italic">Không có mô tả</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          {v.discountType === 'PERCENTAGE' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Percent className="w-3 h-3 mr-1" />
                              Giảm {v.discountValue}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Giảm {formatCurrency(v.discountValue)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 space-y-0.5 text-[11px]">
                          <div>
                            Đơn tối thiểu:{' '}
                            <strong className="text-slate-800">
                              {v.minOrderValue ? formatCurrency(v.minOrderValue) : '0đ (Tùy ý)'}
                            </strong>
                          </div>
                          {v.discountType === 'PERCENTAGE' && v.maxDiscountAmount && (
                            <div>
                              Giảm tối đa:{' '}
                              <strong className="text-slate-800">{formatCurrency(v.maxDiscountAmount)}</strong>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-block text-center">
                            <span
                              className={`font-mono font-bold ${
                                isExhausted ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {v.usedCount} / {v.usageLimit > 0 ? v.usageLimit : '∞'}
                            </span>
                            {v.usageLimit > 0 && (
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isExhausted ? 'bg-rose-500' : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, (v.usedCount / v.usageLimit) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          <div>Từ: {new Date(v.startDate).toLocaleDateString('vi-VN')}</div>
                          <div>Đến: {new Date(v.endDate).toLocaleDateString('vi-VN')}</div>
                          {isExpired ? (
                            <span className="text-[10px] font-bold text-rose-500">Đã hết hạn</span>
                          ) : isUpcoming ? (
                            <span className="text-[10px] font-bold text-amber-500">Sắp diễn ra</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">Đang hiệu lực</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {v.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> Kích hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <XCircle className="w-3 h-3 mr-1" /> Tạm dừng
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditVoucher(v)}
                            className="p-1.5 rounded-lg border text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title="Chỉnh sửa voucher"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingVoucher(v)}
                            className="p-1.5 rounded-lg border text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            title="Xóa voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Thêm Thiết Bị Mới Vào Kho
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ví dụ: Laptop ASUS TUF Gaming F15..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-medium"
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

              {/* Thumbnail Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Ảnh Thumbnail Đại Diện *</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                    {newProductThumbnail ? (
                      <img src={newProductThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={newProductThumbnail}
                      onChange={(e) => setNewProductThumbnail(e.target.value)}
                      placeholder="Dán link ảnh https://..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 text-xs bg-white"
                    />
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 transition-colors text-[11px] shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>{uploadingImage ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadFile(e.target.files[0], 'new_thumb');
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Album Images Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Album Ảnh Sản Phẩm (Nhiều góc máy)</label>
                  <span className="text-[11px] text-slate-500">({newProductImages.length} ảnh)</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={albumInputUrl}
                    onChange={(e) => setAlbumInputUrl(e.target.value)}
                    placeholder="Nhập URL ảnh phụ..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 text-xs bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewAlbumUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewAlbumUrl}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
                  >
                    Thêm URL
                  </button>
                  <label className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-lg cursor-pointer transition-colors text-xs shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadFile(e.target.files[0], 'new_album');
                      }}
                    />
                  </label>
                </div>

                {newProductImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                    {newProductImages.map((imgUrl, idx) => {
                      const isMain = imgUrl === newProductThumbnail;
                      return (
                        <div
                          key={idx}
                          className={`relative group rounded-lg overflow-hidden border-2 bg-white aspect-square shadow-sm ${
                            isMain ? 'border-red-600' : 'border-slate-200'
                          }`}
                        >
                          <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                          {isMain && (
                            <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              Chính
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetNewProductMainImage(imgUrl)}
                                title="Đặt làm ảnh chính"
                                className="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded shadow"
                              >
                                <StarIcon className="w-3 h-3 fill-white" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveNewAlbumImage(imgUrl)}
                              title="Xóa ảnh"
                              className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

              {/* Thumbnail Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Ảnh Thumbnail Đại Diện *</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                    {editingProduct.thumbnail ? (
                      <img src={editingProduct.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={editingProduct.thumbnail}
                      onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                      placeholder="Dán link ảnh https://..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 text-xs bg-white"
                    />
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 transition-colors text-[11px] shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>{uploadingImage ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadFile(e.target.files[0], 'edit_thumb');
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Album Images Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Album Ảnh Sản Phẩm (Nhiều góc máy)</label>
                  <span className="text-[11px] text-slate-500">
                    ({(editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : [])).length} ảnh)
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editAlbumInputUrl}
                    onChange={(e) => setEditAlbumInputUrl(e.target.value)}
                    placeholder="Nhập URL ảnh phụ..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 text-xs bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditAlbumUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddEditAlbumUrl}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
                  >
                    Thêm URL
                  </button>
                  <label className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-lg cursor-pointer transition-colors text-xs shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadFile(e.target.files[0], 'edit_album');
                      }}
                    />
                  </label>
                </div>

                {((editingProduct.images && editingProduct.images.length > 0) || editingProduct.thumbnail) && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                    {(editingProduct.images || (editingProduct.thumbnail ? [editingProduct.thumbnail] : [])).map((imgUrl, idx) => {
                      const isMain = imgUrl === editingProduct.thumbnail;
                      return (
                        <div
                          key={idx}
                          className={`relative group rounded-lg overflow-hidden border-2 bg-white aspect-square shadow-sm ${
                            isMain ? 'border-red-600' : 'border-slate-200'
                          }`}
                        >
                          <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                          {isMain && (
                            <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              Chính
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetEditProductMainImage(imgUrl)}
                                title="Đặt làm ảnh chính"
                                className="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded shadow"
                              >
                                <StarIcon className="w-3 h-3 fill-white" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveEditAlbumImage(imgUrl)}
                              title="Xóa ảnh"
                              className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

      {/* Change User Role Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-purple-600 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900">Thay Đổi Vai Trò Người Dùng</h3>
            </div>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn chuyển vai trò của tài khoản{' '}
              <strong className="text-slate-900">{roleModalUser.fullName}</strong> ({roleModalUser.email}) từ{' '}
              <strong className="text-purple-700">{roleModalUser.role}</strong> sang{' '}
              <strong className="text-red-600">
                {roleModalUser.role === 'ROLE_ADMIN' ? 'ROLE_CUSTOMER' : 'ROLE_ADMIN'}
              </strong>{' '}
              không?
            </p>
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmChangeRole}
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <span>Xác nhận đổi quyền</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle User Status Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-600 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900">
                {statusModalUser.isActive ? 'Xác Nhận Khóa Tài Khoản' : 'Xác Nhận Mở Khóa Tài Khoản'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {statusModalUser.isActive ? (
                <>
                  Bạn có chắc chắn muốn <strong className="text-rose-600">khóa tài khoản</strong> của{' '}
                  <strong className="text-slate-900">{statusModalUser.fullName}</strong> ({statusModalUser.email})? Sau khi khóa, người dùng này sẽ không thể đăng nhập hoặc thực hiện bất kỳ giao dịch nào trên hệ thống.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn <strong className="text-emerald-600">mở khóa tài khoản</strong> của{' '}
                  <strong className="text-slate-900">{statusModalUser.fullName}</strong> ({statusModalUser.email})? Người dùng sẽ có thể đăng nhập bình thường.
                </>
              )}
            </p>
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmToggleStatus}
                className={`inline-flex items-center space-x-2 text-white font-bold px-4 py-2 rounded-lg text-xs shadow disabled:opacity-60 ${
                  statusModalUser.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>{statusModalUser.isActive ? 'Khóa tài khoản' : 'Mở khóa'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Voucher Modal */}
      {showAddVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-red-600" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {editingVoucher ? 'Cập nhật khuyến mãi' : 'Tạo mã khuyến mãi mới'}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingVoucher ? `Chỉnh Sửa Voucher "${editingVoucher.code}"` : 'Tạo Mã Giảm Giá (Voucher)'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddVoucherModal(false);
                  setEditingVoucher(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    required
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value.toUpperCase())}
                    placeholder="VD: FPTSHOP20, GIAM50K..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-mono font-bold tracking-wider uppercase text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại giảm giá *</label>
                  <select
                    value={vDiscountType}
                    onChange={(e) => setVDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-white font-medium"
                  >
                    <option value="PERCENTAGE">Theo Phần Trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số Tiền Cố Định (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả hiển thị cho khách hàng</label>
                <input
                  type="text"
                  value={vDescription}
                  onChange={(e) => setVDescription(e.target.value)}
                  placeholder="VD: Giảm ngay 10% tối đa 500k cho đơn từ 2 triệu..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {vDiscountType === 'PERCENTAGE' ? 'Mức giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={vDiscountType === 'PERCENTAGE' ? 100 : undefined}
                    value={vDiscountValue}
                    onChange={(e) => setVDiscountValue(e.target.value)}
                    placeholder={vDiscountType === 'PERCENTAGE' ? '10' : '100000'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={vMinOrderValue}
                    onChange={(e) => setVMinOrderValue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    disabled={vDiscountType !== 'PERCENTAGE'}
                    value={vMaxDiscountAmount}
                    onChange={(e) => setVMaxDiscountAmount(e.target.value)}
                    placeholder={vDiscountType === 'PERCENTAGE' ? 'Không giới hạn' : 'Không áp dụng'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    min={1}
                    value={vUsageLimit}
                    onChange={(e) => setVUsageLimit(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời điểm bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={vStartDate}
                    onChange={(e) => setVStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời điểm kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={vEndDate}
                    onChange={(e) => setVEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="voucherIsActive"
                  checked={vIsActive}
                  onChange={(e) => setVIsActive(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="voucherIsActive" className="font-bold text-slate-800 cursor-pointer">
                  Kích hoạt mã voucher ngay lập tức (cho phép khách hàng sử dụng khi thanh toán)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setShowAddVoucherModal(false);
                    setEditingVoucher(null);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg shadow disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingVoucher ? 'Cập Nhật Voucher' : 'Tạo Mã Giảm Giá'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Voucher Modal */}
      {deletingVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-600 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900">Xác Nhận Xóa Voucher</h3>
            </div>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa mã voucher <strong className="text-red-600 font-mono font-black">{deletingVoucher.code}</strong>? Khách hàng sẽ không thể áp dụng mã này cho các đơn hàng tiếp theo.
            </p>
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeletingVoucher(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDeleteVoucher}
                className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xác nhận xóa</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

