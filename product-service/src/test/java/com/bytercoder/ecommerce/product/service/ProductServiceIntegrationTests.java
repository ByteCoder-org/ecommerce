package com.bytercoder.ecommerce.product.service;

import com.bytercoder.ecommerce.product.dto.ProductRequest;
import com.bytercoder.ecommerce.product.dto.ProductResponse;
import com.bytercoder.ecommerce.product.model.Product;
import com.bytercoder.ecommerce.product.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ProductServiceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    private static Long savedProductId;

    @BeforeEach
    void setup() {
        // If we're running the first test, clear the database first
        if (savedProductId == null) {
            productRepository.deleteAll();
        }
    }

    @Test
    @Order(1)
    @DisplayName("Should create a new product")
    void shouldCreateNewProduct() throws Exception {
        // given
        ProductRequest productRequest = ProductRequest.builder()
                .name("Test Product")
                .description("Test Description")
                .price(new BigDecimal("99.99"))
                .category("Test Category")
                .inventoryCount(10)
                .imageUrl("http://example.com/test.jpg")
                .build();

        // when
        MvcResult result = mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name", is("Test Product")))
                .andExpect(jsonPath("$.price", is(99.99)))
                .andExpect(jsonPath("$.inventoryCount", is(10)))
                .andReturn();

        // then
        ProductResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(), ProductResponse.class);
        savedProductId = response.getId();

        assertTrue(productRepository.existsById(savedProductId));
    }

    @Test
    @Order(2)
    @DisplayName("Should get product by ID")
    void shouldGetProductById() throws Exception {
        // given a product was created in the previous test

        // when & then
        mockMvc.perform(get("/api/v1/products/" + savedProductId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedProductId.intValue())))
                .andExpect(jsonPath("$.name", is("Test Product")))
                .andExpect(jsonPath("$.price", is(99.99)));
    }

    @Test
    @Order(3)
    @DisplayName("Should update product")
    void shouldUpdateProduct() throws Exception {
        // given
        ProductRequest updateRequest = ProductRequest.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(new BigDecimal("149.99"))
                .category("Updated Category")
                .inventoryCount(20)
                .imageUrl("http://example.com/updated.jpg")
                .build();

        // when & then
        mockMvc.perform(put("/api/v1/products/" + savedProductId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedProductId.intValue())))
                .andExpect(jsonPath("$.name", is("Updated Product")))
                .andExpect(jsonPath("$.price", is(149.99)))
                .andExpect(jsonPath("$.inventoryCount", is(20)));

        // Verify the update in the database
        Product updatedProduct = productRepository.findById(savedProductId).orElseThrow();
        assertEquals("Updated Product", updatedProduct.getName());
        assertEquals(0, new BigDecimal("149.99").compareTo(updatedProduct.getPrice()));
        assertEquals(20, updatedProduct.getInventoryCount());
    }

    @Test
    @Order(4)
    @DisplayName("Should update product inventory")
    void shouldUpdateProductInventory() throws Exception {
        // when & then
        mockMvc.perform(patch("/api/v1/products/" + savedProductId + "/inventory")
                        .param("quantity", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedProductId.intValue())))
                .andExpect(jsonPath("$.inventoryCount", is(5)));

        // Verify the update in the database
        Product updatedProduct = productRepository.findById(savedProductId).orElseThrow();
        assertEquals(5, updatedProduct.getInventoryCount());
    }

    @Test
    @Order(5)
    @DisplayName("Should get products by category")
    void shouldGetProductsByCategory() throws Exception {
        // given - already have a product with category "Updated Category"

        // when & then
        mockMvc.perform(get("/api/v1/products/category/Updated Category"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(savedProductId.intValue())))
                .andExpect(jsonPath("$.content[0].category", is("Updated Category")))
                .andExpect(jsonPath("$.totalElements", is(1)));
    }

    @Test
    @Order(6)
    @DisplayName("Should search products by name")
    void shouldSearchProductsByName() throws Exception {
        // given - already have a product with name "Updated Product"

        // when & then
        mockMvc.perform(get("/api/v1/products/search")
                        .param("name", "updated"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(savedProductId.intValue())))
                .andExpect(jsonPath("$.content[0].name", is("Updated Product")))
                .andExpect(jsonPath("$.totalElements", is(1)));
    }

    @Test
    @Order(7)
    @DisplayName("Should get available products")
    void shouldGetAvailableProducts() throws Exception {
        // given - already have a product with inventory 5

        // when & then
        mockMvc.perform(get("/api/v1/products/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(savedProductId.intValue())))
                .andExpect(jsonPath("$.content[0].inventoryCount", greaterThan(0)))
                .andExpect(jsonPath("$.totalElements", is(1)));
    }

    @Test
    @Order(8)
    @DisplayName("Should delete product")
    void shouldDeleteProduct() throws Exception {
        // when
        mockMvc.perform(delete("/api/v1/products/" + savedProductId))
                .andExpect(status().isNoContent());

        // then
        mockMvc.perform(get("/api/v1/products/" + savedProductId))
                .andExpect(status().isNotFound());

        List<Product> allProducts = productRepository.findAll();
        assertThat(allProducts, not(hasItem(hasProperty("id", is(savedProductId)))));
    }

    @Test
    @Order(9)
    @DisplayName("Should return 404 for non-existent product")
    void shouldReturn404ForNonExistentProduct() throws Exception {
        // given
        long nonExistentId = 9999L;

        // when & then
        mockMvc.perform(get("/api/v1/products/" + nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("not found")));
    }

    @Test
    @Order(10)
    @DisplayName("Should validate product request")
    void shouldValidateProductRequest() throws Exception {
        // given
        ProductRequest invalidRequest = ProductRequest.builder()
                .name("")  // Invalid: empty name
                .description("Description")
                .price(new BigDecimal("-10.00"))  // Invalid: negative price
                .category("Category")
                .inventoryCount(-5)  // Invalid: negative inventory
                .imageUrl("http://example.com/image.jpg")
                .build();

        // when & then
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.price").exists())
                .andExpect(jsonPath("$.inventoryCount").exists());
    }
}