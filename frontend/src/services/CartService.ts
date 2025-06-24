export class CartService {
  private API_BASE = 'http://localhost:8000/api/v1';

  private async fetchWithAuth(url: string, options: RequestInit): Promise<Response> {
    const authToken = this.getTokenFromCookie();
    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${authToken}`;
    options.headers = headers;

    return fetch(url, options);
  }

  async getCart() {
    const userId = this.getUserIdFromToken();
    const response = await this.fetchWithAuth(`${this.API_BASE}/cart/${userId}`, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    return response.json();
  }

  async addToCart(productId: string, quantity: number) {
    const userId = this.getUserIdFromToken();
    const response = await this.fetchWithAuth(`${this.API_BASE}/cart/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    const responseText = await response.text();
    if (!responseText) {
      return { message: 'Item added to cart successfully' };
    }
  }

  async removeFromCart(productId: string) {
    const userId = this.getUserIdFromToken();
    const response = await this.fetchWithAuth(`${this.API_BASE}/cart/${userId}/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
    
    return { message: 'Item removed from cart successfully' }; // Handle empty response
  }

  private getUserIdFromToken(): string {
    const token = this.getTokenFromCookie();
    if (!token || !token.includes('.')) {
      throw new Error('Invalid or missing token');
    }

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    try {
      const decoded = JSON.parse(jsonPayload);
      return decoded.sub;
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }

  private getTokenFromCookie(): string | null {
    const match = document.cookie.match(/(^|;)\s*access_token=([^;]+)/);
    return match ? match[2] : null;
  }
}
