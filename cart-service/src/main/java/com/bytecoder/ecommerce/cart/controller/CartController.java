package com.bytecoder.ecommerce.cart.controller;

import com.bytecoder.ecommerce.cart.model.Cart;
import com.bytecoder.ecommerce.cart.model.CartItem;
import com.bytecoder.ecommerce.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.MDC;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@Tag(name = "Cart Management", description = "Operations related to the shopping cart")
@RestController
@RequestMapping("/api/v1/cart")
@Slf4j
public class CartController {

    @Autowired
    private CartService cartService;

    @Operation(summary = "Get Cart", description = "Fetches the shopping cart for a specific user")
    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        setRequestContext();
        log.info("Fetching cart for userId: {}", userId);

        Cart cart = cartService.getCart(userId);
        log.info("Retrieved cart with {} items for userId: {}", cart.getItems().size(), userId);

        return ResponseEntity.ok(cart);
    }

    @Operation(summary = "Add Item", description = "Adds an item to the shopping cart for a specific user")
    @PostMapping("/{userId}")
    public ResponseEntity<Void> addItem(@PathVariable String userId, @RequestBody CartItem item) {
        setRequestContext();
        log.info("Adding item to cart for userId: {}. Item: {}", userId, item);

        cartService.addItem(userId, item);
        log.info("Successfully added item to cart for userId: {}", userId);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove Item", description = "Removes an item from the shopping cart for a specific user")
    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeItem(@PathVariable String userId, @PathVariable String productId) {
        setRequestContext();
        log.info("Removing item with productId: {} from cart for userId: {}", productId, userId);

        cartService.removeItem(userId, productId);
        log.info("Successfully removed item with productId: {} from cart for userId: {}", productId, userId);

        return ResponseEntity.noContent().build();
    }

    /**
     * Sets up unique request identifiers for tracing in logs
     */
    private void setRequestContext() {
        // Generate a unique request ID if not already present
        if (MDC.get("requestId") == null) {
            MDC.put("requestId", UUID.randomUUID().toString());
        }
    }
}
