package com.bytecoder.ecommerce.cart.repository;

import com.bytecoder.ecommerce.cart.config.CartConfig;
import com.bytecoder.ecommerce.cart.model.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
public class CartRepository {

    @Autowired
    private RedisTemplate<String, Cart> redisTemplate;
    
    @Autowired
    private CartConfig cartConfig;

    public Cart findByUserId(String userId) {
        return redisTemplate.opsForValue().get("cart:" + userId);
    }

    public void save(String userId, Cart cart) {
        String key = "cart:" + userId;
        long ttl = cartConfig.getTtl();
        redisTemplate.opsForValue().set(key, cart, ttl, TimeUnit.SECONDS);
    }

    public void delete(String userId) {
        redisTemplate.delete("cart:" + userId);
    }
    
    /**
     * Extend the TTL of an existing cart when it's accessed
     */
    public void extendTtl(String userId) {
        String key = "cart:" + userId;
        long ttl = cartConfig.getTtl();
        redisTemplate.expire(key, ttl, TimeUnit.SECONDS);
    }
}
