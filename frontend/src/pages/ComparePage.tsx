import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Trash2,
  ShoppingCart,
  Star,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  Battery
} from 'lucide-react';
import { useCompareStore } from '../store/compareStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { formatCurrency } from '../components/ProductCard';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, removeProduct, clearCompare } = useCompareStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const showToast = useToastStore((state) => state.showToast);

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Scale className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Chưa Có Sản Phẩm Nào Để So Sánh</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Hãy chọn nút <strong>"So sánh"</strong> tại các sản phẩm trên FPT TechStore để đối chiếu chi tiết cấu hình, mức giá và chế độ bảo hành!
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-red-600/30"
          >
            <span>Khám phá sản phẩm ngay</span>
          </Link>
        </div>
      </div>
    );
  }

  // Thu thập tất cả các key kỹ thuật tùy chọn từ specs JSON của các sản phẩm (nếu có)
  const allCustomSpecKeys = Array.from(
    new Set(
      products.flatMap((p) => (p.specs ? Object.keys(p.specs) : []))
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center space-x-1 mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang trước</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Scale className="w-6 h-6 text-red-600" />
            <span>Bảng So Sánh Chi Tiết Thiết Bị ({products.length}/3)</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {products.length < 3 && (
            <Link
              to="/shop"
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-red-600" />
              <span>Thêm sản phẩm ({3 - products.length} slot)</span>
            </Link>
          )}
          <button
            onClick={clearCompare}
            className="inline-flex items-center space-x-1 text-slate-500 hover:text-rose-600 font-bold px-3 py-2 rounded-xl text-xs hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa so sánh</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
          {/* Header Row: Products overview */}
          <thead>
            <tr className="border-b border-slate-200 divide-x divide-slate-100 bg-slate-50/50">
              <th className="w-48 p-4 font-bold text-slate-400 uppercase text-[11px] align-top bg-slate-50">
                Tiêu Chí So Sánh
              </th>
              {products.map((item) => {
                const discount = Math.round(
                  ((item.originalPrice - item.salePrice) / item.originalPrice) * 100
                );
                return (
                  <th key={item.id} className="p-4 align-top w-1/3">
                    <div className="space-y-3">
                      <div className="relative group bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-center">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="h-40 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={() => removeProduct(item.id)}
                          className="absolute top-2 right-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                          title="Xóa khỏi so sánh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {item.brand}
                        </span>
                        <Link
                          to={`/product/${item.slug}`}
                          className="block font-bold text-sm text-slate-900 hover:text-red-600 mt-1 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                      </div>

                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-black text-red-600">
                          {formatCurrency(item.salePrice)}
                        </span>
                        {item.originalPrice > item.salePrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          addToCart(item, 1);
                          showToast(`Đã thêm ${item.name} vào giỏ hàng!`, 'success');
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Thêm Vào Giỏ</span>
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Row: Danh mục */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60">Danh Mục Thiết Bị</td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-semibold text-slate-800">
                  {item.categoryName || 'Sản phẩm công nghệ'}
                </td>
              ))}
            </tr>

            {/* Row: Đánh giá */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60">Đánh Giá & Nhận Xét</td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{item.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-slate-400 font-normal ml-1">
                      ({item.reviewCount || 10} đánh giá)
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row: Tình trạng kho hàng */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60">Tình Trạng Kho</td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5">
                  {item.stockQuantity > 0 ? (
                    <span className="inline-flex items-center text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Sẵn hàng ({item.stockQuantity} chiếc)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-rose-500 font-bold">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Tạm hết hàng
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Section: Thông số kỹ thuật */}
            <tr className="bg-slate-100/70 border-y border-slate-200">
              <td
                colSpan={products.length + 1}
                className="py-2.5 px-4 font-black uppercase text-slate-700 tracking-wider text-[11px]"
              >
                Cấu Hình Phần Cứng & Thông Số Kỹ Thuật
              </td>
            </tr>

            {/* Row: CPU */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Vi xử lý (CPU)</span>
              </td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-medium text-slate-900">
                  {item.cpu || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Row: RAM */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60">Bộ nhớ RAM</td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-medium text-slate-900">
                  {item.ram || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Row: Ổ cứng */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Ổ cứng lưu trữ</span>
              </td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-medium text-slate-900">
                  {item.storage || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Row: Card đồ họa (VGA) */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span>Card đồ họa (VGA)</span>
              </td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-medium text-slate-900">
                  {item.vga || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Row: Màn hình */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 flex items-center space-x-1.5">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>Màn hình</span>
              </td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-medium text-slate-900">
                  {item.screen || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Row: Pin */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 flex items-center space-x-1.5">
                <Battery className="w-3.5 h-3.5 text-slate-400" />
                <span>Dung lượng Pin</span>
              </td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-medium text-slate-900">
                  {item.battery || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Row: Slot PC Builder */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60">Slot PC Builder</td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-mono text-[11px] font-bold text-slate-600">
                  {item.componentType !== 'NONE' ? item.componentType : <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>

            {/* Các trường specs JSON mở rộng (nếu có) */}
            {allCustomSpecKeys.map((key) => (
              <tr key={key} className="hover:bg-slate-50/50 divide-x divide-slate-100">
                <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 capitalize">{key}</td>
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 font-medium text-slate-900">
                    {item.specs?.[key] || <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}

            {/* Section: Hậu mãi & Bảo hành */}
            <tr className="bg-slate-100/70 border-y border-slate-200">
              <td
                colSpan={products.length + 1}
                className="py-2.5 px-4 font-black uppercase text-slate-700 tracking-wider text-[11px]"
              >
                Chính Sách Bảo Hành & Hậu Mãi FPT Shop
              </td>
            </tr>

            {/* Row: Bảo hành chính hãng */}
            <tr className="hover:bg-slate-50/50 divide-x divide-slate-100">
              <td className="p-3.5 font-bold text-slate-600 bg-slate-50/60 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Bảo hành chính hãng</span>
              </td>
              {products.map((item) => (
                <td key={item.id} className="p-3.5 font-bold text-slate-900">
                  {item.warrantyMonths || 12} Tháng (1 đổi 1 30 ngày)
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
