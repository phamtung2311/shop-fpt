package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.ComponentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String slug;

    private String brand;

    @NotNull(message = "Giá gốc không được để trống")
    @Positive(message = "Giá gốc phải lớn hơn 0")
    private BigDecimal originalPrice;

    @NotNull(message = "Giá khuyến mãi không được để trống")
    @Positive(message = "Giá khuyến mãi phải lớn hơn 0")
    private BigDecimal salePrice;

    private Integer stockQuantity;
    private String thumbnail;
    @Builder.Default
    private java.util.List<String> images = new java.util.ArrayList<>();
    private String description;

    // Specs
    private String cpu;
    private String ram;
    private String storage;
    private String vga;
    private String screen;
    private String battery;
    private Integer warrantyMonths;

    // Component slot for PC Builder
    private ComponentType componentType;

    private boolean featured;
    private boolean bestSeller;
    private Double rating;
    private Integer reviewCount;

    private Long categoryId;
    private String categoryName;

    private LocalDateTime createdAt;
}
