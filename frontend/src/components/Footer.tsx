import React from 'react';
import { Phone, MapPin, Mail, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16 border-t border-slate-800 text-sm">
      {/* Policy Highlights */}
      <div className="border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-slate-300">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-white">Giao hàng miễn phí</p>
              <p className="text-xs text-slate-400">Cho đơn hàng từ 500.000đ trở lên</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-white">Đổi trả 30 ngày</p>
              <p className="text-xs text-slate-400">Lỗi 1 đổi 1 nhanh chóng tận nơi</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-white">Bảo hành chính hãng</p>
              <p className="text-xs text-slate-400">100% linh kiện & thiết bị phân phối chính hãng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-sm">FPT</span>
            <span className="font-bold text-white text-base">TechStore</span>
          </div>
          <p className="text-xs leading-relaxed mb-4">
            Hệ thống phân phối điện thoại, máy tính laptop, PC Gaming và công cụ xây dựng cấu hình máy tính hàng đầu Việt Nam.
          </p>
          <div className="space-y-2 text-xs">
            <p className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-red-500" /><span>Hà Nội: 261 Khánh Hội & Toàn quốc</span></p>
            <p className="flex items-center space-x-2"><Phone className="w-4 h-4 text-red-500" /><span>Hotline: 1800 6601 (Tư vấn miễn phí)</span></p>
            <p className="flex items-center space-x-2"><Mail className="w-4 h-4 text-red-500" /><span>hotro@fptshop.com</span></p>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Thông Tin & Chính Sách</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white">Chính sách bảo hành</a></li>
            <li><a href="#" className="hover:text-white">Chính sách đổi trả linh kiện</a></li>
            <li><a href="#" className="hover:text-white">Phương thức thanh toán & trả góp</a></li>
            <li><a href="#" className="hover:text-white">Chính sách bảo mật thông tin</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Dịch Vụ & Hỗ Trợ</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white">Xây dựng cấu hình PC Online</a></li>
            <li><a href="#" className="hover:text-white">Tra cứu hóa đơn điện tử</a></li>
            <li><a href="#" className="hover:text-white">Trung tâm bảo hành Apple chính hãng</a></li>
            <li><a href="#" className="hover:text-white">Dịch vụ sửa chữa Laptop & PC</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Hỗ Trợ Thanh Toán</h4>
          <p className="text-xs mb-3">Hỗ trợ đa dạng phương thức an toàn và tiện lợi:</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-800">
            <span className="bg-white px-2 py-1 rounded">VNPay QR</span>
            <span className="bg-white px-2 py-1 rounded">Tiền mặt (COD)</span>
            <span className="bg-white px-2 py-1 rounded">Visa / Master</span>
            <span className="bg-white px-2 py-1 rounded">MoMo</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © 2026 FPT TechStore - Báo cáo thực tập chuyên ngành Công nghệ Thông tin. Phát triển với Java Spring Boot & React.
      </div>
    </footer>
  );
};
