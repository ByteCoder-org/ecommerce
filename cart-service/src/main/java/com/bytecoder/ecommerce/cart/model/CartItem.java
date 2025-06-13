package com.bytecoder.ecommerce.cart.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CartItem {
    private String productId;
    private int quantity;
    private LocalDateTime addedAt;
}
