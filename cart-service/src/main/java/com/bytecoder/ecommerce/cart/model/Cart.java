package com.bytecoder.ecommerce.cart.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class Cart {
    private String userId;
    private Map<String, CartItem> items = new HashMap<>();
    private LocalDateTime lastUpdated;
}
