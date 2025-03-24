import axios from 'axios';
import KeycloakService from './keycloak';

// Create an axios instance with default config
const api = axios.create({
    baseURL: '/api/v1', // The base URL for all requests
    timeout: 10000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
    (config) => {
        if (KeycloakService.isAuthenticated()) {
            config.headers['Authorization'] = `Bearer ${KeycloakService.getToken()}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            console.error('Session expired or not authenticated');
            KeycloakService.login();
        }
        return Promise.reject(error);
    }
);

// Product API methods
const productApi = {
    // Get all products with pagination
    getAllProducts: (page = 0, size = 10, sortBy = 'id', direction = 'asc') => {
        return api.get(`/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
    },

    // Get product by ID
    getProductById: (id) => {
        return api.get(`/products/${id}`);
    },

    // Get products by category
    getProductsByCategory: (category, page = 0, size = 10) => {
        return api.get(`/products/category/${category}?page=${page}&size=${size}`);
    },

    // Search products by name
    searchProductsByName: (name, page = 0, size = 10) => {
        return api.get(`/products/search?name=${name}&page=${page}&size=${size}`);
    },

    // Get available products (inventory > 0)
    getAvailableProducts: (page = 0, size = 10) => {
        return api.get(`/products/available?page=${page}&size=${size}`);
    },

    // Create a new product (admin only)
    createProduct: (productData) => {
        return api.post('/products', productData);
    },

    // Update an existing product (admin only)
    updateProduct: (id, productData) => {
        return api.put(`/products/${id}`, productData);
    },

    // Delete a product (admin only)
    deleteProduct: (id) => {
        return api.delete(`/products/${id}`);
    },

    // Update product inventory (admin only)
    updateProductInventory: (id, quantity) => {
        return api.patch(`/products/${id}/inventory?quantity=${quantity}`);
    }
};

export default productApi;