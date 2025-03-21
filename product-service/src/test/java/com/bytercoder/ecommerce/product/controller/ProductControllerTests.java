package com.bytercoder.ecommerce.product.controller;

import com.bytercoder.ecommerce.product.dto.ProductRequest;
import com.bytercoder.ecommerce.product.dto.ProductResponse;
import com.bytercoder.ecommerce.product.exception.ProductNotFoundException;
import com.bytercoder.ecommerce.product.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
public class ProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("Should return all products")
    void shouldReturnAllProducts() throws Exception {
        // given
        ProductResponse product1 = ProductResponse.builder()
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

        ProductResponse product2 = ProductResponse.builder()
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

        List<ProductResponse> productList = Arrays.asList(product1, product2);

        // Create a Page of ProductResponse objects
        Page<ProductResponse> productPage = new PageImpl<>(productList);

        // Mock the paginated method instead of the list method
        when(productService.getAllProducts(any(Pageable.class))).thenReturn(productPage);

        // when & then
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].name", is("Test Product 1")))
                .andExpect(jsonPath("$.content[1].id", is(2)))
                .andExpect(jsonPath("$.content[1].name", is("Test Product 2")))
                .andExpect(jsonPath("$.totalElements", is(2)));

        verify(productService, times(1)).getAllProducts(any(Pageable.class));
    }

    @Test
    @DisplayName("Should return product by ID")
    void shouldReturnProductById() throws Exception {
        // given
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(new BigDecimal("99.99"))
                .category("Electronics")
                .inventoryCount(10)
                .imageUrl("http://example.com/image.jpg")
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        when(productService.getProductById(1L)).thenReturn(product);

        // when & then
        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Product")))
                .andExpect(jsonPath("$.category", is("Electronics")));

        verify(productService, times(1)).getProductById(1L);
    }

    @Test
    @DisplayName("Should return 404 when product not found")
    void shouldReturn404WhenProductNotFound() throws Exception {
        // given
        when(productService.getProductById(anyLong())).thenThrow(new ProductNotFoundException("Product not found with id: 999"));

        // when & then
        mockMvc.perform(get("/api/v1/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", is("Product not found with id: 999")));

        verify(productService, times(1)).getProductById(999L);
    }

    @Test
    @DisplayName("Should return products by category")
    void shouldReturnProductsByCategory() throws Exception {
        // given
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(new BigDecimal("99.99"))
                .category("Electronics")
                .inventoryCount(10)
                .imageUrl("http://example.com/image.jpg")
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        List<ProductResponse> productList = Collections.singletonList(product);
        Page<ProductResponse> productPage = new PageImpl<>(productList);

        when(productService.getProductsByCategory(eq("Electronics"), any(Pageable.class))).thenReturn(productPage);

        // when & then
        mockMvc.perform(get("/api/v1/products/category/Electronics"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].category", is("Electronics")))
                .andExpect(jsonPath("$.totalElements", is(1)));

        verify(productService, times(1)).getProductsByCategory(eq("Electronics"), any(Pageable.class));
    }

    @Test
    @DisplayName("Should search products by name")
    void shouldSearchProductsByName() throws Exception {
        // given
        ProductResponse product1 = ProductResponse.builder()
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

        ProductResponse product2 = ProductResponse.builder()
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

        List<ProductResponse> productList = Arrays.asList(product1, product2);
        Page<ProductResponse> productPage = new PageImpl<>(productList);

        when(productService.searchProductsByName(eq("Test"), any(Pageable.class))).thenReturn(productPage);

        // when & then
        mockMvc.perform(get("/api/v1/products/search").param("name", "Test"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].name", containsString("Test")))
                .andExpect(jsonPath("$.content[1].name", containsString("Test")))
                .andExpect(jsonPath("$.totalElements", is(2)));

        verify(productService, times(1)).searchProductsByName(eq("Test"), any(Pageable.class));
    }

    @Test
    @DisplayName("Should return available products")
    void shouldReturnAvailableProducts() throws Exception {
        // given
        ProductResponse product1 = ProductResponse.builder()
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

        ProductResponse product2 = ProductResponse.builder()
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

        List<ProductResponse> productList = Arrays.asList(product1, product2);
        Page<ProductResponse> productPage = new PageImpl<>(productList);

        when(productService.getAvailableProducts(any(Pageable.class))).thenReturn(productPage);

        // when & then
        mockMvc.perform(get("/api/v1/products/available"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].inventoryCount", greaterThan(0)))
                .andExpect(jsonPath("$.content[1].inventoryCount", greaterThan(0)))
                .andExpect(jsonPath("$.totalElements", is(2)));

        verify(productService, times(1)).getAvailableProducts(any(Pageable.class));
    }

    @Test
    @DisplayName("Should create product successfully")
    void shouldCreateProductSuccessfully() throws Exception {
        // given
        ProductRequest productRequest = ProductRequest.builder()
                .name("New Product")
                .description("New Description")
                .price(new BigDecimal("149.99"))
                .category("Clothing")
                .inventoryCount(20)
                .imageUrl("http://example.com/newimage.jpg")
                .build();

        ProductResponse productResponse = ProductResponse.builder()
                .id(3L)
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .category(productRequest.getCategory())
                .inventoryCount(productRequest.getInventoryCount())
                .imageUrl(productRequest.getImageUrl())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        when(productService.createProduct(any(ProductRequest.class))).thenReturn(productResponse);

        // when & then
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(3)))
                .andExpect(jsonPath("$.name", is("New Product")))
                .andExpect(jsonPath("$.price", is(149.99)));

        verify(productService, times(1)).createProduct(any(ProductRequest.class));
    }

    @Test
    @DisplayName("Should return validation errors when creating product with invalid data")
    void shouldReturnValidationErrorsWhenCreatingProductWithInvalidData() throws Exception {
        // given
        ProductRequest invalidProductRequest = ProductRequest.builder()
                .name("")  // Empty name - should fail validation
                .description("Description")
                .price(new BigDecimal("-10"))  // Negative price - should fail validation
                .category("Category")
                .inventoryCount(-5)  // Negative inventory - should fail validation
                .imageUrl("http://example.com/image.jpg")
                .build();

        // when & then
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProductRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.price").exists())
                .andExpect(jsonPath("$.inventoryCount").exists());

        verify(productService, never()).createProduct(any(ProductRequest.class));
    }

    @Test
    @DisplayName("Should update product successfully")
    void shouldUpdateProductSuccessfully() throws Exception {
        // given
        ProductRequest productRequest = ProductRequest.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(new BigDecimal("299.99"))
                .category("Updated Category")
                .inventoryCount(15)
                .imageUrl("http://example.com/updatedimage.jpg")
                .build();

        ProductResponse productResponse = ProductResponse.builder()
                .id(1L)
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .category(productRequest.getCategory())
                .inventoryCount(productRequest.getInventoryCount())
                .imageUrl(productRequest.getImageUrl())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        when(productService.updateProduct(eq(1L), any(ProductRequest.class))).thenReturn(productResponse);

        // when & then
        mockMvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Updated Product")))
                .andExpect(jsonPath("$.price", is(299.99)));

        verify(productService, times(1)).updateProduct(eq(1L), any(ProductRequest.class));
    }

    @Test
    @DisplayName("Should delete product successfully")
    void shouldDeleteProductSuccessfully() throws Exception {
        // given
        doNothing().when(productService).deleteProduct(1L);

        // when & then
        mockMvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isNoContent());

        verify(productService, times(1)).deleteProduct(1L);
    }

    @Test
    @DisplayName("Should update product inventory successfully")
    void shouldUpdateProductInventorySuccessfully() throws Exception {
        // given
        ProductResponse productResponse = ProductResponse.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(new BigDecimal("99.99"))
                .category("Electronics")
                .inventoryCount(25)  // Updated inventory
                .imageUrl("http://example.com/image.jpg")
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        when(productService.updateProductInventory(eq(1L), eq(25))).thenReturn(productResponse);

        // when & then
        mockMvc.perform(patch("/api/v1/products/1/inventory")
                        .param("quantity", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.inventoryCount", is(25)));

        verify(productService, times(1)).updateProductInventory(1L, 25);
    }
}