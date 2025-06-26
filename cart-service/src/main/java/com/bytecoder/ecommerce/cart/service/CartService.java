package com.bytecoder.ecommerce.cart.service;

import com.bytecoder.ecommerce.cart.model.Cart;
import com.bytecoder.ecommerce.cart.model.CartItem;
import com.bytecoder.ecommerce.cart.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public Cart getCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart != null) {
            // Extend TTL when cart is accessed
            cartRepository.extendTtl(userId);
        }
        return cart;
    }

    public void addItem(String userId, CartItem item) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
        }
        
        // Check if item already exists in cart
        CartItem existingItem = cart.getItems().get(item.getProductId());
        if (existingItem != null) {
            // Item exists, add to existing quantity
            existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
            existingItem.setAddedAt(LocalDateTime.now()); // Update timestamp
        } else {
            // New item, add to cart
            item.setAddedAt(LocalDateTime.now());
            cart.getItems().put(item.getProductId(), item);
        }
        
        cart.setLastUpdated(LocalDateTime.now());
        cartRepository.save(userId, cart);
    }

    public void removeItem(String userId, String productId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart != null) {
            cart.getItems().remove(productId);
            cart.setLastUpdated(LocalDateTime.now());
            cartRepository.save(userId, cart);
        }
    }

    public void updateItemQuantity(String userId, String productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart != null) {
            CartItem item = cart.getItems().get(productId);
            if (item != null) {
                if (quantity <= 0) {
                    // Remove item if quantity is 0 or negative
                    cart.getItems().remove(productId);
                } else {
                    // Update quantity
                    item.setQuantity(quantity);
                    item.setAddedAt(LocalDateTime.now()); // Update timestamp
                }
                cart.setLastUpdated(LocalDateTime.now());
                cartRepository.save(userId, cart);
            }
        }
    }
}
