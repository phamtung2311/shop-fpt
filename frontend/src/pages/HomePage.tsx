import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Flame,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Truck,
  RotateCcw,
  CreditCard,
  Gift
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { categoryApi, productApi } from '../api/services';
import { Category, Product } from '../types';

interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  bgGradient: string;
  glowColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: 'MỞ BÁN CHÍNH HÃNG 2026',
    title: 'iPhone 16 Pro Max',
    highlight: 'Titan Sa Mạc Đỉnh Cao',
    description: 'Chip A18 Pro đột phá, camera 48MP Fusion sắc nét, điều khiển nút chụp Camera Control hoàn toàn mới.',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    primaryBtnText: 'Mua Ngay Giá Tốt',
    primaryBtnLink: '/shop?keyword=iPhone',
    secondaryBtnText: 'Xem Chi Tiết',
    secondaryBtnLink: '/shop',
    bgGradient: 'from-slate-950 via-slate-900 to-amber-950',
    glowColor: 'bg-amber-600/20',
  },
  {
    id: 2,
    badge: 'SIÊU PHẨM GAMING ROG',
    title: 'ASUS ROG Zephyrus G16',
    highlight: 'Màn Hình OLED 240Hz',
    description: 'Cấu hình Intel Core Ultra 9, RTX 4080 cân trọn mọi tựa game AAA. Tặng kèm balo ROG và chuột gaming cao cấp.',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    primaryBtnText: 'Khám Phá Ngay',
    primaryBtnLink: '/shop?category=laptop',
    secondaryBtnText: 'Tất Cả Laptop',
    secondaryBtnLink: '/shop?category=laptop',
    bgGradient: 'from-slate-950 via-slate-900 to-red-950',
    glowColor: 'bg-red-600/25',
  },
  {
    id: 3,
    badge: 'CÔNG CỤ THÔNG MINH FPT',
    title: 'Xây Dựng Cấu Hình PC',
    highlight: 'Tương Thích Chuẩn 100%',
    description: 'Tự tay chọn CPU, Mainboard, VGA, RAM và kiểm tra xung đột phần cứng tự động chỉ trong 30 giây.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    primaryBtnText: 'Ráp Máy Ngay',
    primaryBtnLink: '/pc-builder',
    secondaryBtnText: 'Xem Linh Kiện',
    secondaryBtnLink: '/shop?category=linh-kien-pc',
    bgGradient: 'from-slate-950 via-slate-900 to-blue-950',
    glowColor: 'bg-blue-600/25',
  },
];

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, featRes, bestRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getFeatured(),
          productApi.getBestSellers(),
        ]);
        if (catsRes.success) setCategories(catsRes.data);
        if (featRes.success) setFeaturedProducts(featRes.data);
        if (bestRes.success) setBestSellers(bestRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section: Slider (8 cols) + 2 Sub-banners (4 cols) */}
      <section className="max-w-7xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Banner Carousel (8 cols) */}
          <div
            className={`lg:col-span-8 relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-r ${slide.bgGradient} text-white min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-8 transition-colors duration-700`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute -right-16 -bottom-16 w-80 h-80 ${slide.glowColor} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}
            />

            {/* Slide Content */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center flex-1">
              <div className="sm:col-span-7 space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{slide.badge}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
                  {slide.title} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                    {slide.highlight}
                  </span>
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 max-w-md leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to={slide.primaryBtnLink}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                  >
                    <span>{slide.primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {slide.secondaryBtnLink && (
                    <Link
                      to={slide.secondaryBtnLink}
                      className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      <span>{slide.secondaryBtnText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Slide Image */}
              <div className="sm:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[260px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 p-2">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover rounded-xl transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Slider Controls: Prev/Next & Dots */}
            <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10 mt-4">
              {/* Dot Indicators */}
              <div className="flex items-center space-x-2">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-7 bg-red-500 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  title="Banner trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  title="Banner tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 2 Sub-banners (4 cols) Layout chuẩn FPT Shop */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
            {/* Sub-banner 1: Thu cũ đổi mới */}
            <Link
              to="/shop"
              className="flex-1 relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white shadow-md group hover:shadow-xl transition-all"
            >
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div>
                  <span className="inline-block bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                    Thu Cũ Đổi Mới
                  </span>
                  <h3 className="text-lg font-black leading-tight group-hover:text-amber-100 transition-colors">
                    Trợ Giá Lên Đến 3.000.000₫
                  </h3>
                  <p className="text-white/80 text-xs mt-1 leading-snug">
                    Định giá máy cũ nhanh trong 5 phút. Lên đời iPhone & Laptop tiết kiệm tối đa.
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-200 group-hover:translate-x-1 transition-transform">
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            </Link>

            {/* Sub-banner 2: Trả góp 0% */}
            <Link
              to="/shop"
              className="flex-1 relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white shadow-md group hover:shadow-xl transition-all border border-slate-800"
            >
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div>
                  <span className="inline-block bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                    Tài Chính Linh Hoạt
                  </span>
                  <h3 className="text-lg font-black leading-tight group-hover:text-blue-200 transition-colors">
                    Trả Góp 0% Lãi Suất
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 leading-snug">
                    Duyệt hồ sơ nhanh 15 phút. 0 đồng trả trước qua thẻ tín dụng và đối tác FE/HD Saison.
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1 text-xs font-bold text-blue-300 group-hover:translate-x-1 transition-transform">
                  <span>Đăng ký xét duyệt</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
            </Link>
          </div>
        </div>

        {/* 4 Brand Commitments Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Giao Siêu Tốc 2H</p>
              <p className="text-[10px] text-slate-400">Nội thành miễn phí</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Chính Hãng 100%</p>
              <p className="text-[10px] text-slate-400">Bảo hành chính hãng FPT</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Lỗi Đổi Mới 30 Ngày</p>
              <p className="text-[10px] text-slate-400">Thủ tục nhanh gọn</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Trả Góp 0% Lãi Suất</p>
              <p className="text-[10px] text-slate-400">Xét duyệt qua thẻ & CCCD</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Danh Mục Nổi Bật</span>
          </h2>
          <Link to="/shop" className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center">
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="bg-white p-4 rounded-xl border border-slate-200 text-center hover:border-red-500 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                <Cpu className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-800 group-hover:text-red-600 transition-colors truncate">
                {cat.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">{cat.productCount || 0} sản phẩm</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-600 text-white rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-none">Sản Phẩm Nổi Bật</h2>
              <p className="text-xs text-slate-500 mt-1">Các thiết bị công nghệ được săn đón nhất</p>
            </div>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-red-600 hover:text-red-700">
            Khám phá thêm →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Đang tải sản phẩm...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* PC Builder Promo Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Tính Năng Độc Quyền
            </span>
            <h3 className="text-2xl md:text-3xl font-black">
              Tự Tay Build Bộ PC Gaming Trong Mơ
            </h3>
            <p className="text-red-100 text-sm max-w-xl">
              Chọn linh kiện chuẩn socket, kiểm tra tương thích tự động, dự toán chi phí chính xác và thêm nguyên case vào giỏ hàng chỉ với 1 chạm.
            </p>
          </div>
          <Link
            to="/pc-builder"
            className="shrink-0 bg-white hover:bg-slate-100 text-red-600 font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
          >
            <Cpu className="w-5 h-5 text-red-600" />
            <span>Mở Công Cụ Build PC</span>
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-none">Bán Chạy Nhất</h2>
              <p className="text-xs text-slate-500 mt-1">Đánh giá cao & doanh số top đầu tuần qua</p>
            </div>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-red-600 hover:text-red-700">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Đang tải sản phẩm...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
