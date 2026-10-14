import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scale, X, ArrowRight, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCompareStore } from '../store/compareStore';
import { formatCurrency } from './ProductCard';

export const FloatingCompareBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, removeProduct, clearCompare } = useCompareStore();
  const [collapsed, setCollapsed] = useState(false);

  // Ẩn thanh so sánh nếu đang ở chính trang /compare
  if (products.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const emptySlotsCount = Math.max(0, 3 - products.length);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700 text-xs">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-black text-slate-100">
              So Sánh Sản Phẩm ({products.length}/3)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={clearCompare}
              className="text-slate-400 hover:text-rose-400 flex items-center space-x-1 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content body */}
        {!collapsed && (
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Products slots grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1 w-full">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 flex items-center space-x-2 relative group hover:border-slate-500 transition-colors"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] font-extrabold text-red-400">
                      {formatCurrency(item.salePrice)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeProduct(item.id)}
                    className="absolute -top-1.5 -right-1.5 bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white rounded-full p-1 shadow transition-colors"
                    title="Xóa khỏi so sánh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Empty placeholder slots */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="border border-dashed border-slate-700 rounded-xl p-2 flex items-center justify-center text-center text-slate-500 text-[11px] h-14"
                >
                  <span>+ Chọn thêm sản phẩm</span>
                </div>
              ))}
            </div>

            {/* Compare action button */}
            <button
              onClick={() => navigate('/compare')}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-red-600/40 flex items-center justify-center space-x-2 transition-all hover:scale-[1.03] shrink-0"
            >
              <span>So Sánh Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
