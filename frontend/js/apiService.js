// apiService.js
// Handles API calls to the backend

class ApiService {
  constructor() {
    this.apiUrl = window.API_GATEWAY_URL || 'http://localhost:8000';
  }

  async fetchProducts() {
    try {
      console.log('Fetching products from:', `${this.apiUrl}/api/v1/products`);
      console.log('Auth headers:', authService.getAuthHeader());

      const response = await axios.get(`${this.apiUrl}/api/v1/products`, {
        headers: authService.getAuthHeader()
      });

      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const response = await axios.get(`${this.apiUrl}/api/v1/products/${id}`, {
        headers: authService.getAuthHeader()
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      // Debug the token before making the request
      authService.debugAuthToken(authService.accessToken);

      // Log the actual headers being sent
      const headers = {
        ...authService.getAuthHeader(),
        'Content-Type': 'application/json'
      };
      console.log('Request headers:', headers);

      const response = await axios.post(`${this.apiUrl}/api/v1/products`, productData, {
        headers: headers
      });

      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      await axios.delete(`${this.apiUrl}/api/v1/products/${id}`, {
        headers: authService.getAuthHeader()
      });

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateProduct(productData) {
    try {
      const response = await axios.put(
          `${this.apiUrl}/api/v1/products/${productData.id}`,
          productData,
          {
            headers: {
              ...authService.getAuthHeader(),
              'Content-Type': 'application/json'
            }
          }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm, category = null) {
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (category) {
        params.append('category', category);
      }

      const queryString = params.toString();
      const url = `${this.apiUrl}/api/v1/products${queryString ? '?' + queryString : ''}`;

      console.log('Searching products:', url);

      const response = await axios.get(url, {
        headers: authService.getAuthHeader()
      });

      return response.data.content || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/v1/products/categories`, {
        headers: authService.getAuthHeader()
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async fetchCart() {
    try {
        const token = authService.accessToken;

        // Validate token before decoding
        if (!token) {
            throw new Error('Access token is missing or undefined');
        }

        const decodedToken = jwt_decode(token); // Decode the token using jwt-decode
        const userId = decodedToken.sub; // Extract the userId from the 'sub' claim

        const response = await axios.get(`${this.apiUrl}/api/v1/cart/${userId}`, {
            headers: authService.getAuthHeader()
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
}

  async addToCart(productId, quantity) {
    try {
        const token = authService.accessToken;
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.sub;

        const response = await axios.post(`${this.apiUrl}/api/v1/cart/${userId}`, {
            productId,
            quantity
        }, {
            headers: {
                ...authService.getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

  async removeFromCart(productId) {
    try {
        const token = authService.accessToken;
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.sub;

        const response = await axios.delete(`${this.apiUrl}/api/v1/cart/${userId}/${productId}`, {
            headers: authService.getAuthHeader()
        });

        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
  }
}

// Create a global instance
const apiService = new ApiService();