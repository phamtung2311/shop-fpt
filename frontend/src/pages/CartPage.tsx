import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../components/ProductCard';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Hãy khám phá hàng ngàn thiết bị công nghệ chính hãng hoặc tự build cấu hình PC ưng ý!
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <Link
            to="/shop"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
          >
            Mua sắm ngay
          </Link>
          <Link
            to="/pc-builder"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
          >
            Xây dựng PC
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900">Giỏ Hàng ({items.length} món)</h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline font-semibold"
        >
          Xóa toàn bộ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const unitPrice = item.product.salePrice + (item.warrantyOption?.price || 0);
            const itemKey = `${item.product.id}-${item.warrantyOption?.id || 'std'}-${item.installmentNote || ''}`;

            return (
              <div
                key={itemKey}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center space-x-4 min-w-0 w-full sm:w-auto">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain rounded bg-slate-50 shrink-0 p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {item.product.brand}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="block font-bold text-sm text-slate-900 hover:text-red-600 truncate"
                    >
                      {item.product.name}
                    </Link>

                    {/* Warranty option badge */}
                    {item.warrantyOption && (
                      <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-semibold">{item.warrantyOption.name}</span>
                        {item.warrantyOption.price > 0 && (
                          <span className="text-red-600 font-bold">
                            (+{formatCurrency(item.warrantyOption.price)})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Installment note */}
                    {item.installmentNote && (
                      <p className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {item.installmentNote}
                      </p>
                    )}

                    <p className="text-xs font-bold text-red-600 mt-0.5">
                      Đơn giá: {formatCurrency(unitPrice)}
                    </p>
                  </div>
                </div>

                {/* Quantity & Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.warrantyOption?.id)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.warrantyOption?.id)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-black text-slate-900 min-w-[100px] text-right">
                    {formatCurrency(unitPrice * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.warrantyOption?.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Xóa món"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Summary Box */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá voucher:</span>
                <span className="font-bold text-slate-900">0₫</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-2xl font-black text-red-600">{formatCurrency(totalPrice)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <p className="flex items-center"><Truck className="w-3.5 h-3.5 text-red-500 mr-1.5" /> Giao hàng toàn quốc từ 1 - 3 ngày</p>
              <p className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 text-red-500 mr-1.5" /> Kiểm tra hàng trước khi thanh toán</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
