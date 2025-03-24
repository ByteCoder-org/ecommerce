import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productApi from '../services/api';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch products based on current filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let response;

      if (searchTerm) {
        // Search by name
        response = await productApi.searchProductsByName(searchTerm, page, size);
      } else if (category) {
        // Filter by category
        response = await productApi.getProductsByCategory(category, page, size);
      } else {
        // Get all products
        response = await productApi.getAllProducts(page, size);
      }

      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      
      // Extract unique categories for filter
      const uniqueCategories = new Set();
      response.data.content.forEach(product => {
        if (product.category) {
          uniqueCategories.add(product.category);
        }
      });
      setCategories(Array.from(uniqueCategories));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, size, searchTerm, category]);

  const handlePreviousPage = () => {
    setPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage(prev => (prev + 1 < totalPages ? prev + 1 : prev));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(0); // Reset to first page when changing category
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setPage(0);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-list-page">
      <div className="filters-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="category-filter">
          <select value={category} onChange={handleCategoryChange} className="category-select">
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {(searchTerm || category) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Try different filters.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {/* Placeholder image - in a real app you'd use product.imageUrl */}
                <div className="image-placeholder"></div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <p className="product-inventory">
                  {product.inventory > 0 
                    ? `In stock (${product.inventory})` 
                    : 'Out of stock'}
                </p>
                <Link to={`/products/${product.id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={handlePreviousPage} 
            disabled={page === 0}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={page === totalPages - 1}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;