import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  Smartphone,
  Ticket,
  Tag,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { orderApi, voucherApi } from '../api/services';
import { Order, PaymentMethod, Voucher, ApplyVoucherResponse } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [note, setNote] = useState((location.state as any)?.installmentNote || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Voucher states
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<ApplyVoucherResponse | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Online Payment modal state
  const [onlineOrder, setOnlineOrder] = useState<Order | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      if (!customerName && user.fullName) setCustomerName(user.fullName);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!shippingAddress && user.address) setShippingAddress(user.address);
    }
  }, [user]);

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 2000000 ? 0 : 30000;
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  if (items.length === 0 && !onlineOrder) {
    navigate('/cart');
    return null;
  }

  const handleOpenVoucherModal = async () => {
    setShowVoucherModal(true);
    setLoadingVouchers(true);
    try {
      const res = await voucherApi.getActiveVouchers();
      if (res.success && res.data) {
        setAvailableVouchers(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách mã giảm giá', 'error');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = (codeToApply || voucherCodeInput).trim();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá', 'error');
      return;
    }

    setApplyingVoucher(true);
    try {
      const res = await voucherApi.applyVoucher(code, subtotal);
      if (res.success && res.data) {
        setAppliedVoucher(res.data);
        setVoucherCodeInput(res.data.code);
        setShowVoucherModal(false);
        showToast(`Áp dụng mã ${res.data.code} thành công! Tiết kiệm ${formatCurrency(res.data.discountAmount)}`, 'success');
      } else {
        showToast(res.message || 'Mã giảm giá không hợp lệ', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã giảm giá không hợp lệ';
      showToast(msg, 'error');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    showToast('Đã hủy áp dụng mã giảm giá', 'info');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const warrantyNotes = items
        .filter((i) => i.warrantyOption && i.warrantyOption.id !== 'standard')
        .map((i) => `${i.product.name} [${i.warrantyOption?.name}]`)
        .join('; ');

      const combinedNote = [
        note.trim(),
        warrantyNotes ? `[Gói bảo hành]: ${warrantyNotes}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        note: combinedNote,
        paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res.success && res.data) {
        if (paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') {
          setOnlineOrder(res.data);
        } else {
          clearCart();
          showToast('Đặt hàng thành công! Cảm ơn quý khách.', 'success');
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

  const handleConfirmOnlinePayment = async () => {
    if (!onlineOrder) return;

    setConfirmingPayment(true);
    try {
      const res = await orderApi.confirmPayment(onlineOrder.id);
      if (res.success) {
        showToast('Xác nhận thanh toán trực tuyến thành công!', 'success');
        clearCart();
        navigate(`/order-success/${onlineOrder.orderCode}`);
      } else {
        showToast(res.message || 'Xác nhận thanh toán không thành công', 'error');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback: still navigate if error
      clearCart();
      navigate(`/order-success/${onlineOrder.orderCode}`);
    } finally {
      setConfirmingPayment(false);
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
            <div className="bg-red-50 text-red-600 border border-red-200 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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
              {/* COD */}
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

              {/* VNPAY */}
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
                      <p className="font-bold text-sm text-slate-900">Cổng Thanh Toán VNPAY (Quét mã QR)</p>
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        VNPAY-QR
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Hỗ trợ quét mã qua 40+ ứng dụng ngân hàng di động</p>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-blue-600" />
              </label>

              {/* MOMO */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'MOMO'
                    ? 'border-red-600 bg-red-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    checked={paymentMethod === 'MOMO'}
                    onChange={() => setPaymentMethod('MOMO')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-sm text-slate-900">Ví Điện Tử MoMo</p>
                      <span className="bg-pink-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        MOMO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Quét mã QR thanh toán nhanh chóng qua ứng dụng Ví MoMo</p>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-pink-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Voucher */}
        <div className="lg:col-span-5 sticky top-24 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Đơn Hàng Của Bạn ({items.length} món)
            </h3>

            {/* Items List */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => {
                const unitPrice = item.product.salePrice + (item.warrantyOption?.price || 0);
                const itemKey = `${item.product.id}-${item.warrantyOption?.id || 'std'}-${item.installmentNote || ''}`;

                return (
                  <div key={itemKey} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-10 h-10 object-contain rounded bg-slate-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-slate-400">SL: {item.quantity}</p>
                        {item.warrantyOption && (
                          <p className="text-[10px] text-slate-500 truncate">
                            Bảo hành: <strong>{item.warrantyOption.name}</strong>
                          </p>
                        )}
                        {item.installmentNote && (
                          <p className="text-[10px] font-semibold text-blue-600 truncate">
                            {item.installmentNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">
                      {formatCurrency(unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Voucher Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-red-600" />
                  <span>Mã Giảm Giá (Voucher)</span>
                </span>
                <button
                  type="button"
                  onClick={handleOpenVoucherModal}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  Chọn voucher có sẵn
                </button>
              </div>

              {appliedVoucher ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-black text-red-600 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedVoucher.code}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">{appliedVoucher.description}</p>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      Giảm: -{formatCurrency(appliedVoucher.discountAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-100/60 transition-colors shrink-0"
                    title="Hủy áp dụng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã voucher (VD: FPTSHOP10)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-mono uppercase"
                  />
                  <button
                    type="button"
                    disabled={applyingVoucher}
                    onClick={() => handleApplyVoucher()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 disabled:opacity-60 flex items-center space-x-1"
                  >
                    {applyingVoucher ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Áp Dụng</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <span>Phí vận chuyển:</span>
                  <p className="text-[10px] text-slate-400">Miễn phí cho đơn từ 2.000.000đ</p>
                </div>
                <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'font-bold text-slate-900'}>
                  {shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(shippingFee)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Giảm giá Voucher:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-slate-100 items-baseline">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-red-600">{formatCurrency(finalTotal)}</span>
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
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang Xử Lý Đơn Hàng...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Xác Nhận Đặt Hàng ({formatCurrency(finalTotal)})</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cam kết bảo mật thông tin & hàng chính hãng 100%</span>
            </div>
          </div>
        </div>
      </form>

      {/* Available Vouchers Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-red-600">
                <Ticket className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900">Mã Giảm Giá FPT Dành Cho Bạn</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-3">
              {loadingVouchers ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  <span>Đang tải danh sách voucher...</span>
                </div>
              ) : availableVouchers.length === 0 ? (
                <p className="py-8 text-center text-slate-400 text-xs">Hiện chưa có mã giảm giá nào đang áp dụng.</p>
              ) : (
                availableVouchers.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl border border-dashed border-red-200 bg-red-50/30 hover:bg-red-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-mono font-black text-red-600 tracking-wider bg-white px-2 py-0.5 rounded border border-red-200">
                        {v.code}
                      </span>
                      <p className="font-bold text-slate-900 text-xs mt-1">{v.description}</p>
                      {v.minOrderValue && v.minOrderValue > 0 && (
                        <p className="text-[11px] text-slate-500">
                          Đơn tối thiểu: {formatCurrency(v.minOrderValue)}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyVoucher(v.code)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 shadow-sm transition-colors"
                    >
                      Dùng Ngay
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Online Payment (VNPAY / MOMO) Modal */}
      {onlineOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header VNPay or MoMo */}
            <div
              className={`p-5 text-white flex justify-between items-center ${
                onlineOrder.paymentMethod === 'MOMO'
                  ? 'bg-gradient-to-r from-pink-600 via-pink-700 to-rose-700'
                  : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-white px-2.5 py-0.5 rounded font-black text-sm tracking-wider text-slate-900">
                  {onlineOrder.paymentMethod === 'MOMO' ? (
                    <span className="text-pink-600 font-black">MoMo QR</span>
                  ) : (
                    <>VNPAY<span className="text-red-600 font-bold">QR</span></>
                  )}
                </div>
                <span className="text-xs text-white/90">
                  {onlineOrder.paymentMethod === 'MOMO' ? 'Cổng Ví Điện Tử MoMo' : 'Cổng Thanh Toán Quốc Gia'}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-black/20 px-2.5 py-1 rounded-full text-xs">
                <Clock className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-mono text-yellow-300 font-bold">14:59</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center space-y-4">
              <div>
                <p className="text-xs text-slate-500">Đơn vị thụ hưởng: <strong>FPT TechStore</strong></p>
                <p className="text-xs text-slate-500">
                  Mã đơn hàng: <strong className="text-red-600 font-mono">{onlineOrder.orderCode}</strong>
                </p>
                <p className="text-2xl font-black text-slate-900 mt-2">
                  {formatCurrency(onlineOrder.totalAmount)}
                </p>
              </div>

              {/* QR Code Presentation Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${onlineOrder.paymentMethod}-${onlineOrder.orderCode}-${onlineOrder.totalAmount}`}
                  alt="Payment QR Code"
                  className="w-44 h-44 mx-auto rounded-lg shadow-sm"
                />
                <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 mr-1 text-slate-700" />
                  Mở app {onlineOrder.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'Ngân hàng / VNPay'} để quét mã
                </p>
              </div>

              {/* Supported info */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1">
                <p>• Số tài khoản / Ví: <strong className="font-mono text-slate-900">0988 888 888 (FPT TECHSTORE)</strong></p>
                <p>• Nội dung CK: <strong className="font-mono text-red-600">{onlineOrder.orderCode}</strong></p>
                <p>• Số tiền: <strong className="text-slate-900">{formatCurrency(onlineOrder.totalAmount)}</strong></p>
              </div>

              {/* Simulation Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={confirmingPayment}
                  onClick={handleConfirmOnlinePayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {confirmingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác nhận thanh toán...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>⚡ Tôi Đã Hoàn Tất Thanh Toán</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    navigate(`/order-success/${onlineOrder.orderCode}`);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Xem chi tiết đơn hàng (Thanh toán sau)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
