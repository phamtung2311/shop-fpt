package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;

    @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
    private String shippingAddress;

    private String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @NotEmpty(message = "Giỏ hàng không có sản phẩm nào")
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        @NotNull(message = "ID sản phẩm không được để trống")
        private Long productId;

        @NotNull(message = "Số lượng không được để trống")
        private Integer quantity;
    }
}
