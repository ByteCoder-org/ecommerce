package com.bytecoder.ecommerce.cart.repository;

import com.bytecoder.ecommerce.cart.model.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CartRepository {

    @Autowired
    private RedisTemplate<String, Cart> redisTemplate;

    public Cart findByUserId(String userId) {
        return redisTemplate.opsForValue().get("cart:" + userId);
    }

    public void save(String userId, Cart cart) {
        redisTemplate.opsForValue().set("cart:" + userId, cart);
    }

    public void delete(String userId) {
        redisTemplate.delete("cart:" + userId);
    }
}
