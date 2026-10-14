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
public class DashboardStatsDto {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long pendingOrders;
    private Long totalProducts;
    private Long totalUsers;
}
