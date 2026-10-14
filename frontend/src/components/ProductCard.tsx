import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Cpu, HardDrive } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';

interface ProductCardProps {
  product: Product;
}

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const showToast = useToastStore((state) => state.showToast);


  const discountPercent = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
      {/* Thumbnail area */}
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-slate-50 pt-[75%]">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
            Giảm {discountPercent}%
          </span>
        )}
        {product.bestSeller && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Bán chạy
          </span>
        )}
      </Link>

      {/* Info area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {product.brand}
          </span>
          <Link
            to={`/product/${product.slug}`}
            className="block font-semibold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mt-0.5 mb-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Specs Snippets */}
          {(product.cpu || product.ram || product.storage) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.cpu && (
                <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">
                  <Cpu className="w-2.5 h-2.5 mr-1 text-slate-500 shrink-0" />
                  {product.cpu}
                </span>
              )}
              {product.ram && (
                <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  {product.ram}
                </span>
              )}
              {product.storage && (
                <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  <HardDrive className="w-2.5 h-2.5 mr-1 text-slate-500 shrink-0" />
                  {product.storage}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Rating */}
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-red-600 font-extrabold text-base md:text-lg">
              {formatCurrency(product.salePrice)}
            </span>
            {product.originalPrice > product.salePrice && (
              <span className="text-slate-400 text-xs line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center text-xs text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              <span>{product.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-slate-400 text-[10px] ml-1">({product.reviewCount || 10})</span>
            </div>

            <button
              onClick={() => {
                addToCart(product, 1);
                showToast(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
              }}
              className="flex items-center space-x-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Mua</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
