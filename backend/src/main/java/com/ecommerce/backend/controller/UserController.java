package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.ChangePasswordRequest;
import com.ecommerce.backend.dto.UpdateProfileRequest;
import com.ecommerce.backend.dto.UserProfileDto;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "Quản lý thông tin tài khoản và đổi mật khẩu")
public class UserController {

    private final UserService userService;

    private String getEmail(User user, Authentication authentication) {
        if (user != null) {
            return user.getEmail();
        }
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }

    @GetMapping("/profile")
    @Operation(summary = "Lấy thông tin tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(
            @AuthenticationPrincipal User user,
            Authentication authentication
    ) {
        String email = getEmail(user, authentication);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để xem thông tin tài khoản"));
        }
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(email)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ)")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User user,
            Authentication authentication
    ) {
        String email = getEmail(user, authentication);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để cập nhật thông tin"));
        }
        UserProfileDto updated = userService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin cá nhân thành công!", updated));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu người dùng đang đăng nhập")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user,
            Authentication authentication
    ) {
        String email = getEmail(user, authentication);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để đổi mật khẩu"));
        }
        userService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công!", "OK"));
    }
}
