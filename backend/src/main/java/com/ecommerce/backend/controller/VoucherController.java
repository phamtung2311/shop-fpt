package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.ApplyVoucherRequest;
import com.ecommerce.backend.dto.ApplyVoucherResponse;
import com.ecommerce.backend.dto.VoucherDto;
import com.ecommerce.backend.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Voucher", description = "Kiểm tra và áp dụng mã giảm giá")
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping("/apply")
    @Operation(summary = "Kiểm tra và tính số tiền giảm của mã voucher")
    public ResponseEntity<ApiResponse<ApplyVoucherResponse>> applyVoucher(@Valid @RequestBody ApplyVoucherRequest request) {
        ApplyVoucherResponse response = voucherService.applyVoucher(request);
        return ResponseEntity.ok(ApiResponse.ok("Áp dụng mã giảm giá thành công!", response));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách các mã giảm giá đang hoạt động và còn hạn")
    public ResponseEntity<ApiResponse<List<VoucherDto>>> getActiveVouchers() {
        return ResponseEntity.ok(ApiResponse.ok(voucherService.getActiveVouchers()));
    }
}
