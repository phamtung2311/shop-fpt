import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag, Truck, Calendar } from 'lucide-react';
import { orderApi } from '../api/services';
import { Order } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderCode) {
      orderApi.getByCode(orderCode).then((res) => {
        if (res.success) setOrder(res.data);
      });
    }
  }, [orderCode]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-slate-500 text-sm">
          Cảm ơn bạn đã tin tưởng mua sắm tại <strong className="text-red-600">FPT TechStore</strong>. Chúng tôi đã nhận được thông tin đơn hàng của bạn.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-left space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Mã đơn hàng</span>
            <p className="text-xl font-black text-red-600">{orderCode}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
            Đang chờ xử lý
          </span>
        </div>

        {order && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400">Người nhận hàng:</p>
                <p className="font-bold text-slate-800 text-sm">{order.customerName}</p>
                <p className="text-slate-600">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-slate-400">Địa chỉ giao hàng:</p>
                <p className="font-bold text-slate-800">{order.shippingAddress}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
              <span>Tổng tiền thanh toán:</span>
              <span className="text-lg font-black text-red-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
          <p className="flex items-center"><Truck className="w-4 h-4 text-red-600 mr-2 shrink-0" /> Thời gian giao hàng dự kiến: <strong>1 - 2 ngày làm việc</strong></p>
          <p className="flex items-center"><PackageCheck className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> Nhân viên sẽ liên hệ để xác nhận đơn hàng trong vòng 15 phút</p>
        </div>
      </div>

      <div className="flex justify-center space-x-4 pt-4">
        <Link
          to="/"
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl text-xs transition-colors"
        >
          Về Trang Chủ
        </Link>
        <Link
          to="/shop"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-colors flex items-center space-x-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tiếp Tục Mua Sắm</span>
        </Link>
      </div>
    </div>
  );
};
