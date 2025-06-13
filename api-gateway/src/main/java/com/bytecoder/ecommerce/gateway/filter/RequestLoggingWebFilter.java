package com.bytecoder.ecommerce.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * WebFlux-compatible filter to log HTTP request and response details.
 */
@Component
@Slf4j
public class RequestLoggingWebFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        // Log request details
        logRequest(exchange);

        long startTime = System.currentTimeMillis();

        return chain.filter(exchange)
                .doFinally(signalType -> {
                    // Log response details
                    logResponse(exchange, System.currentTimeMillis() - startTime);
                });
    }

    private void logRequest(ServerWebExchange exchange) {
        String method = exchange.getRequest().getMethod() != null ? exchange.getRequest().getMethod().name() : "UNKNOWN";
        String uri = exchange.getRequest().getURI().toString();
        String headers = exchange.getRequest().getHeaders().toString();

        log.info("Request: method={}, uri={}, headers={}", method, uri, headers);
    }

    private void logResponse(ServerWebExchange exchange, long timeElapsed) {
        int statusCode = exchange.getResponse().getStatusCode() != null ? exchange.getResponse().getStatusCode().value() : 0;
        String headers = exchange.getResponse().getHeaders().toString();

        log.info("Response: status={}, time={}ms, headers={}", statusCode, timeElapsed, headers);
    }
}
