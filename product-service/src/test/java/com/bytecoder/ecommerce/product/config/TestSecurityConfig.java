package com.bytecoder.ecommerce.product.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@TestConfiguration
@Profile("test")
public class TestSecurityConfig {

    @Bean
    @Primary
    @Order(Integer.MIN_VALUE)  // Ensure this security filter runs first
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        // Add a security matcher for all requests to ensure this doesn't conflict with other configs
        return http
                .securityMatcher("/**") // This ensures it matches all requests but doesn't conflict
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll()
                )
                .build();
    }
}