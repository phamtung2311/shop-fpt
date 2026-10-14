import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  User as UserIcon,
  Search,
  Cpu,
  LogOut,
  ShieldAlert,
  Smartphone,
  Laptop,
  Monitor,
  Headphones,
  Briefcase,
  Menu,
  X,
  Package,
  Loader2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { productApi, categoryApi } from '../api/services';
import { Product, Category } from '../types';
import { formatCurrency } from './ProductCard';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategorySlug = location.pathname === '/shop' ? searchParams.get('category') : null;

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const [keyword, setKeyword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Dynamic categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Live autocomplete search state
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryApi.getAll().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!keyword.trim() || keyword.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productApi.getProducts({ keyword: keyword.trim(), size: 5 });
        if (res.success && res.data) {
          setSearchResults(res.data.content);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowSearchDropdown(false);
      setIsMobileMenuOpen(false);
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleSelectSearchResult = (product: Product) => {
    setShowSearchDropdown(false);
    setIsMobileMenuOpen(false);
    setKeyword('');
    navigate(`/product/${product.slug}`);
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'Laptop': return <Laptop className="w-4 h-4" />;
      case 'Monitor': return <Monitor className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Headphones': return <Headphones className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-red-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span>🔥 <strong>FPT TechStore</strong> - Chuỗi cửa hàng công nghệ & linh kiện chính hãng</span>
            <span className="hidden md:inline">Hotline mua hàng: <strong className="text-yellow-300">1800 6601</strong> (Miễn phí)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline">Bảo hành 100%</span>
            <Link
              to="/admin"
              className="bg-black/30 hover:bg-black/50 text-yellow-300 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 text-[11px] transition-colors border border-yellow-300/30 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
              <span>Trang Quản Trị (Admin)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <div className="bg-red-600 text-white font-black text-xl px-2.5 py-1 rounded tracking-wider shadow">
            FPT
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">TechStore</span>
            <span className="text-[10px] text-slate-500 font-medium">Công Nghệ & PC Builder</span>
          </div>
        </Link>

        {/* Search Bar with Live Autocomplete */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative hidden sm:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => {
                if (keyword.trim().length >= 2 && searchResults.length > 0) {
                  setShowSearchDropdown(true);
                }
              }}
              placeholder="Bạn muốn tìm laptop, điện thoại, RTX 4070, i7 14700K..."
              className="w-full pl-4 pr-11 py-2 rounded-full border border-slate-300 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all bg-slate-50"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Gợi ý tìm kiếm ({searchResults.length})</span>
                {isSearching && (
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang tìm...</span>
                  </span>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-5 text-center text-slate-400 text-xs">
                  Không tìm thấy sản phẩm nào khớp với "{keyword}"
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchResults.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(prod)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-red-50/40 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-11 h-11 object-contain rounded bg-slate-50 p-1 border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400">{prod.brand}</span>
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-red-600">
                            {prod.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs font-black text-red-600">
                              {formatCurrency(prod.salePrice)}
                            </span>
                            {prod.originalPrice > prod.salePrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatCurrency(prod.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSearch}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-red-600 text-xs font-bold text-center border-t border-slate-100 transition-colors flex items-center justify-center space-x-1"
              >
                <span>Xem tất cả kết quả cho "{keyword}"</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* PC Builder Button (Highlight Killer Feature) */}
          <Link
            to="/pc-builder"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-3.5 py-2 rounded-full text-xs md:text-sm font-semibold shadow hover:opacity-95 transition-all animate-pulse"
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Xây Dựng Cấu Hình PC</span>
            <span className="sm:hidden">Build PC</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-slate-700 hover:text-red-600 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* Admin Portal Quick Button */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-yellow-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all border border-yellow-400/40"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
          )}

          {/* User Account */}
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 p-2 text-slate-700 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline">
                  {user?.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400">Đăng nhập bởi</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/my-orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>Đơn hàng của tôi</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Trang Quản Trị Hệ Thống</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-2 w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs md:text-sm font-semibold text-slate-700 hover:text-red-600 px-2 py-1"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-red-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Categories Bar */}
      <nav className="bg-slate-900 text-slate-100 hidden md:block border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm font-medium overflow-x-auto scrollbar-none py-1">
          <Link
            to="/shop"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              location.pathname === '/shop' && !currentCategorySlug
                ? 'bg-red-600 text-white font-bold'
                : 'hover:text-red-400'
            }`}
          >
            <span>Tất Cả Sản Phẩm</span>
          </Link>

          {categories.map((cat) => {
            const isActive = location.pathname === '/shop' && currentCategorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white font-bold'
                    : 'hover:text-red-400 text-slate-200'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.name}</span>
                {cat.productCount !== undefined && cat.productCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-red-600 font-extrabold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.productCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-xs border border-slate-700 text-white focus:outline-none focus:border-red-500"
            />
          </form>

          <Link
            to="/shop"
            className="block py-2 px-3 rounded hover:bg-slate-800 font-semibold text-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tất Cả Sản Phẩm
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-slate-800 text-xs text-slate-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name}</span>
            </Link>
          ))}

          <Link
            to="/pc-builder"
            className="flex items-center space-x-2 py-2.5 px-3 rounded-lg bg-red-600/30 border border-red-500/40 text-amber-300 font-bold text-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Cpu className="w-4 h-4" />
            <span>Xây Dựng Cấu Hình PC ⚡</span>
          </Link>
        </div>
      )}
    </header>
  );
};
