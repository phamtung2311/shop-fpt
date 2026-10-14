import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  User,
  ShoppingBag,
  AlertCircle,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { orderApi } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Order, OrderStatus } from '../types';
import { formatCurrency } from '../components/ProductCard';

type FilterTab = 'ALL' | OrderStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đang xử lý' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Đã giao' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const CANCEL_REASONS = [
  'Đổi ý không mua nữa',
  'Muốn đổi sản phẩm hoặc số lượng',
  'Muốn thay đổi địa chỉ hoặc số điện thoại nhận hàng',
  'Tìm thấy giá hoặc khuyến mãi tốt hơn ở nơi khác',
  'Thời gian giao hàng dự kiến không phù hợp',
  'Lý do khác...',
];

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // Cancel order modal state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (order: Order) => {
    setOrderToCancel(order);
    setSelectedReason(CANCEL_REASONS[0]);
    setCustomReason('');
  };

  const handleCloseCancelModal = () => {
    if (cancelling) return;
    setOrderToCancel(null);
    setCustomReason('');
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác...') {
      if (!customReason.trim()) {
        showToast('Vui lòng nhập lý do hủy đơn hàng', 'error');
        return;
      }
      finalReason = customReason.trim();
    } else if (customReason.trim()) {
      finalReason = `${selectedReason} - ${customReason.trim()}`;
    }

    try {
      setCancelling(true);
      const res = await orderApi.cancelOrder(orderToCancel.id, finalReason);
      if (res.success) {
        showToast('Hủy đơn hàng thành công!', 'success');
        handleCloseCancelModal();
        await loadOrders();
      } else {
        showToast(res.message || 'Không thể hủy đơn hàng', 'error');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi hủy đơn hàng';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Vui lòng đăng nhập</h2>
        <p className="text-xs text-slate-500">
          Đăng nhập tài khoản để theo dõi tiến trình đơn hàng và lịch sử mua sắm tại FPT TechStore.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> Chờ xác nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đang xử lý
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5 mr-1" /> Đang giao hàng
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã giao hàng
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter((order) => order.orderStatus === activeTab);

  const getTabCount = (tabKey: FilterTab) => {
    if (tabKey === 'ALL') return orders.length;
    return orders.filter((o) => o.orderStatus === tabKey).length;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* User Header Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{user?.fullName}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 rounded">
              Thành viên VIP FPT
            </span>
          </div>
        </div>

        <Link
          to="/shop"
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tiếp tục mua hàng</span>
        </Link>
      </div>

      {/* Orders Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {TABS.map((tab) => {
            const count = getTabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-red-600" />
            <span>
              {activeTab === 'ALL' ? 'Tất Cả Đơn Hàng' : TABS.find((t) => t.key === activeTab)?.label}
              {' '}({filteredOrders.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            <span>Đang tải lịch sử đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm">
              {activeTab === 'ALL'
                ? 'Bạn chưa có đơn đặt hàng nào.'
                : `Không có đơn hàng nào ở trạng thái "${TABS.find((t) => t.key === activeTab)?.label}".`}
            </p>
            {activeTab === 'ALL' && (
              <Link
                to="/shop"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Khám Phá Cửa Hàng
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-red-600 font-mono">
                      {order.orderCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        {item.productThumbnail ? (
                          <img
                            src={item.productThumbnail}
                            alt={item.productName}
                            className="w-12 h-12 object-contain rounded bg-slate-50 border border-slate-100 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
                            FPT
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-slate-400">Số lượng: x{item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cancel Reason Alert Box (If order is cancelled) */}
                {order.orderStatus === 'CANCELLED' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start space-x-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Lý do hủy đơn: </span>
                      <span>{order.cancelReason || 'Không có lý do chi tiết'}</span>
                    </div>
                  </div>
                )}

                {/* Order Bottom Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs bg-slate-50/70 -mx-6 -mb-6 p-4 px-6">
                  <div className="text-slate-600 space-y-1 sm:space-y-0">
                    <div>
                      <span>Giao đến: <strong>{order.shippingAddress}</strong></span>
                      <span className="ml-3 text-slate-400">({order.paymentMethod})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-slate-500">Tổng thanh toán:</span>
                      <span className="text-base font-black text-red-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    {order.orderStatus === 'PENDING' && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Hủy đơn hàng</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">
                  Xác nhận hủy đơn hàng
                </h3>
              </div>
              <button
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800">
                <p>
                  Bạn đang yêu cầu hủy đơn hàng <strong className="font-mono text-slate-900">{orderToCancel.orderCode}</strong>.
                  Sau khi hủy, số lượng sản phẩm sẽ được tự động hoàn lại vào kho. Thao tác này không thể hoàn tác!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Vui lòng chọn lý do hủy đơn:
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedReason === reason
                          ? 'border-red-500 bg-red-50/40 text-slate-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ghi chú thêm {selectedReason === 'Lý do khác...' ? '(bắt buộc)' : '(tùy chọn)'}:
                </label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập chi tiết lý do bạn muốn hủy đơn..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Xác nhận hủy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
