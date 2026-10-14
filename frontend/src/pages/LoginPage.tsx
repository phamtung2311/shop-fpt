import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';
import { authApi } from '../api/services';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('customer@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        setAuth(
          {
            id: res.data.id,
            email: res.data.email,
            fullName: res.data.fullName,
            role: res.data.role as any,
          },
          res.data.token
        );
        navigate('/');
      } else {
        setErrorMsg(res.message || 'Đăng nhập không thành công');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@fptshop.com');
      setPassword('admin123');
    } else {
      setEmail('customer@gmail.com');
      setPassword('123456');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-slate-500">Trải nghiệm mua sắm và quản lý đơn hàng</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Quick Login Test Accounts for Internship Demo */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <p className="font-bold text-slate-700 flex items-center">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
            Tài khoản mẫu để chấm demo:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="bg-white border border-slate-300 hover:border-red-500 px-2 py-1 rounded text-[11px] font-medium"
            >
              Khách hàng (customer)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="bg-white border border-slate-300 hover:border-red-500 px-2 py-1 rounded text-[11px] font-medium text-red-600"
            >
              Quản trị viên (admin)
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-slate-50"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-slate-50"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-red-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
