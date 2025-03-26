// authService.js
// Handles authentication-related functionality

// Get URLs from environment or use defaults
const API_GATEWAY_HOST = 'http://localhost:8000';
const KEYCLOAK_HOST = `${API_GATEWAY_HOST}/auth`; // Route through Kong

// Update the OAuth URLs to use Kong
const AUTH_URL = `${KEYCLOAK_HOST}/realms/ecommerce/protocol/openid-connect/auth`;
const TOKEN_URL = `${KEYCLOAK_HOST}/realms/ecommerce/protocol/openid-connect/token`;
const LOGOUT_URL = `${KEYCLOAK_HOST}/realms/ecommerce/protocol/openid-connect/logout`;
const CLIENT_ID = 'ecommerce-app';
const REDIRECT_URI = window.location.origin + window.location.pathname;

// For debugging - log the actual URLs being used
console.log('API Gateway Host:', API_GATEWAY_HOST);
console.log('Keycloak Host:', KEYCLOAK_HOST);
console.log('Auth URL:', AUTH_URL);
console.log('Token URL:', TOKEN_URL);

class AuthService {
    constructor() {
        this.accessToken = '';
        this.refreshToken = '';
        this.authenticated = false;
        this.username = '';
        this.userRoles = [];
    }

    // Debug function to log auth details
    debugAuthToken(token) {
        try {
            if (!token) {
                console.error('No access token available');
                return;
            }

            const decoded = jwt_decode(token);
            console.log('Decoded token:', decoded);

            // Check realm roles
            if (decoded.realm_access && decoded.realm_access.roles) {
                console.log('Realm roles:', decoded.realm_access.roles);
                const hasAdminRole = decoded.realm_access.roles.includes('admin');
                console.log('Has admin role:', hasAdminRole);
            } else {
                console.error('No realm_access.roles found in token');
            }

            // Check resource access (client roles)
            if (decoded.resource_access && decoded.resource_access['ecommerce-app']) {
                console.log('Client roles:', decoded.resource_access['ecommerce-app'].roles);
                const hasClientAdminRole = decoded.resource_access['ecommerce-app'].roles.includes('admin');
                console.log('Has client admin role:', hasClientAdminRole);
            } else {
                console.log('No client roles found for ecommerce-app');
            }

            // Check token expiration
            const currentTime = Math.floor(Date.now() / 1000);
            const expiresIn = decoded.exp - currentTime;
            console.log(`Token expires in: ${expiresIn} seconds`);

        } catch (error) {
            console.error('Error debugging token:', error);
        }
    }

    // Authentication methods
    login() {
        const authUrl = new URL(AUTH_URL);
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', 'openid');

        window.location.href = authUrl.toString();
    }

    logout() {
        // Clear local tokens
        this.clearTokens();

        // Redirect to Keycloak logout
        const logoutUrl = new URL(LOGOUT_URL);
        logoutUrl.searchParams.append('client_id', CLIENT_ID);
        logoutUrl.searchParams.append('post_logout_redirect_uri', REDIRECT_URI);

        window.location.href = logoutUrl.toString();
    }

    async exchangeCodeForTokens(code, onAuthSuccess, onAuthFailed) {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('client_id', CLIENT_ID);
            params.append('code', code);
            params.append('redirect_uri', REDIRECT_URI);

            const response = await axios.post(TOKEN_URL, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token } = response.data;
            this.handleSuccessfulAuth(access_token, refresh_token, onAuthSuccess);
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            onAuthFailed();
        }
    }

    async refreshAccessToken(refreshTokenValue, onAuthSuccess, onAuthFailed) {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('client_id', CLIENT_ID);
            params.append('refresh_token', refreshTokenValue);

            const response = await axios.post(TOKEN_URL, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token } = response.data;
            this.handleSuccessfulAuth(access_token, refresh_token, onAuthSuccess);
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.clearTokens();
            onAuthFailed();
        }
    }

    handleSuccessfulAuth(accessTokenValue, refreshTokenValue, callback) {
        // Store tokens
        this.accessToken = accessTokenValue;
        this.refreshToken = refreshTokenValue;
        localStorage.setItem('access_token', accessTokenValue);
        localStorage.setItem('refresh_token', refreshTokenValue);

        // Debug the token
        this.debugAuthToken(accessTokenValue);

        // Set authenticated state
        this.authenticated = true;

        // Parse token for user info
        try {
            const decodedToken = jwt_decode(accessTokenValue);
            this.username = decodedToken.preferred_username || 'User';

            // Extract roles
            if (decodedToken.realm_access && decodedToken.realm_access.roles) {
                this.userRoles = decodedToken.realm_access.roles.map(role => 'ROLE_' + role.toUpperCase());
            }

            // Set up token refresh timer
            const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
            if (expiresIn > 0) {
                // Refresh 30 seconds before expiration
                setTimeout(() => this.refreshAccessToken(refreshTokenValue, callback, () => {}),
                    (expiresIn - 30) * 1000);
            }

            // Execute callback if provided
            if (callback) {
                callback();
            }
        } catch (error) {
            console.error('Error parsing token:', error);
            this.clearTokens();
        }
    }

    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.accessToken = '';
        this.refreshToken = '';
        this.authenticated = false;
        this.username = '';
        this.userRoles = [];
    }

    checkAuth(onAuthSuccess, onAuthFailed) {
        // Check for tokens in local storage
        const storedToken = localStorage.getItem('access_token');
        const storedRefresh = localStorage.getItem('refresh_token');

        if (storedToken && storedRefresh) {
            this.accessToken = storedToken;
            this.refreshToken = storedRefresh;

            // Verify token is still valid
            try {
                const decodedToken = jwt_decode(storedToken);
                const currentTime = Math.floor(Date.now() / 1000);

                if (decodedToken.exp > currentTime) {
                    this.handleSuccessfulAuth(storedToken, storedRefresh, onAuthSuccess);
                } else {
                    // Token expired, try to refresh
                    this.refreshAccessToken(storedRefresh, onAuthSuccess, onAuthFailed);
                }
            } catch (error) {
                console.error('Invalid token:', error);
                this.clearTokens();
                onAuthFailed();
            }
        } else {
            onAuthFailed();
        }
    }

    isAdmin() {
        return this.userRoles.includes('ROLE_ADMIN');
    }

    getAuthHeader() {
        return this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {};
    }
}

// Create a global instance
const authService = new AuthService();