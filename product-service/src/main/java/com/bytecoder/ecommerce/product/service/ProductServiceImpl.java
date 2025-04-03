package com.bytecoder.ecommerce.product.service;

import com.bytecoder.ecommerce.product.dto.ProductRequest;
import com.bytecoder.ecommerce.product.dto.ProductResponse;
import com.bytecoder.ecommerce.product.exception.ProductNotFoundException;
import com.bytecoder.ecommerce.product.mapper.ProductMapper;
import com.bytecoder.ecommerce.product.model.Product;
import com.bytecoder.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::mapToProductResponse);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = findProductByIdOrThrow(id);
        return productMapper.mapToProductResponse(product);
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategory(category, pageable)
                .map(productMapper::mapToProductResponse);
    }

    @Override
    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(productMapper::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductResponse> searchProductsByName(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(productMapper::mapToProductResponse);
    }

    @Override
    public List<ProductResponse> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(productMapper::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductResponse> getAvailableProducts(Pageable pageable) {
        return productRepository.findByInventoryCountGreaterThan(0, pageable)
                .map(productMapper::mapToProductResponse);
    }

    @Override
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findByInventoryCountGreaterThan(0).stream()
                .map(productMapper::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest) {
        Product product = productMapper.mapToEntity(productRequest);
        Product savedProduct = productRepository.save(product);
        return productMapper.mapToProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest productRequest) {
        Product product = findProductByIdOrThrow(id);
        productMapper.updateEntityFromRequest(product, productRequest);
        Product updatedProduct = productRepository.save(product);
        return productMapper.mapToProductResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ProductResponse updateProductInventory(Long id, Integer quantity) {
        Product product = findProductByIdOrThrow(id);
        product.setInventoryCount(quantity);
        Product updatedProduct = productRepository.save(product);
        return productMapper.mapToProductResponse(updatedProduct);
    }

    private Product findProductByIdOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }
}