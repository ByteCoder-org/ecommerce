import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productApi from '../services/api';
import KeycloakService from '../services/keycloak';
import './Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = KeycloakService.isAuthenticated();
  const userInfo = KeycloakService.getUserInfo();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Get first 4 available products as "featured"
        const response = await productApi.getAvailableProducts(0, 4);
        setFeaturedProducts(response.data.content);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch featured products.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleLogin = () => {
    KeycloakService.login();
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our E-Commerce Store</h1>
          <p>Discover the best products at affordable prices</p>
          <div className="hero-buttons">
            <Link to="/products" className="browse-btn">Browse Products</Link>
            {!isAuthenticated && (
              <button onClick={handleLogin} className="login-btn">Sign In</button>
            )}
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome back, {userInfo?.name || userInfo?.username || 'User'}!</h2>
            <p>Thank you for being a valued customer.</p>
            {KeycloakService.hasRole('admin') && (
              <div className="admin-info">
                <p><strong>Admin Access:</strong> You have administrative privileges.</p>
                <Link to="/admin" className="admin-btn">Go to Admin Dashboard</Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="featured-section">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="loading">Loading featured products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="featured-products">
            {featuredProducts.map(product => (
              <div key={product.id} className="featured-product-card">
                <div className="featured-image">
                  {/* Placeholder image - in a real app you'd use product.imageUrl */}
                  <div className="image-placeholder"></div>
                </div>
                <div className="featured-info">
                  <h3>{product.name}</h3>
                  <p className="featured-price">${product.price.toFixed(2)}</p>
                  <Link to={`/products/${product.id}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-container">
          <Link to="/products" className="view-all-btn">View All Products</Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Get your products delivered to your doorstep quickly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Quality Products</h3>
            <p>We ensure that all our products meet high-quality standards</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Get the best value for your money with our competitive prices</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Shopping</h3>
            <p>Shop with confidence with our secure payment options</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;