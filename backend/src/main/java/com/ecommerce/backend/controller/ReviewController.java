package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.ReviewDto;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Review", description = "Đánh giá và nhận xét sản phẩm")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{slug}/reviews")
    @Operation(summary = "Lấy danh sách đánh giá của sản phẩm theo slug")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getReviews(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByProductSlug(slug)));
    }

    @PostMapping("/{slug}/reviews")
    @Operation(summary = "Gửi đánh giá nhận xét cho sản phẩm")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @PathVariable String slug,
            @Valid @RequestBody ReviewDto dto,
            @AuthenticationPrincipal User user
    ) {
        ReviewDto created = reviewService.addReview(slug, dto, user);
        return ResponseEntity.ok(ApiResponse.ok("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!", created));
    }
}
