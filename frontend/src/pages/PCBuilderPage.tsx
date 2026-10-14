import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Database,
  Zap,
  Box,
  Wind,
  Plus,
  Trash2,
  ShoppingCart,
  RotateCcw,
  Printer,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { usePCBuilderStore, PCSlot } from '../store/pcBuilderStore';
import { useCartStore } from '../store/cartStore';
import { productApi } from '../api/services';
import { ComponentType, Product } from '../types';
import { formatCurrency } from '../components/ProductCard';

export const PCBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { slots, setComponent, removeComponent, resetBuild, getTotalPrice, getSelectedCount } =
    usePCBuilderStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const [activeSlot, setActiveSlot] = useState<PCSlot | null>(null);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const totalPrice = getTotalPrice();
  const selectedCount = getSelectedCount();

  // Compatibility & Power Calculation
  const cpuSlot = slots.find((s) => s.type === 'CPU')?.selectedProduct;
  const vgaSlot = slots.find((s) => s.type === 'VGA')?.selectedProduct;
  const psuSlot = slots.find((s) => s.type === 'PSU')?.selectedProduct;
  const mbSlot = slots.find((s) => s.type === 'MAINBOARD')?.selectedProduct;

  let cpuPower = 0;
  if (cpuSlot) {
    const name = (cpuSlot.name + ' ' + (cpuSlot.cpu || '')).toLowerCase();
    if (name.includes('i9') || name.includes('ryzen 9') || name.includes('7950') || name.includes('14900')) cpuPower = 250;
    else if (name.includes('i7') || name.includes('ryzen 7') || name.includes('7800x3d') || name.includes('14700')) cpuPower = 180;
    else if (name.includes('i5') || name.includes('ryzen 5') || name.includes('14400') || name.includes('7600')) cpuPower = 125;
    else if (name.includes('i3') || name.includes('ryzen 3')) cpuPower = 65;
    else cpuPower = 100;
  }

  let gpuPower = 0;
  if (vgaSlot) {
    const name = (vgaSlot.name + ' ' + (vgaSlot.vga || '')).toLowerCase();
    if (name.includes('4090')) gpuPower = 450;
    else if (name.includes('4080')) gpuPower = 320;
    else if (name.includes('4070')) gpuPower = 220;
    else if (name.includes('4060')) gpuPower = 160;
    else if (name.includes('3060')) gpuPower = 170;
    else gpuPower = 180;
  }

  const basePower = (cpuSlot || vgaSlot || mbSlot) ? 80 : 0;
  const estimatedPower = cpuPower + gpuPower + basePower;
  const recommendedPSU = estimatedPower > 0 ? Math.max(500, Math.ceil((estimatedPower * 1.35) / 50) * 50) : 0;

  let selectedPsuWattage = 0;
  if (psuSlot) {
    const match = psuSlot.name.match(/(\d{3,4})\s*w/i);
    selectedPsuWattage = match ? parseInt(match[1], 10) : 750;
  }

  let socketConflict: string | null = null;
  let socketMatch: string | null = null;

  if (cpuSlot && mbSlot) {
    const cpuName = (cpuSlot.name + ' ' + cpuSlot.brand).toLowerCase();
    const mbName = (mbSlot.name + ' ' + (mbSlot.description || '')).toLowerCase();

    const isCpuIntel = cpuName.includes('intel') || cpuName.includes('core i');
    const isCpuAmd = cpuName.includes('amd') || cpuName.includes('ryzen');

    const isMbIntel = mbName.includes('b760') || mbName.includes('z790') || mbName.includes('h610') || mbName.includes('intel') || mbName.includes('lga1700');
    const isMbAmd = mbName.includes('b650') || mbName.includes('x670') || mbName.includes('a620') || mbName.includes('amd') || mbName.includes('am5');

    if (isCpuIntel && isMbAmd) {
      socketConflict = `Cảnh báo Socket: CPU Intel (${cpuSlot.brand}) không khớp chân cắm bo mạch chủ AMD AM5!`;
    } else if (isCpuAmd && isMbIntel) {
      socketConflict = `Cảnh báo Socket: CPU AMD Ryzen không khớp chân cắm bo mạch chủ Intel LGA1700!`;
    } else if ((isCpuIntel && isMbIntel) || (isCpuAmd && isMbAmd)) {
      socketMatch = isCpuIntel ? 'Socket Intel LGA1700 tương thích chuẩn 100%' : 'Socket AMD AM5 tương thích chuẩn 100%';
    }
  }

  const getSlotIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-red-600" />;
      case 'Layers': return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-emerald-600" />;
      case 'Monitor': return <Monitor className="w-5 h-5 text-amber-600" />;
      case 'Database': return <Database className="w-5 h-5 text-cyan-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'Box': return <Box className="w-5 h-5 text-purple-600" />;
      case 'Wind': return <Wind className="w-5 h-5 text-teal-600" />;
      default: return <Cpu className="w-5 h-5 text-red-600" />;
    }
  };

  const openSelectModal = async (slot: PCSlot) => {
    setActiveSlot(slot);
    setLoadingModal(true);
    try {
      const res = await productApi.getComponentsByType(slot.type);
      if (res.success) {
        setModalProducts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (activeSlot) {
      setComponent(activeSlot.type, product);
      setActiveSlot(null);
    }
  };

  const handleAddAllToCart = () => {
    const selected = slots.filter((s) => s.selectedProduct !== null);
    if (selected.length === 0) {
      alert('Vui lòng chọn ít nhất 1 linh kiện trước khi thêm vào giỏ hàng!');
      return;
    }
    selected.forEach((s) => {
      if (s.selectedProduct) {
        addToCart(s.selectedProduct, 1);
      }
    });
    navigate('/cart');
  };

  const handlePrintQuote = () => {
    if (selectedCount === 0) {
      alert('Vui lòng chọn linh kiện trước khi xuất báo giá!');
      return;
    }
    setShowQuoteModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FPT PC BUILDER ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Xây Dựng Cấu Hình PC Tự Chọn</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Lựa chọn linh kiện chuẩn chính hãng. Hệ thống tự động kiểm tra tương thích và lập bảng dự toán chi tiết.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={resetBuild}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm Mới</span>
          </button>
          <button
            onClick={handlePrintQuote}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Giá</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Component Slots List */}
        <div className="lg:col-span-8 space-y-3.5">
          {slots.map((slot) => {
            const hasItem = slot.selectedProduct !== null;
            return (
              <div
                key={slot.type}
                className={`bg-white rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  hasItem
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Slot Label & Info */}
                <div className="flex items-center space-x-3.5 min-w-[220px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getSlotIcon(slot.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-sm text-slate-900">{slot.title}</h4>
                      {slot.required && (
                        <span className="text-[10px] text-red-500 font-bold">*</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {hasItem ? 'Đã chọn linh kiện' : 'Chưa chọn'}
                    </span>
                  </div>
                </div>

                {/* Selected Item Details OR Add Button */}
                {hasItem && slot.selectedProduct ? (
                  <div className="flex-1 flex items-center justify-between gap-4 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={slot.selectedProduct.thumbnail}
                        alt={slot.selectedProduct.name}
                        className="w-12 h-12 object-contain rounded shrink-0 bg-slate-50"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {slot.selectedProduct.name}
                        </p>
                        <p className="text-xs font-bold text-red-600 mt-0.5">
                          {formatCurrency(slot.selectedProduct.salePrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => openSelectModal(slot)}
                        className="text-xs text-slate-600 hover:text-red-600 underline font-medium px-2 py-1"
                      >
                        Đổi
                      </button>
                      <button
                        onClick={() => removeComponent(slot.type)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-50 transition-colors"
                        title="Gỡ linh kiện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openSelectModal(slot)}
                    className="flex items-center justify-center space-x-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-dashed border-slate-300 hover:border-red-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Chọn {slot.title.split('(')[0]}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Pricing Summary & Action Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {/* Compatibility & Wattage Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Kiểm Tra Tương Thích & Điện Năng</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">Auto-Check</span>
            </div>

            {/* Socket Check Alert */}
            {socketConflict ? (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">{socketConflict}</div>
              </div>
            ) : socketMatch ? (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="font-medium">{socketMatch}</div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-500 italic">
                {cpuSlot && !mbSlot
                  ? 'Đã chọn CPU, hãy chọn Bo mạch chủ để hệ thống tự kiểm tra socket.'
                  : !cpuSlot && mbSlot
                  ? 'Đã chọn Bo mạch chủ, hãy chọn CPU để hệ thống tự kiểm tra socket.'
                  : 'Hãy chọn CPU và Bo mạch chủ để kiểm tra chuẩn chân cắm Socket.'}
              </div>
            )}

            {/* Wattage Calculation */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Công suất tiêu thụ ước tính:</span>
                </span>
                <span className="font-black text-slate-900 text-sm">{estimatedPower}W</span>
              </div>

              {/* Power progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (estimatedPower / 850) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>CPU: {cpuPower}W</span>
                <span>VGA: {gpuPower}W</span>
                <span>Hệ thống: {basePower}W</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Khuyến nghị nguồn (PSU):</span>
                  <span className="font-bold text-red-600">
                    {recommendedPSU > 0 ? `Từ ${recommendedPSU}W trở lên` : '—'}
                  </span>
                </div>

                {psuSlot && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                    selectedPsuWattage < recommendedPSU
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {selectedPsuWattage < recommendedPSU ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Nguồn đã chọn ({selectedPsuWattage}W) thấp hơn mức khuyến nghị ({recommendedPSU}W)!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Nguồn đã chọn ({selectedPsuWattage}W) đáp ứng rất tốt cho máy.</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Dự Toán Cấu Hình PC
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Số linh kiện đã chọn:</span>
                <span className="font-bold text-slate-900">{selectedCount} / {slots.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Chi phí lắp ráp & Test máy:</span>
                <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Giao hàng tận nơi:</span>
                <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cài đặt Windows & Office bản quyền:</span>
                <span className="text-emerald-600 font-bold">HỖ TRỢ MIỄN PHÍ</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng tạm tính (gồm VAT):</p>
                <p className="text-2xl font-black text-red-600">{formatCurrency(totalPrice)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAddAllToCart}
                disabled={selectedCount === 0}
                className={`w-full py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center space-x-2 transition-all shadow-md ${
                  selectedCount > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm Toàn Bộ Vào Giỏ Hàng</span>
              </button>

              <button
                onClick={handlePrintQuote}
                disabled={selectedCount === 0}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                  selectedCount > 0
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Xem & In Phiếu Báo Giá FPT Shop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select Component Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                {getSlotIcon(activeSlot.iconName)}
                <h3 className="font-extrabold text-base text-slate-900">
                  Chọn {activeSlot.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {loadingModal ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  Đang tải danh sách linh kiện tương thích...
                </div>
              ) : modalProducts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  Không tìm thấy linh kiện nào cho slot này trong kho.
                </div>
              ) : (
                modalProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={prod.thumbnail}
                        alt={prod.name}
                        className="w-14 h-14 object-contain rounded bg-white shrink-0 p-1 border border-slate-100"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{prod.brand}</span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{prod.name}</h5>
                        <p className="text-xs font-black text-red-600 mt-0.5">
                          {formatCurrency(prod.salePrice)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectProduct(prod)}
                      className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Chọn
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official FPT Shop Quotation Invoice Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col">
            {/* Action Bar (Hidden when printed) */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex justify-between items-center print:hidden">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="font-extrabold text-sm">Xem Trước & In Báo Giá Chuẩn Doanh Nghiệp</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu / Lưu PDF</span>
                </button>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-8 sm:p-10 space-y-6 text-slate-800 text-xs bg-white" id="printable-quotation">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-red-600 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-600 text-white font-black text-xl px-2.5 py-0.5 rounded tracking-wider">
                      FPT
                    </span>
                    <span className="font-extrabold text-lg text-slate-900">TechStore</span>
                  </div>
                  <p className="font-bold text-slate-800 mt-2 text-xs">CÔNG TY CỔ PHẦN BÁN LẺ KỸ THUẬT SỐ FPT</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Địa chỉ: 261 - 263 Khánh Hội, Phường 2, Quận 4, TP. Hồ Chí Minh</p>
                  <p className="text-slate-500 text-[11px]">Hotline: 1800 6601 | Email: techstore@fptshop.com.vn | MST: 0311609355</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-red-50 text-red-700 border border-red-200 font-extrabold px-3 py-1 rounded text-xs">
                    PHIẾU BÁO GIÁ
                  </span>
                  <p className="font-mono text-[11px] text-slate-500 mt-1">Mã: BG-PC-{Date.now().toString().slice(-6)}</p>
                  <p className="text-[11px] text-slate-500">Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Quotation Title */}
              <div className="text-center py-2">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  BẢNG DỰ TOÁN BÁO GIÁ CẤU HÌNH MÁY TÍNH PC
                </h2>
                <p className="text-slate-500 text-[11px] italic mt-0.5">
                  (Báo giá có hiệu lực trong vòng 07 ngày kể từ ngày phát hành)
                </p>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <p><strong className="text-slate-700">Khách hàng:</strong> Quý khách hàng</p>
                  <p className="mt-1"><strong className="text-slate-700">Yêu cầu:</strong> Dàn máy tính chơi game & làm việc đồ họa cao cấp</p>
                </div>
                <div>
                  <p><strong className="text-slate-700">Nhân viên tư vấn:</strong> Chuyên viên Kỹ thuật FPT Shop</p>
                  <p className="mt-1"><strong className="text-slate-700">Hình thức thanh toán:</strong> Chuyển khoản VNPay-QR / Tiền mặt khi nhận máy (COD)</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-3 w-28">Hạng mục</th>
                      <th className="py-2.5 px-3">Tên linh kiện chính hãng</th>
                      <th className="py-2.5 px-3 text-center">Bảo hành</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-center w-12">SL</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slots
                      .filter((s) => s.selectedProduct !== null)
                      .map((slot, idx) => {
                        const p = slot.selectedProduct!;
                        return (
                          <tr key={slot.type} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{slot.title.split('(')[0]}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{p.name}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{p.warrantyMonths || 36} Tháng</td>
                            <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(p.salePrice)}</td>
                            <td className="py-2.5 px-3 text-center font-bold">1</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(p.salePrice)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Additional Services & Summary */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5 text-[11px] text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-800">ƯU ĐÃI KÈM THEO:</p>
                  <p>✓ Miễn phí công lắp đặt hoàn thiện & đi dây thẩm mỹ (Trị giá 300.000đ)</p>
                  <p>✓ Miễn phí cài đặt Windows 11 bản quyền & phần mềm văn phòng cơ bản</p>
                  <p>✓ Test Stress-test nhiệt độ & độ ổn định 24h trước khi bàn giao</p>
                  <p>✓ Giao hàng hỏa tốc và hỗ trợ kỹ thuật tận nơi</p>
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Tổng tiền linh kiện:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Thuế GTGT (VAT 10%):</span>
                    <span className="font-medium text-slate-700">Đã bao gồm trong giá</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Phí vận chuyển & lắp ráp:</span>
                    <span className="font-bold text-emerald-600">0 VNĐ (Miễn phí)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-extrabold text-sm text-slate-900">TỔNG CỘNG THANH TOÁN:</span>
                    <span className="font-black text-xl text-red-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">KHÁCH HÀNG XÁC NHẬN</p>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">ĐẠI DIỆN FPT TECHSTORE</p>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký tên và đóng dấu)</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="text-red-600 font-bold italic text-xs">[Đã ký điện tử]</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions (Hidden when printed) */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 print:hidden">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Báo Giá Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
