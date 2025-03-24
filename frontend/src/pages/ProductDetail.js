import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productApi from '../services/api';
import KeycloakService from '../services/keycloak';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = KeycloakService.isAuthenticated() && KeycloakService.hasRole('admin');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productApi.getProductById(id);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.deleteProduct(id);
        navigate('/products');
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again later.');
      }
    }
  };

  const handleUpdateInventory = async (newQuantity) => {
    try {
      const response = await productApi.updateProductInventory(id, newQuantity);
      setProduct(response.data);
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError('Failed to update inventory. Please try again later.');
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">Product not found.</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-image-container">
          <div className="product-image-large">
            {/* Placeholder image - in a real app you'd use product.imageUrl */}
            <div className="image-placeholder-large"></div>
          </div>
        </div>
        
        <div className="product-info-container">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-category">Category: {product.category}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          
          <div className="product-inventory-status">
            {product.inventory > 0 ? (
              <span className="in-stock">In Stock ({product.inventory} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available.'}</p>
          </div>
          
          {isAdmin && (
            <div className="admin-actions">
              <h3>Admin Actions</h3>
              <div className="inventory-control">
                <button 
                  onClick={() => handleUpdateInventory(product.inventory - 1)}
                  disabled={product.inventory <= 0}
                  className="inventory-btn"
                >
                  -
                </button>
                <span>{product.inventory}</span>
                <button 
                  onClick={() => handleUpdateInventory(product.inventory + 1)}
                  className="inventory-btn"
                >
                  +
                </button>
              </div>
              <button onClick={handleDelete} className="delete-btn">
                Delete Product
              </button>
            </div>
          )}
          
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;