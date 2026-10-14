package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.CancelOrderRequest;
import com.ecommerce.backend.dto.OrderDto;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Tạo và tra cứu đơn hàng")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới (Hỗ trợ cả khách vãng lai và thành viên)")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal User user
    ) {
        String email = user != null ? user.getEmail() : null;
        OrderDto order = orderService.createOrder(request, email);
        return ResponseEntity.ok(ApiResponse.ok("Đặt hàng thành công! Cảm ơn quý khách.", order));
    }

    @GetMapping("/{orderCode}")
    @Operation(summary = "Tra cứu chi tiết đơn hàng theo mã đơn (FPT-XXXX)")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByCode(orderCode)));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Lấy danh sách đơn hàng của khách hàng đang đăng nhập")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để xem lịch sử"));
        }
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrdersByUser(user.getEmail())));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Khách hàng hủy đơn hàng (khi đơn còn ở trạng thái PENDING)")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest request,
            @AuthenticationPrincipal User user,
            Authentication authentication
    ) {
        String email = null;
        if (user != null) {
            email = user.getEmail();
        } else if (authentication != null && authentication.isAuthenticated()) {
            email = authentication.getName();
        }

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để thực hiện hủy đơn hàng"));
        }

        String cancelReason = request != null ? request.getCancelReason() : null;
        OrderDto cancelled = orderService.cancelMyOrder(id, email, cancelReason);
        return ResponseEntity.ok(ApiResponse.ok("Hủy đơn hàng thành công!", cancelled));
    }

    @PostMapping("/{id}/confirm-payment")
    @Operation(summary = "Xác nhận thanh toán trực tuyến thành công (VNPAY / MOMO)")
    public ResponseEntity<ApiResponse<OrderDto>> confirmPayment(@PathVariable Long id) {
        OrderDto order = orderService.confirmOnlinePayment(id);
        return ResponseEntity.ok(ApiResponse.ok("Xác nhận thanh toán thành công!", order));
    }
}
