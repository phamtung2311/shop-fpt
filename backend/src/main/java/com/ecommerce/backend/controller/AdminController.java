package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entity.OrderStatus;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.CategoryService;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Quản trị hệ thống: Sản phẩm, Đơn hàng, Danh mục và Thống kê")
public class AdminController {

    private final OrderService orderService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final com.ecommerce.backend.service.UserService userService;
    private final com.ecommerce.backend.service.VoucherService voucherService;

    @GetMapping("/stats")
    @Operation(summary = "Lấy số liệu thống kê tổng quan doanh thu, đơn hàng")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getDashboardStats()));
    }

    // Orders Management
    @GetMapping("/orders")
    @Operation(summary = "Lấy toàn bộ danh sách đơn hàng")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders()));
    }

    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        OrderDto order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái đơn hàng thành công!", order));
    }

    // Products Management
    @PostMapping("/products")
    @Operation(summary = "Thêm sản phẩm mới")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductDto dto) {
        ProductDto created = productService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.ok("Thêm sản phẩm thành công!", created));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Cập nhật sản phẩm")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        ProductDto updated = productService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sản phẩm thành công!", updated));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Xóa sản phẩm")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa sản phẩm thành công!", null));
    }

    // Categories Management
    @PostMapping("/categories")
    @Operation(summary = "Thêm danh mục mới")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryDto dto) {
        CategoryDto created = categoryService.createCategory(dto);
        return ResponseEntity.ok(ApiResponse.ok("Thêm danh mục thành công!", created));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Cập nhật danh mục")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto dto) {
        CategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật danh mục thành công!", updated));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Xóa danh mục")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa danh mục thành công!", null));
    }

    // Users Management
    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách tất cả người dùng trong hệ thống")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Đổi vai trò người dùng (ROLE_CUSTOMER hoặc ROLE_ADMIN)")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserRole(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateUserRoleRequest body,
            @RequestParam(required = false) String role
    ) {
        String targetRole = body != null && body.getRole() != null ? body.getRole() : role;
        UserProfileDto updated = userService.updateUserRole(id, targetRole);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật vai trò người dùng thành công!", updated));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Khóa hoặc mở khóa tài khoản người dùng")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentAdmin,
            Authentication authentication
    ) {
        String adminEmail = currentAdmin != null ? currentAdmin.getEmail() : (authentication != null ? authentication.getName() : null);
        UserProfileDto updated = userService.toggleUserStatus(id, adminEmail);
        String msg = Boolean.TRUE.equals(updated.getIsActive()) ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản thành công!";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }

    // Vouchers Management
    @GetMapping("/vouchers")
    @Operation(summary = "Lấy toàn bộ danh sách mã giảm giá")
    public ResponseEntity<ApiResponse<List<VoucherDto>>> getAllVouchers() {
        return ResponseEntity.ok(ApiResponse.ok(voucherService.getAllVouchers()));
    }

    @PostMapping("/vouchers")
    @Operation(summary = "Tạo mã giảm giá mới")
    public ResponseEntity<ApiResponse<VoucherDto>> createVoucher(@Valid @RequestBody VoucherRequest request) {
        VoucherDto created = voucherService.createVoucher(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo mã giảm giá thành công!", created));
    }

    @PutMapping("/vouchers/{id}")
    @Operation(summary = "Cập nhật mã giảm giá")
    public ResponseEntity<ApiResponse<VoucherDto>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request
    ) {
        VoucherDto updated = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật mã giảm giá thành công!", updated));
    }

    @DeleteMapping("/vouchers/{id}")
    @Operation(summary = "Xóa mã giảm giá")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa mã giảm giá thành công!", null));
    }
}
