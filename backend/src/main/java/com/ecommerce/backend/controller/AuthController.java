package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.AuthRequest;
import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng ký, Đăng nhập và Thông tin tài khoản")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản khách hàng mới")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký tài khoản thành công!", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập và nhận JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công!", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại")
    public ResponseEntity<ApiResponse<AuthResponse>> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Chưa đăng nhập"));
        }
        AuthResponse response = AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
