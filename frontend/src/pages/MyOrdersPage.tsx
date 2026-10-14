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
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { orderApi } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { Order } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
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
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã duyệt đơn
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
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Hoàn thành
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
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

      {/* Orders List Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
          <Package className="w-5 h-5 text-red-600" />
          <span>Lịch Sử Đơn Hàng Của Bạn ({orders.length})</span>
        </h2>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Đang tải lịch sử đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm">Bạn chưa có đơn đặt hàng nào.</p>
            <Link
              to="/shop"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
            >
              Khám Phá Cửa Hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-red-600 font-mono">
                      {order.orderCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
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

                {/* Order Bottom Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs bg-slate-50/50 -mx-6 -mb-6 p-4 px-6">
                  <div className="text-slate-600">
                    <span>Giao đến: <strong>{order.shippingAddress}</strong></span>
                    <span className="ml-3 text-slate-400">({order.paymentMethod})</span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-slate-500">Tổng thanh toán:</span>
                    <span className="text-base font-black text-red-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
