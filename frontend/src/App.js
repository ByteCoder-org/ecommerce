import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KeycloakService from './services/keycloak';
import Header from './components/Header';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import './App.css';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [keycloakReady, setKeycloakReady] = useState(false);

  useEffect(() => {
    // We only want to initialize Keycloak once
    if (!initialized) {
      setInitialized(true);
      
      // Initialize Keycloak
      KeycloakService.initKeycloak(
        () => {
          console.log('Keycloak initialized successfully');
          setKeycloakReady(true);
        },
        (error) => {
          console.error('Failed to initialize Keycloak', error);
          setKeycloakReady(true); // Still set to true so we can render the app
        }
      );
    }
  }, [initialized]);

  // Define an admin route that requires the admin role
  const AdminRoute = ({ children }) => {
    if (!keycloakReady) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!KeycloakService.isAuthenticated() || !KeycloakService.hasRole('admin')) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  if (!keycloakReady) {
    return <div className="loading-screen">Initializing application...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;