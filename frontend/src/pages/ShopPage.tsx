import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { categoryApi, productApi } from '../api/services';
import { Category, Product } from '../types';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const categorySlugParam = searchParams.get('category') || '';
  const keywordParam = searchParams.get('keyword') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlugParam);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [keyword, setKeyword] = useState<string>(keywordParam);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('desc');

  const brands = ['Apple', 'ASUS', 'MSI', 'Lenovo', 'Intel', 'AMD', 'Corsair', 'Samsung', 'Kingston'];

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, selectedBrand, keyword, sortBy, sortDir]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({
        categorySlug: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        keyword: keyword || undefined,
        sortBy,
        sortDir,
        size: 36,
      });

      if (res.success && res.data) {
        setProducts(res.data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setKeyword('');
    setSortBy('createdAt');
    setSortDir('desc');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Cửa Hàng Thiết Bị Công Nghệ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tìm thấy {products.length} sản phẩm chính hãng phù hợp với yêu cầu
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('-');
              setSortBy(sb);
              setSortDir(sd);
            }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="salePrice-asc">Giá: Thấp đến Cao</option>
            <option value="salePrice-desc">Giá: Cao đến Thấp</option>
            <option value="rating-desc">Đánh giá sao cao nhất</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2 text-sm">
                <Filter className="w-4 h-4 text-red-600" />
                <span>Bộ Lọc Tìm Kiếm</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Từ khóa
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full text-xs pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-red-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Danh mục
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === ''
                      ? 'bg-red-50 text-red-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả danh mục
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${
                      selectedCategory === c.slug
                        ? 'bg-red-50 text-red-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.productCount || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Thương hiệu
              </label>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      selectedBrand === b
                        ? 'bg-red-600 border-red-600 text-white font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Đang tìm kiếm sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-slate-400 text-base">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
              <button
                onClick={handleResetFilters}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
