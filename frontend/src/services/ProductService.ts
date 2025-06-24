export class ProductService {
  private API_BASE = 'http://localhost:8000/api/v1';

  private async fetchWithAuth(url: string, options: RequestInit, authToken?: string): Promise<Response> {
    if (!authToken) {
      authToken = this.getTokenFromCookie();
      if (!authToken) {
        throw new Error('Access token is not defined');
      }
    }

    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${authToken}`;
    options.headers = headers;

    return fetch(url, options);
  }

  async getProducts() {
    const response = await fetch(`${this.API_BASE}/products`, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }

  async createProduct(productData: any, authToken: string) {
    if (!authToken) {
      console.error('❌ ProductService: Missing authentication token');
      throw new Error('Authentication token is required to create a product');
    }

    console.log('🔧 ProductService: Creating product with data:', productData);
    console.log('🔑 ProductService: Auth token received:', `${authToken.substring(0, 20)}...`);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    console.log('📤 ProductService: Request headers:', headers);

    try {
      const response = await fetch(`${this.API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData)
      });

      console.log('📥 ProductService: Response status:', response.status);
      console.log('📥 ProductService: Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ProductService: Error response:', errorText);
        if (response.status === 401) {
          console.error('❌ ProductService: Unauthorized access - check your token');
        } else if (response.status === 403) {
          console.error('❌ ProductService: Forbidden - CORS policy might be blocking the request');
        }
        throw new Error(`Failed to create product: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('❌ ProductService: Network or server error:', error);
      throw error;
    }
  }

  async addProduct(productData: object, authToken?: string) {
    const response = await this.fetchWithAuth(`${this.API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    }, authToken);

    if (!response.ok) {
      throw new Error('Failed to add product');
    }
    return response.json();
  }

  async deleteProduct(productId: string, authToken?: string) {
    const response = await this.fetchWithAuth(`${this.API_BASE}/products/${productId}`, {
      method: 'DELETE'
    }, authToken);

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return response.json();
  }

  private getTokenFromCookie(): string | null {
    const match = document.cookie.match(/(^|;)\s*access_token=([^;]+)/);
    return match ? match[2] : null;
  }
}