package com.bytecoder.ecommerce.product.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter to log HTTP request and response details
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Wrap request and response for logging
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(httpRequest);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(httpResponse);
        
        // Setup MDC with request info for logging
        setupLoggingContext(requestWrapper);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Log request details
            logRequest(requestWrapper);
            
            // Execute the request
            chain.doFilter(requestWrapper, responseWrapper);
            
            // Log response details
            logResponse(responseWrapper, System.currentTimeMillis() - startTime);
        } finally {
            // Copy content back to the original response
            responseWrapper.copyBodyToResponse();
            
            // Clear logging context
            MDC.clear();
        }
    }
    
    private void setupLoggingContext(HttpServletRequest request) {
        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);
        
        // Add useful context information
        MDC.put("method", request.getMethod());
        MDC.put("uri", request.getRequestURI());
        MDC.put("ip", request.getRemoteAddr());
        
        // Add user info if available
        String user = request.getUserPrincipal() != null ? 
                request.getUserPrincipal().getName() : "anonymous";
        MDC.put("user", user);
    }
    
    private void logRequest(ContentCachingRequestWrapper request) {
        log.info("Request: {} {} (from IP: {})",
                request.getMethod(),
                request.getRequestURI(),
                request.getRemoteAddr());
        
        // For debugging, optionally log headers and body
        if (log.isDebugEnabled()) {
            request.getHeaderNames().asIterator().forEachRemaining(headerName ->
                    log.debug("Request Header: {} = {}", headerName, request.getHeader(headerName)));
        }
    }
    
    private void logResponse(ContentCachingResponseWrapper response, long timeElapsed) {
        log.info("Response: status={}, time={}ms", 
                response.getStatus(), 
                timeElapsed);
    }
}