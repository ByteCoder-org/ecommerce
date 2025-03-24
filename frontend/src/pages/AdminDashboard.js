import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productApi from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inventory: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getAllProducts(0, 100); // Get up to 100 products
      setProducts(response.data.content);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  // Validate form input
  const validateForm = () => {
    if (!newProduct.name.trim()) {
      setFormError('Product name is required');
      return false;
    }
    if (!newProduct.price || isNaN(newProduct.price) || Number(newProduct.price) <= 0) {
      setFormError('Please enter a valid price greater than 0');
      return false;
    }
    if (!newProduct.inventory || isNaN(newProduct.inventory) || Number(newProduct.inventory) < 0) {
      setFormError('Please enter a valid inventory (0 or greater)');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Format the data to match the expected API request format
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        inventory: parseInt(newProduct.inventory)
      };
      
      await productApi.createProduct(productData);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        inventory: ''
      });
      
      // Refresh product list
      fetchProducts();
      
      // Hide form after successful submission
      setShowForm(false);
    } catch (err) {
      console.error('Error creating product:', err);
      setFormError('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.deleteProduct(id);
        // Refresh product list
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again later.');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button 
          className="new-product-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showForm && (
        <div className="product-form-container">
          <form className="product-form" onSubmit={handleSubmit}>
            <h2>Add New Product</h2>
            
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="inventory">Inventory *</label>
                <input
                  type="number"
                  id="inventory"
                  name="inventory"
                  value={newProduct.inventory}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-section">
        <h2>Manage Products</h2>
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="admin-products-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Inventory</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-products">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category || 'N/A'}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.inventory}</td>
                      <td className="actions-cell">
                        <Link 
                          to={`/products/${product.id}`} 
                          className="view-btn"
                          title="View product details"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="delete-btn"
                          title="Delete product"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;