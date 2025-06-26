package com.bytecoder.ecommerce.cart.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "cart.expiration")
@Data
public class CartConfig {
    
    /**
     * Default TTL for cart expiration in seconds (7 days)
     */
    private long ttl = 604800;
}
