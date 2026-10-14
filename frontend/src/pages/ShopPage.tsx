import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, RotateCcw, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { categoryApi, productApi } from '../api/services';
import { Category, Product } from '../types';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states (Spring Boot 0-indexed)
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(12);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

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
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, selectedBrand, keyword, sortBy, sortDir, page, size]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({
        categorySlug: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        keyword: keyword.trim() || undefined,
        sortBy,
        sortDir,
        page,
        size,
      });

      if (res.success && res.data) {
        setProducts(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setKeyword('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(0);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for pagination numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  const fromIndex = totalElements === 0 ? 0 : page * size + 1;
  const toIndex = Math.min((page + 1) * size, totalElements);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page Title & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Cửa Hàng Thiết Bị Công Nghệ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tìm thấy <span className="font-bold text-slate-800">{totalElements}</span> sản phẩm chính hãng phù hợp với yêu cầu
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
              setPage(0);
            }}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-red-500 shadow-xs"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="salePrice-asc">Giá: Thấp đến Cao</option>
            <option value="salePrice-desc">Giá: Cao đến Thấp</option>
            <option value="rating-desc">Đánh giá sao cao nhất</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(0);
                  }}
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
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(0);
                  }}
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
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setPage(0);
                    }}
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
                    onClick={() => {
                      setSelectedBrand(selectedBrand === b ? '' : b);
                      setPage(0);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      selectedBrand === b
                        ? 'bg-red-600 border-red-600 text-white font-bold shadow-xs'
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

        {/* Product Grid & Pagination Area */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="py-24 text-center text-slate-400 font-medium">Đang tìm kiếm sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-slate-400 text-base">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
              <button
                onClick={handleResetFilters}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Standard Pagination Controls */}
              {totalPages > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  {/* Results info */}
                  <div className="text-slate-500 text-center sm:text-left">
                    Hiển thị <span className="font-bold text-slate-900">{fromIndex} - {toIndex}</span> trên tổng số{' '}
                    <span className="font-bold text-slate-900">{totalElements}</span> sản phẩm
                  </div>

                  {/* Page buttons */}
                  <div className="flex items-center space-x-1.5">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
                        page === 0
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-red-600'
                      }`}
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Numeric Pages */}
                    {getPageNumbers().map((item, idx) => {
                      if (item === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold select-none">
                            ...
                          </span>
                        );
                      }
                      const pageIdx = item as number;
                      const isActive = pageIdx === page;
                      return (
                        <button
                          key={pageIdx}
                          type="button"
                          onClick={() => handlePageChange(pageIdx)}
                          className={`min-w-8 h-8 px-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center ${
                            isActive
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {pageIdx + 1}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                      className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
                        page >= totalPages - 1
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-red-600'
                      }`}
                      title="Trang tiếp theo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page Size Selector */}
                  <div className="flex items-center space-x-2 text-slate-600">
                    <span className="text-[11px] text-slate-400">Hiển thị:</span>
                    <select
                      value={size}
                      onChange={(e) => handleSizeChange(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
                    >
                      <option value={8}>8 / trang</option>
                      <option value={12}>12 / trang</option>
                      <option value={24}>24 / trang</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
