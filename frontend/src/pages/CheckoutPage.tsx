import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, QrCode, ShieldCheck, CheckCircle2, Clock, X, Smartphone, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderApi } from '../api/services';
import { Order, PaymentMethod } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState('0988123456');
  const [shippingAddress, setShippingAddress] = useState('123 Đường Cầu Giấy, Hà Nội');
  const [note, setNote] = useState('Giao vào giờ hành chính giúp tôi');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [vnpayOrder, setVnpayOrder] = useState<Order | null>(null);

  const totalPrice = getTotalPrice();

  if (items.length === 0 && !vnpayOrder) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerName,
        customerPhone,
        shippingAddress,
        note,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res.success && res.data) {
        if (paymentMethod === 'VNPAY') {
          // Open VNPay QR simulation modal
          setVnpayOrder(res.data);
        } else {
          clearCart();
          navigate(`/order-success/${res.data.orderCode}`);
        }
      } else {
        setErrorMsg(res.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishVNPay = () => {
    if (vnpayOrder) {
      clearCart();
      navigate(`/order-success/${vnpayOrder.orderCode}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-black text-slate-900 pb-4 border-b border-slate-200">
        Thanh Toán & Đặt Hàng
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-3.5 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Customer Info Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
              1. Thông Tin Nhận Hàng
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ giao hàng chi tiết *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú đơn hàng (nếu có)</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Gọi trước khi giao, giao giờ hành chính..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-slate-50 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
              2. Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-red-600 bg-red-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-slate-500">Khách hàng kiểm tra hàng và thanh toán tiền mặt cho shipper</p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-slate-400" />
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'VNPAY'
                    ? 'border-red-600 bg-red-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={() => setPaymentMethod('VNPAY')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-sm text-slate-900">Cổng Thanh Toán VNPay Sandbox (Quét mã QR)</p>
                      <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        Đề xuất
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Mô phỏng quét mã VNPAY-QR qua ứng dụng ngân hàng di động</p>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-red-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Đơn Hàng Của Bạn ({items.length} món)
            </h3>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-10 h-10 object-contain rounded bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-slate-400">SL: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">
                    {formatCurrency(item.product.salePrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 items-baseline">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-red-600">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-xl text-sm font-extrabold text-white transition-all shadow-lg flex items-center justify-center space-x-2 ${
                submitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/30 hover:scale-[1.02]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng Ngay'}</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cam kết bảo mật thông tin & hàng chính hãng 100%</span>
            </div>
          </div>
        </div>
      </form>

      {/* VNPay Payment Simulation Modal */}
      {vnpayOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header VNPay */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-white px-2 py-0.5 rounded font-black text-blue-700 text-sm tracking-wider">
                  VNPAY<span className="text-red-600 font-bold">QR</span>
                </div>
                <span className="text-xs text-blue-100">Cổng Thanh Toán Quốc Gia</span>
              </div>
              <div className="flex items-center space-x-1 bg-black/20 px-2.5 py-1 rounded-full text-xs">
                <Clock className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-mono text-yellow-300 font-bold">14:59</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center space-y-5">
              <div>
                <p className="text-xs text-slate-500">Đơn vị thụ hưởng: <strong>FPT TechStore</strong></p>
                <p className="text-xs text-slate-500">Mã đơn hàng: <strong className="text-red-600 font-mono">{vnpayOrder.orderCode}</strong></p>
                <p className="text-2xl font-black text-blue-700 mt-2">
                  {formatCurrency(vnpayOrder.totalAmount)}
                </p>
              </div>

              {/* QR Code Presentation Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-blue-200 inline-block shadow-inner mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=VNPAY-${vnpayOrder.orderCode}-${vnpayOrder.totalAmount}`}
                  alt="VNPay QR Code"
                  className="w-44 h-44 mx-auto rounded-lg shadow-sm"
                />
                <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Mở app Ngân hàng hoặc Ví MoMo để quét
                </p>
              </div>

              {/* Supported Banks Logos */}
              <div className="text-[10px] text-slate-400 space-y-1">
                <p>Hỗ trợ hơn 40+ ứng dụng ngân hàng & ví điện tử:</p>
                <p className="font-bold text-slate-600">Vietcombank • BIDV • Techcombank • MBBank • TPBank • Agribank</p>
              </div>

              {/* Simulation Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleFinishVNPay}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>⚡ Mô Phỏng Quét Mã Thanh Toán Thành Công (Demo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVnpayOrder(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Hủy và quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
