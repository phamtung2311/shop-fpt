import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  Battery,
  Award,
  ShoppingCart,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  Scale,
  CreditCard,
  Calculator,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { productApi, reviewApi } from '../api/services';
import { Product, Review, WarrantyOption } from '../types';
import { useCartStore } from '../store/cartStore';
import { useCompareStore } from '../store/compareStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../components/ProductCard';

export const WARRANTY_OPTIONS: WarrantyOption[] = [
  {
    id: 'standard',
    name: 'Bảo hành tiêu chuẩn FPT Shop 12 tháng',
    price: 0,
    description: 'Bảo hành phần cứng chính hãng theo tiêu chuẩn của nhà sản xuất.',
  },
  {
    id: 'gold',
    name: 'Gói Bảo Hành Vàng (Rơi vỡ / Vào nước 12 tháng)',
    price: 500000,
    description: 'Bảo vệ toàn diện kể cả tai nạn rơi vỡ hoặc vào nước trong 12 tháng.',
  },
  {
    id: 'extended',
    name: 'Gói Bảo Hành Mở Rộng 24 tháng (1 đổi 1)',
    price: 800000,
    description: 'Nhân đôi thời gian bảo hành lên 24 tháng, lỗi phần cứng đổi mới 1-1 ngay.',
  },
];

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const showToast = useToastStore((state) => state.showToast);

  // Compare store
  const { isInCompare, addProduct, removeProduct } = useCompareStore();

  // Warranty selection state
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption>(WARRANTY_OPTIONS[0]);

  // Installment modal states
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [prepaidPercent, setPrepaidPercent] = useState<number>(30);
  const [termMonths, setTermMonths] = useState<number>(6);
  const [installmentChannel, setInstallmentChannel] = useState<'finance' | 'credit_card'>('finance');
  const [selectedProvider, setSelectedProvider] = useState<string>('FE Credit');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState(user?.fullName || '');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Gallery active image
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Check if current logged in user already left a review
  const userExistingReview = user && user.fullName
    ? reviews.find((r) => r.authorName.toLowerCase() === user.fullName.toLowerCase())
    : null;

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [slug]);

  useEffect(() => {
    if (userExistingReview) {
      setNewReviewRating(userExistingReview.rating);
      setNewReviewContent(userExistingReview.content);
    }
  }, [userExistingReview?.id]);

  useEffect(() => {
    if (user?.fullName && !newReviewAuthor) {
      setNewReviewAuthor(user.fullName);
    }
  }, [user]);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      Promise.all([
        productApi.getBySlug(slug),
        reviewApi.getByProductSlug(slug),
      ])
        .then(([prodRes, revRes]) => {
          if (prodRes.success) setProduct(prodRes.data);
          if (revRes.success && revRes.data) setReviews(revRes.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm này</h2>
        <Link to="/shop" className="text-red-600 font-semibold hover:underline">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const discountPercent = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  const inCompare = product ? isInCompare(product.id) : false;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedWarranty);
    showToast(
      `Đã thêm ${quantity} x ${product.name} (${selectedWarranty.name}) vào giỏ hàng!`,
      'success'
    );
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedWarranty);
    navigate('/cart');
  };

  // Tính toán trả góp 0%
  const itemUnitPrice = product.salePrice + (selectedWarranty?.price || 0);
  const totalInstallmentAmount = itemUnitPrice * quantity;
  const prepaymentAmount = Math.round(totalInstallmentAmount * (prepaidPercent / 100));
  const loanAmount = Math.max(0, totalInstallmentAmount - prepaymentAmount);
  const monthlyPayment = termMonths > 0 ? Math.round(loanAmount / termMonths) : 0;

  const handleApplyInstallment = () => {
    const noteText = `[Đăng ký trả góp 0%]: Trả trước ${prepaidPercent}% (${formatCurrency(prepaymentAmount)}), kỳ hạn ${termMonths} tháng qua ${selectedProvider}. Tiền góp dự kiến: ${formatCurrency(monthlyPayment)}/tháng. (${selectedWarranty.name})`;
    addToCart(product, quantity, selectedWarranty, noteText);
    showToast('Đã đăng ký hồ sơ trả góp 0%! Đang chuyển đến trang thanh toán...', 'success');
    setShowInstallmentModal(false);
    navigate('/checkout', { state: { installmentNote: noteText } });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    if (!newReviewAuthor.trim() || !newReviewContent.trim()) {
      showToast('Vui lòng nhập tên và nội dung đánh giá!', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await reviewApi.createReview(slug, {
        authorName: newReviewAuthor.trim(),
        rating: newReviewRating,
        content: newReviewContent.trim(),
      });
      if (res.success && res.data) {
        const savedReview = res.data;
        const exists = reviews.some(
          (r) => r.id === savedReview.id || r.authorName.toLowerCase() === savedReview.authorName.toLowerCase()
        );
        const updatedReviews = exists
          ? reviews.map((r) =>
              r.id === savedReview.id || r.authorName.toLowerCase() === savedReview.authorName.toLowerCase()
                ? savedReview
                : r
            )
          : [savedReview, ...reviews];

        setReviews(updatedReviews);

        // Sync fresh product data (rating & reviewCount)
        productApi.getBySlug(slug).then((pRes) => {
          if (pRes.success && pRes.data) setProduct(pRes.data);
        });

        showToast(
          exists ? 'Cập nhật đánh giá của bạn thành công!' : 'Cảm ơn bạn đã gửi đánh giá cho sản phẩm!',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi gửi đánh giá!', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center space-x-2">
        <Link to="/" className="hover:text-red-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-red-600">Sản phẩm</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Product Image & Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center relative overflow-hidden shadow-sm group min-h-[380px]">
            <img
              src={
                product.images && product.images.length > 0
                  ? product.images[selectedImageIndex] || product.thumbnail
                  : product.thumbnail
              }
              alt={product.name}
              className="max-h-[420px] w-auto object-contain hover:scale-105 transition-transform duration-300 select-none"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                Tiết kiệm {discountPercent}%
              </span>
            )}

            {/* Navigation Arrows for Gallery */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? (product.images!.length - 1) : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  title="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === product.images!.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  title="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 right-4 bg-slate-900/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails Gallery Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {product.images.map((imgUrl, idx) => {
                const isActive = idx === selectedImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 p-1 bg-white transition-all ${
                      isActive
                        ? 'border-red-600 ring-2 ring-red-100 shadow-md scale-102'
                        : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} góc ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Value Props Box */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <ShieldCheck className="w-5 h-5 mx-auto text-red-600 mb-1" />
              <p className="font-bold text-slate-900">Bảo hành {product.warrantyMonths || 12}T</p>
              <p className="text-[10px] text-slate-400">Chính hãng 100%</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <RotateCcw className="w-5 h-5 mx-auto text-red-600 mb-1" />
              <p className="font-bold text-slate-900">Lỗi là đổi</p>
              <p className="text-[10px] text-slate-400">30 ngày đầu tiên</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <Truck className="w-5 h-5 mx-auto text-red-600 mb-1" />
              <p className="font-bold text-slate-900">Giao siêu tốc</p>
              <p className="text-[10px] text-slate-400">Nội thành 2 giờ</p>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{product.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">{reviews.length} đánh giá</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Còn hàng ({product.stockQuantity})
                </span>
              </div>

              {/* Nút So Sánh */}
              <button
                type="button"
                onClick={() => {
                  if (inCompare) {
                    removeProduct(product.id);
                  } else {
                    addProduct(product);
                  }
                }}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  inCompare
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'border-slate-300 text-slate-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title={inCompare ? 'Bỏ khỏi danh sách so sánh' : 'So sánh với sản phẩm khác'}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{inCompare ? '✓ Đang So Sánh' : '+ So Sánh Sản Phẩm'}</span>
              </button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 flex items-baseline space-x-3">
            <span className="text-3xl font-black text-red-600">
              {formatCurrency(product.salePrice)}
            </span>
            {product.originalPrice > product.salePrice && (
              <span className="text-slate-400 text-sm line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Promotions Box (FPT Style) */}
          <div className="border border-red-200 bg-white rounded-xl p-4 space-y-2">
            <p className="font-bold text-xs uppercase text-red-600 flex items-center space-x-1">
              <Award className="w-4 h-4" />
              <span>Khuyến mãi đặc quyền tại FPT TechStore:</span>
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li>Tặng Balo Laptop cao cấp chống sốc trị giá 450.000₫</li>
              <li>Tặng Chuột quang Gaming FPT Tech RGB trị giá 290.000₫</li>
              <li>Giảm thêm <strong>500.000₫</strong> khi thanh toán qua VNPay-QR</li>
              <li>Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng hoặc CCCD</li>
            </ul>
          </div>

          {/* Extended Warranty Options Box */}
          <div className="border border-slate-200 bg-white rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Chọn Gói Bảo Hành Toàn Diện</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Đặc quyền FPT Shop</span>
            </div>

            <div className="space-y-2">
              {WARRANTY_OPTIONS.map((opt) => {
                const isSelected = selectedWarranty.id === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedWarranty(opt)}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="radio"
                        name="warrantyOption"
                        checked={isSelected}
                        onChange={() => setSelectedWarranty(opt)}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-red-700' : 'text-slate-800'}`}>
                          {opt.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-extrabold shrink-0 ml-2 ${opt.price === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {opt.price === 0 ? 'Miễn phí' : `+${formatCurrency(opt.price)}`}
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedWarranty.price > 0 && (
              <p className="text-[11px] text-slate-500 text-right pt-1">
                Tạm tính sản phẩm + gói bảo hành:{' '}
                <strong className="text-red-600 font-bold">
                  {formatCurrency((product.salePrice + selectedWarranty.price) * quantity)}
                </strong>
              </p>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-700">Số lượng:</span>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-slate-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 border border-red-200"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm Vào Giỏ</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm shadow-md shadow-red-600/30 transition-all hover:scale-[1.01] flex items-center justify-center space-x-1.5"
              >
                <span>Mua Ngay (Giao 2h)</span>
              </button>
            </div>

            {/* Installment Button */}
            <button
              type="button"
              onClick={() => setShowInstallmentModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] flex flex-col items-center justify-center leading-tight"
            >
              <span className="flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4" />
                <span>MUA TRẢ GÓP 0% LÃI SUẤT</span>
              </span>
              <span className="text-[10px] font-normal text-blue-100 mt-0.5">
                Duyệt nhanh qua điện thoại / CCCD hoặc thẻ tín dụng
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Description & Technical Specs Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-200">
        {/* Description */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Mô Tả Sản Phẩm</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Technical Specifications Table */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-red-600" />
            <span>Thông Số Kỹ Thuật</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {product.cpu && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium flex items-center">
                  <Cpu className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Vi xử lý (CPU)
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[220px]">{product.cpu}</span>
              </div>
            )}
            {product.ram && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Bộ nhớ RAM</span>
                <span className="font-semibold text-slate-900 text-right">{product.ram}</span>
              </div>
            )}
            {product.storage && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium flex items-center">
                  <HardDrive className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Ổ cứng lưu trữ
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[220px]">{product.storage}</span>
              </div>
            )}
            {product.vga && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Card đồ họa (VGA)
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[220px]">{product.vga}</span>
              </div>
            )}
            {product.screen && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium flex items-center">
                  <Monitor className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Màn hình
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[220px]">{product.screen}</span>
              </div>
            )}
            {product.battery && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium flex items-center">
                  <Battery className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Dung lượng Pin
                </span>
                <span className="font-semibold text-slate-900 text-right">{product.battery}</span>
              </div>
            )}
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Thời gian bảo hành</span>
              <span className="font-semibold text-slate-900 text-right">{product.warrantyMonths || 12} Tháng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <span>Đánh Giá & Nhận Xét Từ Khách Hàng</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Đánh giá thực tế từ người dùng đã mua sản phẩm tại FPT TechStore</p>
          </div>
        </div>

        {/* Rating Overview & Star Breakdown Card */}
        {(() => {
          const totalReviewsCount = reviews.length;
          const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviews.forEach((r) => {
            const s = Math.max(1, Math.min(5, Math.round(r.rating)));
            starCounts[s] = (starCounts[s] || 0) + 1;
          });

          return (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Overall Score */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2 border-b md:border-b-0 md:border-r border-slate-200">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {product.rating ? product.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs font-semibold text-slate-400 mt-0.5">trên 5 sao</span>
                <div className="flex text-amber-500 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.rating || 5)
                          ? 'fill-current text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {totalReviewsCount > 0 ? `${totalReviewsCount} lượt đánh giá thực tế` : 'Chưa có đánh giá'}
                </p>
              </div>

              {/* Right: 5-star Progress Bars */}
              <div className="md:col-span-8 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = starCounts[star] || 0;
                  const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center text-xs space-x-3">
                      <div className="flex items-center space-x-1 w-14 shrink-0 font-bold text-slate-700">
                        <span>{star} sao</span>
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-28 text-right text-[11px] text-slate-500 font-semibold shrink-0">
                        <span className="text-slate-800 font-bold">{pct}%</span> ({count} đánh giá)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{rev.authorName}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Đã mua tại FPT Shop
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{rev.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Write / Edit Review Form */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900">
                {userExistingReview ? 'Cập Nhật Đánh Giá Của Bạn' : 'Gửi Đánh Giá Của Bạn'}
              </h4>
              {userExistingReview && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Đã đánh giá trước đó
                </span>
              )}
            </div>
            <form onSubmit={handleAddReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức độ hài lòng của bạn:</label>
                <div className="flex space-x-1 text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      onClick={() => setNewReviewRating(s)}
                      className={`w-6 h-6 transition-transform hover:scale-110 ${
                        s <= newReviewRating ? 'fill-current text-amber-500' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên của bạn *</label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="Ví dụ: Hoàng Tuấn Anh"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung nhận xét *</label>
                <textarea
                  rows={3}
                  required
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  placeholder="Cảm nhận của bạn về chất lượng máy, thiết kế, thời gian giao hàng..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
              >
                <span>
                  {submittingReview
                    ? 'Đang gửi...'
                    : userExistingReview
                    ? 'Lưu Cập Nhật Đánh Giá'
                    : 'Gửi Đánh Giá Ngay'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Installment Calculator Modal */}
      {showInstallmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Ưu đãi độc quyền FPT Shop
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Bảng Tính Trả Góp 0% Lãi Suất
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowInstallmentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Product Info Summary Box */}
              <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-14 h-14 object-contain rounded-lg bg-white p-1 border border-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Gói bảo hành: <strong className="text-slate-700">{selectedWarranty.name}</strong>
                  </p>
                  <p className="text-xs font-black text-red-600 mt-0.5">
                    Tổng giá trị: {formatCurrency(totalInstallmentAmount)} (x{quantity})
                  </p>
                </div>
              </div>

              {/* Step 1: Chọn Kênh Trả Góp */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">1. Chọn hình thức trả góp:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInstallmentChannel('finance');
                      setSelectedProvider('FE Credit');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      installmentChannel === 'finance'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className={`font-bold ${installmentChannel === 'finance' ? 'text-blue-700' : 'text-slate-800'}`}>
                      🏢 Công ty Tài Chính (CCCD)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chỉ cần CCCD gắn chip, duyệt nhanh 15 phút, không thế chấp
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInstallmentChannel('credit_card');
                      setSelectedProvider('Visa / Mastercard');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      installmentChannel === 'credit_card'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className={`font-bold ${installmentChannel === 'credit_card' ? 'text-blue-700' : 'text-slate-800'}`}>
                      💳 Thẻ Tín Dụng (Credit Card)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      0% Lãi suất, kỳ hạn linh hoạt đến 12 tháng, không giữ giấy tờ
                    </p>
                  </button>
                </div>

                {/* Chọn đối tác */}
                <div className="flex items-center space-x-2 mt-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Đối tác hỗ trợ:</span>
                  {installmentChannel === 'finance' ? (
                    <>
                      {['FE Credit', 'Home Credit'].map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setSelectedProvider(prov)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            selectedProvider === prov
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['Visa / Mastercard', 'VPBank', 'Techcombank', 'TPBank'].map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setSelectedProvider(prov)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            selectedProvider === prov
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Step 2: Chọn tỷ lệ trả trước */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-700">2. Số tiền trả trước mong muốn:</label>
                  <span className="font-extrabold text-blue-600">{formatCurrency(prepaymentAmount)}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 20, 30, 50, 70].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPrepaidPercent(pct)}
                      className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                        prepaidPercent === pct
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Chọn kỳ hạn trả góp */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">3. Kỳ hạn vay trả góp:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 9, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTermMonths(m)}
                      className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                        termMonths === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m} Tháng {m === 6 && <span className="text-[10px] block opacity-80">(Gợi ý)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Calculation Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                  <span className="font-bold text-slate-700">Giá trị đơn hàng:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalInstallmentAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Số tiền trả trước ({prepaidPercent}%):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(prepaymentAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Số tiền cần trả góp (Khoản vay):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Lãi suất ưu đãi:</span>
                  <span className="font-bold text-emerald-600">0% (FPT Shop tài trợ)</span>
                </div>

                <div className="pt-2 border-t border-blue-200 flex justify-between items-baseline">
                  <div>
                    <p className="font-extrabold text-sm text-slate-900">Góp mỗi tháng ({termMonths} tháng):</p>
                    <p className="text-[10px] text-slate-400">Đã bao gồm toàn bộ phí ưu đãi 0%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-red-600">
                      {formatCurrency(monthlyPayment)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">/tháng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowInstallmentModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyInstallment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] flex items-center space-x-1.5"
              >
                <span>Đăng Ký Trả Góp Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
