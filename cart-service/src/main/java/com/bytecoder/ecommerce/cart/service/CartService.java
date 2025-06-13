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
        return cartRepository.findByUserId(userId);
    }

    public void addItem(String userId, CartItem item) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
        }
        cart.getItems().put(item.getProductId(), item);
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
}
