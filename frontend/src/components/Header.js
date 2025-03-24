import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import KeycloakService from '../services/keycloak';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Update auth state whenever the component renders
    setIsAuthenticated(KeycloakService.isAuthenticated());
    setUserInfo(KeycloakService.getUserInfo());
    setIsAdmin(KeycloakService.hasRole('admin'));

    // Set up an event listener for authentication changes
    const updateAuthState = () => {
      setIsAuthenticated(KeycloakService.isAuthenticated());
      setUserInfo(KeycloakService.getUserInfo());
      setIsAdmin(KeycloakService.hasRole('admin'));
    };

    // This will catch token refresh events
    window.addEventListener('keycloak-token-refresh', updateAuthState);
    
    return () => {
      window.removeEventListener('keycloak-token-refresh', updateAuthState);
    };
  }, []);

  const handleLogin = () => {
    if (isAuthenticated) {
      KeycloakService.logout();
    } else {
      KeycloakService.login();
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">E-Commerce Store</Link>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          {isAdmin && (
            <li><Link to="/admin">Admin</Link></li>
          )}
        </ul>
      </nav>
      <div className="auth">
        {isAuthenticated ? (
          <div className="user-info">
            <span>Welcome, {userInfo?.username || 'User'}</span>
            <button onClick={handleLogin} className="logout-btn">Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin} className="login-btn">Login</button>
        )}
      </div>
    </header>
  );
}

export default Header;