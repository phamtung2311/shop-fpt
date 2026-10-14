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
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { categoryApi, productApi } from '../api/services';
import { Category, Product } from '../types';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white py-12 px-4 rounded-2xl mx-4 mt-4 shadow-xl overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CÔNG NGHỆ THẾ HỆ MỚI 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sở Hữu Cấu Hình Đỉnh Cao <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                Hiệu Năng Vô Địch
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Trải nghiệm mua sắm Laptop Gaming ROG, iPhone 16 Pro Max, RTX 4070 Super cùng công cụ
              <strong className="text-white"> Xây dựng cấu hình PC</strong> tự động tương thích chỉ với vài cú click chuột!
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/pc-builder"
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105"
              >
                <Cpu className="w-5 h-5" />
                <span>Trải Nghiệm Build PC Ngay</span>
              </Link>
              <Link
                to="/shop"
                className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                <span>Xem Sản Phẩm</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 p-4">
              <img
                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"
                alt="ASUS ROG Gaming"
                className="w-full h-72 object-cover rounded-xl"
              />
              <div className="mt-4 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-400">Siêu phẩm mở bán</p>
                  <p className="font-bold text-white text-sm">ASUS ROG Zephyrus G16 OLED 240Hz</p>
                </div>
                <span className="bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-lg">
                  63.990.000₫
                </span>
              </div>
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
