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
  UserCheck
} from 'lucide-react';
import { productApi, reviewApi } from '../api/services';
import { Product, Review } from '../types';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const showToast = useToastStore((state) => state.showToast);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState(user?.fullName || '');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng!`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
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
        setReviews([res.data, ...reviews]);
        if (product) {
          const newCount = product.reviewCount + 1;
          const newRating = Math.round(((product.rating * product.reviewCount + newReviewRating) / newCount) * 10) / 10;
          setProduct({ ...product, rating: newRating, reviewCount: newCount });
        }
        setNewReviewContent('');
        showToast('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!', 'success');
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
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center relative overflow-hidden shadow-sm">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="max-h-[420px] w-auto object-contain hover:scale-105 transition-transform duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                Tiết kiệm {discountPercent}%
              </span>
            )}
          </div>

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
            <div className="flex items-center space-x-3 mt-3 text-xs">
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
                className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
              >
                Mua Ngay (Giao 2h)
              </button>
            </div>
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <span>Đánh Giá & Nhận Xét Từ Khách Hàng</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Đánh giá thực tế từ người dùng đã mua sản phẩm tại FPT TechStore</p>
          </div>

          <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
            <span className="text-3xl font-black text-amber-600">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            <div className="text-xs">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 5) ? 'fill-current text-amber-500' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-500 font-semibold">{reviews.length} lượt đánh giá</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{rev.authorName}</span>
                      <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                        <UserCheck className="w-3 h-3 mr-0.5" /> Đã mua tại FPT
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{rev.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 mb-3">Gửi Đánh Giá Của Bạn</h4>
            <form onSubmit={handleAddReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức độ hài lòng:</label>
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
                <span>{submittingReview ? 'Đang gửi đánh giá...' : 'Gửi Đánh Giá'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
