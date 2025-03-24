import Keycloak from 'keycloak-js';

// Keycloak instance configuration
const keycloakConfig = {
  url: 'http://localhost:8080/',
  realm: 'ecommerce',
  clientId: 'ecommerce-app'
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Track initialization state
let initialized = false;
let initializationPromise = null;

// Function to initialize Keycloak with callbacks for success and error
const initKeycloak = (onAuthSuccess, onAuthError) => {
  // Prevent multiple initializations
  if (initialized) {
    if (keycloak.authenticated) {
      onAuthSuccess(keycloak);
    } else {
      onAuthSuccess(keycloak);
    }
    return;
  }

  // If already initializing, return the existing promise
  if (initializationPromise) {
    initializationPromise.then(() => {
      if (keycloak.authenticated) {
        onAuthSuccess(keycloak);
      } else {
        onAuthSuccess(keycloak);
      }
    }).catch(onAuthError);
    return;
  }

  // Initialize for the first time
  initializationPromise = keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256'
  })
    .then((authenticated) => {
      initialized = true;
      if (authenticated) {
        // Setup token refresh
        initTokenRefresh();
      } else {
        console.log('Not authenticated');
      }
      onAuthSuccess(keycloak);
      return authenticated;
    })
    .catch((error) => {
      console.error('Failed to initialize Keycloak', error);
      onAuthError(error);
      throw error;
    });
};

// Setup automatic token refresh
const initTokenRefresh = () => {
  setInterval(() => {
    keycloak.updateToken(70)
      .then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
          // Dispatch an event when the token is refreshed
          window.dispatchEvent(new CustomEvent('keycloak-token-refresh'));
        }
      })
      .catch(() => {
        console.error('Failed to refresh token, or session expired');
        // Force re-login on token refresh failure
        keycloak.login();
      });
  }, 60000); // Refresh token every minute
};

// Login function
const login = () => {
  keycloak.login();
};

// Logout function
const logout = () => {
  keycloak.logout();
};

// Getting the authentication token for API calls
const getToken = () => {
  return keycloak.token;
};

// Check if the user has a specific role
const hasRole = (role) => {
  return keycloak.authenticated && keycloak.hasRealmRole(role);
};

// Get user information
const getUserInfo = () => {
  if (keycloak.authenticated) {
    return {
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      name: keycloak.tokenParsed.name,
      roles: keycloak.realmAccess?.roles || []
    };
  }
  return null;
};

// Check if the user is authenticated
const isAuthenticated = () => {
  return keycloak.authenticated;
};

const KeycloakService = {
  keycloak,
  initKeycloak,
  login,
  logout,
  getToken,
  hasRole,
  getUserInfo,
  isAuthenticated
};

export default KeycloakService;