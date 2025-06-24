export class AuthService {
  accessToken = '';
  refreshToken = '';
  authenticated = false;
  username = '';
  userRoles: string[] = [];

  private API_GATEWAY_HOST = 'http://localhost:8000';
  private KEYCLOAK_HOST = `${this.API_GATEWAY_HOST}/auth`;
  private AUTH_URL = `${this.KEYCLOAK_HOST}/realms/ecommerce/protocol/openid-connect/auth`;
  private TOKEN_URL = `${this.KEYCLOAK_HOST}/realms/ecommerce/protocol/openid-connect/token`;
  private LOGOUT_URL = `${this.KEYCLOAK_HOST}/realms/ecommerce/protocol/openid-connect/logout`;
  private CLIENT_ID = 'ecommerce-app';
  private REDIRECT_URI = window.location.origin + window.location.pathname;

  login() {
    console.log('🔑 AuthService: Starting login process...');
    const authUrl = new URL(this.AUTH_URL);
    authUrl.searchParams.append('client_id', this.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid');

    console.log('🔑 AuthService: Redirecting to:', authUrl.toString());
    window.location.href = authUrl.toString();
  }

  logout() {
    console.log('🚪 AuthService: Starting logout process...');
    this.clearTokens();
    const logoutUrl = new URL(this.LOGOUT_URL);
    logoutUrl.searchParams.append('client_id', this.CLIENT_ID);
    logoutUrl.searchParams.append('post_logout_redirect_uri', this.REDIRECT_URI);
    console.log('🚪 AuthService: Redirecting to logout:', logoutUrl.toString());
    window.location.href = logoutUrl.toString();
  }

  async exchangeCodeForTokens(code: string, onAuthSuccess?: () => void, onAuthFailed?: () => void) {
    console.log('🔄 AuthService: Exchanging code for tokens...');
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', this.CLIENT_ID);
      params.append('code', code);
      params.append('redirect_uri', this.REDIRECT_URI);

      console.log('🔄 AuthService: Making token request to:', this.TOKEN_URL);
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const data = await response.json();
      console.log('🔄 AuthService: Token response received:', data);
      const { access_token, refresh_token } = data;
      this.handleSuccessfulAuth(access_token, refresh_token, onAuthSuccess);
    } catch (error) {
      console.error('❌ AuthService: Error exchanging code for tokens:', error);
      onAuthFailed?.();
    }
  }

  handleSuccessfulAuth(accessTokenValue: string, refreshTokenValue: string, callback?: () => void) {
    console.log('✅ AuthService: Handling successful authentication...');
    document.cookie = `access_token=${accessTokenValue}; Secure; SameSite=Strict; path=/`;
    document.cookie = `refresh_token=${refreshTokenValue}; Secure; SameSite=Strict; path=/`;

    this.accessToken = accessTokenValue;
    this.refreshToken = refreshTokenValue;
    this.authenticated = true;

    try {
      const decodedToken = this.decodeToken(accessTokenValue);
      console.log('🔍 AuthService: Decoded token:', decodedToken);
      
      this.username = decodedToken.preferred_username || 'User';
      console.log('👤 AuthService: Username set to:', this.username);

      if (decodedToken.realm_access && decodedToken.realm_access.roles) {
        this.userRoles = decodedToken.realm_access.roles.map((role: string) => 'ROLE_' + role.toUpperCase());
        console.log('🏷️ AuthService: User roles set to:', this.userRoles);
      } else {
        console.log('⚠️ AuthService: No realm_access or roles found in token');
        this.userRoles = [];
      }

      const isAdminResult = this.isAdmin();
      console.log('🛡️ AuthService: Admin check result:', isAdminResult);

      callback?.();
    } catch (error) {
      console.error('❌ AuthService: Error parsing token:', error);
      this.clearTokens();
    }
  }

  clearTokens() {
    console.log('🧹 AuthService: Clearing tokens...');
    document.cookie = 'access_token=; Max-Age=0; path=/';
    document.cookie = 'refresh_token=; Max-Age=0; path=/';
    this.accessToken = '';
    this.refreshToken = '';
    this.authenticated = false;
    this.username = '';
    this.userRoles = [];
    console.log('✅ AuthService: Tokens cleared');
  }

  checkAuth(onAuthSuccess?: () => void, onAuthFailed?: () => void) {
    console.log('🔍 AuthService: Checking authentication...');
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    console.log('🍪 AuthService: Available cookies:', Object.keys(cookies));

    const storedToken = cookies['access_token'];
    const storedRefresh = cookies['refresh_token'];

    console.log('🔍 AuthService: accessToken during checkAuth:', this.accessToken);

    if (storedToken && storedRefresh) {
      console.log('✅ AuthService: Tokens found in cookies');
      try {
        const decodedToken = this.decodeToken(storedToken);
        const currentTime = Math.floor(Date.now() / 1000);
        console.log('⏰ AuthService: Token expires at:', decodedToken.exp, 'Current time:', currentTime);

        if (decodedToken.exp > currentTime) {
          console.log('✅ AuthService: Token is still valid');
          this.handleSuccessfulAuth(storedToken, storedRefresh, onAuthSuccess);
        } else {
          console.log('❌ AuthService: Token has expired');
          onAuthFailed?.();
        }
      } catch (error) {
        console.error('❌ AuthService: Invalid token:', error);
        this.clearTokens();
        onAuthFailed?.();
      }
    } else {
      console.log('❌ AuthService: No tokens found in cookies');
      onAuthFailed?.();
    }
  }

  isAdmin(): boolean {
    const hasAdminRole = this.userRoles.includes('ROLE_ADMIN');
    console.log('🛡️ AuthService: isAdmin() check - roles:', this.userRoles, 'hasAdminRole:', hasAdminRole);
    return hasAdminRole;
  }

  getAuthHeader() {
    return this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {};
  }

  private decodeToken(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
}
