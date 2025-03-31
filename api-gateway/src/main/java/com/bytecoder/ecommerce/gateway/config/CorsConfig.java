package com.bytecoder.ecommerce.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Set allowed origins - use a more permissive setting for development
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "null"));

        // Configure allowed methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Configure allowed headers - include all common headers
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With",
                "Origin", "Accept", "Access-Control-Request-Method", "Access-Control-Request-Headers"));

        // Expose headers that clients are allowed to access
        config.setExposedHeaders(Arrays.asList("Authorization", "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"));

        // Allow credentials like cookies
        config.setAllowCredentials(true);

        // How long the browser should cache the CORS response (1 hour)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}