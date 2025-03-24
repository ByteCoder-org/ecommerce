import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KeycloakService from '../services/keycloak';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (KeycloakService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = () => {
    KeycloakService.login();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome to E-Commerce Store</h1>
        <p className="login-description">
          Please log in to access your account and manage your purchases.
          Administrators can also access product management features.
        </p>
        
        <div className="login-card">
          <h2>Login</h2>
          <p>Sign in to your account to continue</p>
          
          <button onClick={handleLogin} className="login-button">
            Login with Keycloak
          </button>
          
          <div className="login-info">
            <p>Demo credentials:</p>
            <div className="credentials-box">
              <div className="credential-item">
                <strong>Regular User:</strong>
                <div>Username: user</div>
                <div>Password: user</div>
              </div>
              <div className="credential-item">
                <strong>Admin User:</strong>
                <div>Username: admin</div>
                <div>Password: admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;