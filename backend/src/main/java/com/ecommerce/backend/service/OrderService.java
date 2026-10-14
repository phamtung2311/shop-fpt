package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.DashboardStatsDto;
import com.ecommerce.backend.dto.OrderDto;
import com.ecommerce.backend.dto.OrderItemDto;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto createOrder(OrderRequest request, String userEmail) {
        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        String orderCode = "FPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.ItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Sản phẩm " + product.getName() + " không đủ số lượng tồn kho!");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getSalePrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productThumbnail(product.getThumbnail())
                    .price(product.getSalePrice())
                    .quantity(itemReq.getQuantity())
                    .build();

            items.add(orderItem);
        }

        order.setTotalAmount(total);
        order.setItems(items);

        Order savedOrder = orderRepository.save(order);
        return mapToDto(savedOrder);
    }

    public OrderDto getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + orderCode));
        return mapToDto(order);
    }

    public List<OrderDto> getOrdersByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng ID: " + orderId));
        order.setOrderStatus(status);
        if (status == OrderStatus.COMPLETED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        return mapToDto(orderRepository.save(order));
    }

    public DashboardStatsDto getDashboardStats() {
        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countPendingOrders();
        Long totalProducts = productRepository.count();
        Long totalUsers = userRepository.count();

        return DashboardStatsDto.builder()
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .pendingOrders(pendingOrders != null ? pendingOrders : 0L)
                .totalProducts(totalProducts != null ? totalProducts : 0L)
                .totalUsers(totalUsers != null ? totalUsers : 0L)
                .build();
    }

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .productThumbnail(item.getProductThumbnail())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
