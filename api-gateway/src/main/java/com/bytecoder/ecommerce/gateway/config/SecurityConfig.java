package com.bytecoder.ecommerce.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        // Allow OPTIONS requests for CORS pre-flight
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Allow Keycloak paths without authentication
                        .pathMatchers("/auth/**").permitAll()
                        .pathMatchers("/auth/realms/ecommerce/protocol/openid-connect/**").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        // Allow public GET endpoints for products without authentication
                        .pathMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        // Require authentication for modification operations
                        .pathMatchers(HttpMethod.POST, "/api/v1/products/**").authenticated()
                        .pathMatchers(HttpMethod.PUT, "/api/v1/products/**").authenticated()
                        .pathMatchers(HttpMethod.DELETE, "/api/v1/products/**").authenticated()
                        .pathMatchers(HttpMethod.PATCH, "/api/v1/products/**").authenticated()
                        // Fallback rule
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .build();
    }
}