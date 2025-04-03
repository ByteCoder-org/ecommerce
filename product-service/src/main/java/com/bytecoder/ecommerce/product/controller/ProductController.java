package com.bytecoder.ecommerce.product.controller;

import com.bytecoder.ecommerce.product.dto.ProductRequest;
import com.bytecoder.ecommerce.product.dto.ProductResponse;
import com.bytecoder.ecommerce.product.service.IProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product API", description = "Operations related to products")
@Slf4j
public class ProductController {

    private final IProductService productService;

    // Adding explicit path mapping for root products endpoint
    @GetMapping(path = {"", "/"})
    @Operation(summary = "Get all products with pagination")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        setRequestContext();
        log.info("Fetching all products with page={}, size={}, sortBy={}, direction={}", page, size, sortBy, direction);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ProductResponse> products = productService.getAllProducts(pageable);

        log.info("Retrieved {} products out of {} total", products.getNumberOfElements(), products.getTotalElements());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        setRequestContext();
        log.info("Fetching product with id: {}", id);

        ProductResponse product = productService.getProductById(id);
        log.info("Retrieved product: {}", product.getName());
        return ResponseEntity.ok(product);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category with pagination")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        setRequestContext();
        log.info("Fetching products by category: {} with page={}, size={}", category, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getProductsByCategory(category, pageable);

        log.info("Retrieved {} products of category '{}' out of {} total",
                products.getNumberOfElements(), category, products.getTotalElements());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name with pagination")
    public ResponseEntity<Page<ProductResponse>> searchProductsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        setRequestContext();
        log.info("Searching products by name: '{}' with page={}, size={}", name, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.searchProductsByName(name, pageable);

        log.info("Search for '{}' returned {} products out of {} total",
                name, products.getNumberOfElements(), products.getTotalElements());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/available")
    @Operation(summary = "Get products with inventory > 0 with pagination")
    public ResponseEntity<Page<ProductResponse>> getAvailableProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        setRequestContext();
        log.info("Fetching available products with page={}, size={}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getAvailableProducts(pageable);

        log.info("Retrieved {} available products out of {} total",
                products.getNumberOfElements(), products.getTotalElements());
        return ResponseEntity.ok(products);
    }

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        setRequestContext();
        log.info("Creating new product: {}", productRequest.getName());

        ProductResponse created = productService.createProduct(productRequest);
        log.info("Successfully created product with ID: {}", created.getId());

        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest productRequest) {
        setRequestContext();
        log.info("Updating product with ID: {}", id);

        ProductResponse updated = productService.updateProduct(id, productRequest);
        log.info("Successfully updated product: {}", updated.getName());

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        setRequestContext();
        log.info("Deleting product with ID: {}", id);

        productService.deleteProduct(id);
        log.info("Successfully deleted product with ID: {}", id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inventory")
    @Operation(summary = "Update product inventory")
    public ResponseEntity<ProductResponse> updateProductInventory(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        setRequestContext();
        log.info("Updating inventory for product ID: {} to quantity: {}", id, quantity);

        ProductResponse updated = productService.updateProductInventory(id, quantity);
        log.info("Successfully updated inventory for product: {}", updated.getName());

        return ResponseEntity.ok(updated);
    }

    /**
     * Sets up unique request identifiers for tracing in logs
     */
    private void setRequestContext() {
        // Generate a unique request ID if not already present
        if (MDC.get("requestId") == null) {
            MDC.put("requestId", UUID.randomUUID().toString());
        }
    }
}