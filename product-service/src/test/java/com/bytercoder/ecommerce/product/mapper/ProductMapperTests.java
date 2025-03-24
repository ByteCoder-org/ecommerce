package com.bytercoder.ecommerce.product.mapper;

import com.bytercoder.ecommerce.product.dto.ProductRequest;
import com.bytercoder.ecommerce.product.dto.ProductResponse;
import com.bytercoder.ecommerce.product.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ProductMapperTests {

    private ProductMapper productMapper;
    private Product product;
    private ProductRequest productRequest;

    @BeforeEach
    void setUp() {
        productMapper = new ProductMapper();

        ZonedDateTime now = ZonedDateTime.now();

        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(new BigDecimal("99.99"))
                .category("Test Category")
                .inventoryCount(10)
                .imageUrl("http://example.com/test.jpg")
                .createdAt(now)
                .updatedAt(now)
                .build();

        productRequest = ProductRequest.builder()
                .name("New Product")
                .description("New Description")
                .price(new BigDecimal("149.99"))
                .category("New Category")
                .inventoryCount(20)
                .imageUrl("http://example.com/new.jpg")
                .build();
    }

    @Test
    @DisplayName("Should map Product entity to ProductResponse DTO")
    void shouldMapProductEntityToProductResponseDto() {
        // when
        ProductResponse response = productMapper.mapToProductResponse(product);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(product.getId());
        assertThat(response.getName()).isEqualTo(product.getName());
        assertThat(response.getDescription()).isEqualTo(product.getDescription());
        assertThat(response.getPrice()).isEqualTo(product.getPrice());
        assertThat(response.getCategory()).isEqualTo(product.getCategory());
        assertThat(response.getInventoryCount()).isEqualTo(product.getInventoryCount());
        assertThat(response.getImageUrl()).isEqualTo(product.getImageUrl());
        assertThat(response.getCreatedAt()).isEqualTo(product.getCreatedAt());
        assertThat(response.getUpdatedAt()).isEqualTo(product.getUpdatedAt());
    }

    @Test
    @DisplayName("Should map ProductRequest DTO to Product entity")
    void shouldMapProductRequestDtoToProductEntity() {
        // when
        Product mappedProduct = productMapper.mapToEntity(productRequest);

        // then
        assertThat(mappedProduct).isNotNull();
        assertThat(mappedProduct.getId()).isNull(); // ID should not be set
        assertThat(mappedProduct.getName()).isEqualTo(productRequest.getName());
        assertThat(mappedProduct.getDescription()).isEqualTo(productRequest.getDescription());
        assertThat(mappedProduct.getPrice()).isEqualTo(productRequest.getPrice());
        assertThat(mappedProduct.getCategory()).isEqualTo(productRequest.getCategory());
        assertThat(mappedProduct.getInventoryCount()).isEqualTo(productRequest.getInventoryCount());
        assertThat(mappedProduct.getImageUrl()).isEqualTo(productRequest.getImageUrl());
        // Timestamps are not set at this point
        assertThat(mappedProduct.getCreatedAt()).isNull();
        assertThat(mappedProduct.getUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("Should update Product entity from ProductRequest DTO")
    void shouldUpdateProductEntityFromProductRequestDto() {
        // given
        Product existingProduct = Product.builder()
                .id(1L)
                .name("Existing Product")
                .description("Existing Description")
                .price(new BigDecimal("99.99"))
                .category("Existing Category")
                .inventoryCount(10)
                .imageUrl("http://example.com/existing.jpg")
                .build();

        // when
        productMapper.updateEntityFromRequest(existingProduct, productRequest);

        // then
        assertThat(existingProduct.getId()).isEqualTo(1L); // ID should not change
        assertThat(existingProduct.getName()).isEqualTo(productRequest.getName());
        assertThat(existingProduct.getDescription()).isEqualTo(productRequest.getDescription());
        assertThat(existingProduct.getPrice()).isEqualTo(productRequest.getPrice());
        assertThat(existingProduct.getCategory()).isEqualTo(productRequest.getCategory());
        assertThat(existingProduct.getInventoryCount()).isEqualTo(productRequest.getInventoryCount());
        assertThat(existingProduct.getImageUrl()).isEqualTo(productRequest.getImageUrl());
    }
}