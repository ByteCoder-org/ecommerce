package com.bytecoder.ecommerce.product.service;

import com.bytecoder.ecommerce.product.dto.ProductRequest;
import com.bytecoder.ecommerce.product.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IProductService {

    Page<ProductResponse> getAllProducts(Pageable pageable);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    Page<ProductResponse> getProductsByCategory(String category, Pageable pageable);

    List<ProductResponse> getProductsByCategory(String category);

    Page<ProductResponse> searchProductsByName(String name, Pageable pageable);

    List<ProductResponse> searchProductsByName(String name);

    Page<ProductResponse> getAvailableProducts(Pageable pageable);

    List<ProductResponse> getAvailableProducts();

    ProductResponse createProduct(ProductRequest productRequest);

    ProductResponse updateProduct(Long id, ProductRequest productRequest);

    void deleteProduct(Long id);

    ProductResponse updateProductInventory(Long id, Integer quantity);
}