package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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

    private Map<String, Long> ordersByStatus;
    private List<TopProductDto> topSellingProducts;
    private List<MonthlyRevenueDto> monthlyRevenues;
}
