package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import com.ecommerce.backend.dto.ProductDto;
import com.ecommerce.backend.entity.ComponentType;
import com.ecommerce.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Tìm kiếm, lọc và xem chi tiết sản phẩm")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Lọc và tìm kiếm sản phẩm phân trang")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) ComponentType componentType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<ProductDto> result = productService.getProducts(
                categoryId, categorySlug, brand, componentType, minPrice, maxPrice, keyword, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Xem chi tiết sản phẩm theo slug")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductBySlug(slug)));
    }

    @GetMapping("/featured")
    @Operation(summary = "Lấy danh sách sản phẩm nổi bật")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeaturedProducts()));
    }

    @GetMapping("/best-sellers")
    @Operation(summary = "Lấy danh sách sản phẩm bán chạy nhất")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getBestSellers() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getBestSellers()));
    }

    @GetMapping("/components/{type}")
    @Operation(summary = "Lấy danh sách linh kiện theo slot PC Builder (CPU, VGA, RAM...)")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getComponentsByType(@PathVariable ComponentType type) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getComponentsByType(type)));
    }
}
