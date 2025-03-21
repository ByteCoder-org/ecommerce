package com.bytercoder.ecommerce.product.service;

import com.bytercoder.ecommerce.product.dto.ProductRequest;
import com.bytercoder.ecommerce.product.dto.ProductResponse;
import com.bytercoder.ecommerce.product.exception.ProductNotFoundException;
import com.bytercoder.ecommerce.product.model.Product;
import com.bytercoder.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTests {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product product1;
    private Product product2;
    private ProductRequest productRequest;

    @BeforeEach
    void setUp() {
        product1 = Product.builder()
                .id(1L)
                .name("Test Product 1")
                .description("Test Description 1")
                .price(new BigDecimal("99.99"))
                .category("Electronics")
                .inventoryCount(10)
                .imageUrl("http://example.com/image1.jpg")
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        product2 = Product.builder()
                .id(2L)
                .name("Test Product 2")
                .description("Test Description 2")
                .price(new BigDecimal("199.99"))
                .category("Home Appliances")
                .inventoryCount(5)
                .imageUrl("http://example.com/image2.jpg")
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        productRequest = ProductRequest.builder()
                .name("New Product")
                .description("New Description")
                .price(new BigDecimal("149.99"))
                .category("Clothing")
                .inventoryCount(20)
                .imageUrl("http://example.com/newimage.jpg")
                .build();
    }

    @Test
    @DisplayName("Should return all products when getAllProducts is called")
    void shouldReturnAllProductsWhenGetAllProductsIsCalled() {
        // given
        when(productRepository.findAll()).thenReturn(Arrays.asList(product1, product2));

        // when
        List<ProductResponse> result = productService.getAllProducts();

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(product1.getId());
        assertThat(result.get(1).getId()).isEqualTo(product2.getId());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no products exist")
    void shouldReturnEmptyListWhenNoProductsExist() {
        // given
        when(productRepository.findAll()).thenReturn(Collections.emptyList());

        // when
        List<ProductResponse> result = productService.getAllProducts();

        // then
        assertThat(result).isEmpty();
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return product when valid ID is provided")
    void shouldReturnProductWhenValidIdIsProvided() {
        // given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));

        // when
        ProductResponse result = productService.getProductById(1L);

        // then
        assertThat(result.getId()).isEqualTo(product1.getId());
        assertThat(result.getName()).isEqualTo(product1.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when product with given ID not found")
    void shouldThrowExceptionWhenProductWithGivenIdNotFound() {
        // given
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        // when & then
        assertThrows(ProductNotFoundException.class, () -> productService.getProductById(999L));
        verify(productRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should return products by category")
    void shouldReturnProductsByCategory() {
        // given
        when(productRepository.findByCategory("Electronics")).thenReturn(Collections.singletonList(product1));

        // when
        List<ProductResponse> result = productService.getProductsByCategory("Electronics");

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("Electronics");
        verify(productRepository, times(1)).findByCategory("Electronics");
    }

    @Test
    @DisplayName("Should return products containing search term in name")
    void shouldReturnProductsContainingSearchTermInName() {
        // given
        when(productRepository.findByNameContainingIgnoreCase("Test")).thenReturn(Arrays.asList(product1, product2));

        // when
        List<ProductResponse> result = productService.searchProductsByName("Test");

        // then
        assertThat(result).hasSize(2);
        verify(productRepository, times(1)).findByNameContainingIgnoreCase("Test");
    }

    @Test
    @DisplayName("Should return products with inventory greater than zero")
    void shouldReturnProductsWithInventoryGreaterThanZero() {
        // given
        when(productRepository.findByInventoryCountGreaterThan(0)).thenReturn(Arrays.asList(product1, product2));

        // when
        List<ProductResponse> result = productService.getAvailableProducts();

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getInventoryCount()).isGreaterThan(0);
        assertThat(result.get(1).getInventoryCount()).isGreaterThan(0);
        verify(productRepository, times(1)).findByInventoryCountGreaterThan(0);
    }

    @Test
    @DisplayName("Should create product successfully")
    void shouldCreateProductSuccessfully() {
        // given
        Product newProduct = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .category(productRequest.getCategory())
                .inventoryCount(productRequest.getInventoryCount())
                .imageUrl(productRequest.getImageUrl())
                .build();

        Product savedProduct = Product.builder()
                .id(3L)
                .name(newProduct.getName())
                .description(newProduct.getDescription())
                .price(newProduct.getPrice())
                .category(newProduct.getCategory())
                .inventoryCount(newProduct.getInventoryCount())
                .imageUrl(newProduct.getImageUrl())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // when
        ProductResponse result = productService.createProduct(productRequest);

        // then
        assertThat(result.getId()).isEqualTo(savedProduct.getId());
        assertThat(result.getName()).isEqualTo(productRequest.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should update product successfully")
    void shouldUpdateProductSuccessfully() {
        // given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        ProductResponse result = productService.updateProduct(1L, productRequest);

        // then
        assertThat(result.getId()).isEqualTo(product1.getId());
        assertThat(result.getName()).isEqualTo(productRequest.getName());
        assertThat(result.getDescription()).isEqualTo(productRequest.getDescription());
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent product")
    void shouldThrowExceptionWhenUpdatingNonExistentProduct() {
        // given
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        // when & then
        assertThrows(ProductNotFoundException.class, () -> productService.updateProduct(999L, productRequest));
        verify(productRepository, times(1)).findById(999L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should delete product successfully")
    void shouldDeleteProductSuccessfully() {
        // given
        when(productRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1L);

        // when
        productService.deleteProduct(1L);

        // then
        verify(productRepository, times(1)).existsById(1L);
        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent product")
    void shouldThrowExceptionWhenDeletingNonExistentProduct() {
        // given
        when(productRepository.existsById(anyLong())).thenReturn(false);

        // when & then
        assertThrows(ProductNotFoundException.class, () -> productService.deleteProduct(999L));
        verify(productRepository, times(1)).existsById(999L);
        verify(productRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should update product inventory successfully")
    void shouldUpdateProductInventorySuccessfully() {
        // given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            assertThat(p.getInventoryCount()).isEqualTo(15);
            return p;
        });

        // when
        ProductResponse result = productService.updateProductInventory(1L, 15);

        // then
        assertThat(result.getId()).isEqualTo(product1.getId());
        assertThat(result.getInventoryCount()).isEqualTo(15);
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }
}