package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.OrderStatus;
import com.ecommerce.backend.entity.PaymentMethod;
import com.ecommerce.backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderCode;
    private Long userId;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private String note;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
}
