import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { Cart } from '@/components/Cart';
import { AdminPanel } from '@/components/AdminPanel';
import { AuthService } from '@/services/AuthService';
import { ProductService } from '@/services/ProductService';
import { CartService } from '@/services/CartService';

interface CartItem {
  quantity: number;
  productId: string;
}

interface CartItems {
  [key: string]: CartItem;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [showCart, setShowCart] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  const authService = new AuthService();
  const productService = new ProductService();
  const cartService = new CartService();

  useEffect(() => {
    console.log('🚀 Index component mounted, initializing app...');
    initializeApp();
  }, []);

  const initializeApp = () => {
    console.log('🔄 Starting app initialization...');
    
    // Check if we have an authorization code in the URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode) {
      console.log('🔑 Authorization code found in URL, exchanging for tokens...');
      // Clear the code from URL to prevent reprocessing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Exchange code for tokens
      authService.exchangeCodeForTokens(
        authCode,
        () => {
          console.log('✅ Token exchange successful');
          handleAuthSuccess();
        },
        () => {
          console.log('❌ Token exchange failed');
          handleAuthFailure();
        }
      );
    } else {
      // No authorization code, check existing authentication
      console.log('🔍 No authorization code, checking existing authentication...');
      authService.checkAuth(handleAuthSuccess, handleAuthFailure);
    }
  };

  const handleAuthSuccess = () => {
    console.log('✅ Authentication successful');
    console.log('🔐 User authenticated:', authService.authenticated);
    console.log('👤 Username:', authService.username);
    console.log('🏷️ User roles:', authService.userRoles);
    
    setIsAuthenticated(true);
    const adminStatus = authService.isAdmin();
    console.log('🛡️ Is admin check result:', adminStatus);
    setIsAdmin(adminStatus);
    
    loadProducts();
    if (authService.authenticated) {
      console.log('🛒 Loading cart for authenticated user...');
      loadCart();
    }
  };

  const handleAuthFailure = () => {
    console.log('❌ Authentication failed or not authenticated');
    setIsAuthenticated(false);
    setIsAdmin(false);
    loadProducts(); // Still load products for browsing
    setLoading(false);
  };

  const loadProducts = async () => {
    console.log('📦 Loading products...');
    try {
      const productsData = await productService.getProducts();
      console.log('✅ Products loaded successfully:', productsData);
      setProducts(productsData.content || []);
    } catch (error) {
      console.error('❌ Error loading products:', error);
    } finally {
      console.log('🏁 Products loading finished, setting loading to false');
      setLoading(false);
    }
  };

  const loadCart = async () => {
    console.log('🛒 Loading cart...');
    try {
      const cartData = await cartService.getCart();
      console.log('✅ Cart loaded successfully:', cartData);
      setCartItems(cartData.items || {});
    } catch (error) {
      console.error('❌ Error loading cart:', error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    console.log('🛒 Adding product to cart:', productId);
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, cannot add to cart');
      return;
    }

    try {
      await cartService.addToCart(productId.toString(), 1);
      console.log('✅ Product added to cart successfully');
      await loadCart();
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    console.log('🗑️ Removing product from cart:', productId);
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, cannot remove from cart');
      return;
    }

    try {
      await cartService.removeFromCart(productId);
      console.log('✅ Product removed from cart successfully');
      await loadCart();
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
    }
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    console.log('🔄 Updating cart item quantity:', productId, 'to', quantity);
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, cannot update cart');
      return;
    }

    try {
      await cartService.updateCartItemQuantity(productId, quantity);
      console.log('✅ Cart item quantity updated successfully');
      await loadCart();
    } catch (error) {
      console.error('❌ Error updating cart item quantity:', error);
    }
  };

  const handleLogin = () => {
    console.log('🔑 Login button clicked, redirecting to auth...');
    authService.login();
  };

  const handleLogout = () => {
    console.log('🚪 Logout button clicked');
    authService.logout();
  };

  const handleShowAdmin = () => {
    console.log('🛡️ Admin panel button clicked');
    console.log('🔍 Current isAdmin state:', isAdmin);
    console.log('🔍 Current showAdminPanel state:', showAdminPanel);
    console.log('🔍 Auth service admin check:', authService.isAdmin());
    console.log('🔍 User roles:', authService.userRoles);
    setShowAdminPanel(true);
    console.log('✅ Admin panel should now be visible');
  };

  const cartItemCount = Object.values(cartItems).reduce((total: number, item) => total + (item as CartItem).quantity, 0);

  console.log('🖼️ Rendering Index component with state:');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - isAdmin:', isAdmin);
  console.log('  - showAdminPanel:', showAdminPanel);
  console.log('  - loading:', loading);
  console.log('  - cartItemCount:', cartItemCount);

  if (loading) {
    console.log('⏳ Still loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        cartItemCount={cartItemCount}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onShowCart={() => {
          console.log('🛒 Cart button clicked');
          setShowCart(true);
        }}
        onShowAdmin={handleShowAdmin}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h1>
          <p className="text-lg text-gray-600">Discover our curated collection of premium items</p>
        </div>
        
        <ProductGrid 
          products={products} 
          onAddToCart={handleAddToCart}
          isAuthenticated={isAuthenticated}
        />
      </main>

      {showCart && (
        <Cart 
          items={cartItems}
          products={products}
          onClose={() => {
            console.log('❌ Cart closed');
            setShowCart(false);
          }}
          onUpdateCart={loadCart}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateCartQuantity}
          authToken={authService.accessToken}
        />
      )}

      {showAdminPanel && isAdmin && (
        <AdminPanel
          onClose={() => {
            console.log('❌ Admin panel closed');
            setShowAdminPanel(false);
          }}
          onProductCreated={() => {
            console.log('✅ Product created, reloading products...');
            loadProducts();
          }}
          authToken={authService.accessToken}
        />
      )}
      
      {showAdminPanel && !isAdmin && (
        <div>
          {console.log('⚠️ WARNING: Admin panel is trying to show but user is not admin!')}
          {null}
        </div>
      )}
    </div>
  );
};

export default Index;
