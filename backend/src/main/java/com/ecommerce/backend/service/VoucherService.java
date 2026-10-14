package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ApplyVoucherRequest;
import com.ecommerce.backend.dto.ApplyVoucherResponse;
import com.ecommerce.backend.dto.VoucherDto;
import com.ecommerce.backend.dto.VoucherRequest;
import com.ecommerce.backend.entity.DiscountType;
import com.ecommerce.backend.entity.Voucher;
import com.ecommerce.backend.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;

    public Voucher getVoucherEntityByCode(String code) {
        if (code == null || code.isBlank()) {
            throw new RuntimeException("Vui lòng nhập mã giảm giá");
        }
        return voucherRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá '" + code.trim() + "' không tồn tại"));
    }

    public BigDecimal validateAndCalculateDiscount(String code, BigDecimal subtotal) {
        Voucher voucher = getVoucherEntityByCode(code);

        if (!Boolean.TRUE.equals(voucher.getIsActive())) {
            throw new RuntimeException("Mã giảm giá '" + voucher.getCode() + "' hiện đang bị khóa");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new RuntimeException("Mã giảm giá '" + voucher.getCode() + "' chưa đến thời gian áp dụng");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new RuntimeException("Mã giảm giá '" + voucher.getCode() + "' đã hết hạn sử dụng");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Mã giảm giá '" + voucher.getCode() + "' đã hết lượt sử dụng");
        }

        if (voucher.getMinOrderValue() != null && subtotal.compareTo(voucher.getMinOrderValue()) < 0) {
            Locale localeVN = new Locale("vi", "VN");
            NumberFormat vnFormat = NumberFormat.getCurrencyInstance(localeVN);
            String minStr = vnFormat.format(voucher.getMinOrderValue());
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu " + minStr + " để áp dụng mã '" + voucher.getCode() + "'");
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else if (voucher.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = voucher.getDiscountValue().min(subtotal);
        }

        return discount.max(BigDecimal.ZERO);
    }

    @Transactional
    public BigDecimal consumeVoucher(String code, BigDecimal subtotal) {
        Voucher voucher = getVoucherEntityByCode(code);
        BigDecimal discount = validateAndCalculateDiscount(code, subtotal);

        voucher.setUsedCount((voucher.getUsedCount() != null ? voucher.getUsedCount() : 0) + 1);
        voucherRepository.save(voucher);

        return discount;
    }

    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request) {
        Voucher voucher = getVoucherEntityByCode(request.getCode());
        BigDecimal discount = validateAndCalculateDiscount(request.getCode(), request.getSubtotal());
        BigDecimal finalTotal = request.getSubtotal().subtract(discount).max(BigDecimal.ZERO);

        return ApplyVoucherResponse.builder()
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountAmount(discount)
                .finalTotal(finalTotal)
                .build();
    }

    public List<VoucherDto> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findByIsActiveTrue().stream()
                .filter(v -> (v.getStartDate() == null || !now.isBefore(v.getStartDate())) &&
                             (v.getEndDate() == null || !now.isAfter(v.getEndDate())) &&
                             (v.getUsageLimit() == null || v.getUsedCount() < v.getUsageLimit()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Admin CRUD
    public List<VoucherDto> getAllVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherDto createVoucher(VoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new RuntimeException("Mã giảm giá '" + code + "' đã tồn tại trên hệ thống!");
        }

        Voucher voucher = Voucher.builder()
                .code(code)
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 100)
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapToDto(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherDto updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá ID: " + id));

        String newCode = request.getCode().trim().toUpperCase();
        if (!voucher.getCode().equalsIgnoreCase(newCode) && voucherRepository.existsByCodeIgnoreCase(newCode)) {
            throw new RuntimeException("Mã giảm giá '" + newCode + "' đã tồn tại trên hệ thống!");
        }

        voucher.setCode(newCode);
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null) {
            voucher.setUsageLimit(request.getUsageLimit());
        }
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) {
            voucher.setIsActive(request.getIsActive());
        }

        return mapToDto(voucherRepository.save(voucher));
    }

    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá ID: " + id));
        voucherRepository.delete(voucher);
    }

    public VoucherDto mapToDto(Voucher voucher) {
        return VoucherDto.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .minOrderValue(voucher.getMinOrderValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .isActive(voucher.getIsActive())
                .build();
    }
}
