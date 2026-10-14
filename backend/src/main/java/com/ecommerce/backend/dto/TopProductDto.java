package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDto {
    private Long id;
    private String name;
    private String imageUrl;
    private String categoryName;
    private Long soldQuantity;
    private BigDecimal totalRevenue;
}
