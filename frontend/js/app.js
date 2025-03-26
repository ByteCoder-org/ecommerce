// app.js
// Main application logic

const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
    setup() {
        // Data properties
        const authenticated = ref(false);
        const username = ref('');
        const products = ref([]);
        const loading = ref(true);
        const newProduct = ref({
            name: '',
            description: '',
            price: 0,
            inventoryCount: 0,
            category: ''
        });
        const selectedProduct = ref(null);

        // Computed properties
        const isAdmin = computed(() => {
            return authService.isAdmin();
        });

        // Initialize on mount
        onMounted(() => {
            // Check URL for authorization code
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                // Exchange code for tokens
                handleAuthCode(code);
            } else {
                // Check for existing auth
                checkAuthStatus();
            }
        });

        // Handle authorization code from redirect
        const handleAuthCode = (code) => {
            loading.value = true;

            // Clean URL
            const url = new URL(window.location);
            url.search = '';
            window.history.replaceState({}, document.title, url);

            // Exchange code for tokens
            authService.exchangeCodeForTokens(
                code,
                () => {
                    updateAuthState();
                    fetchProducts();
                },
                () => {
                    loading.value = false;
                }
            );
        };

        // Check authentication status
        const checkAuthStatus = () => {
            loading.value = true;

            authService.checkAuth(
                () => {
                    updateAuthState();
                    fetchProducts();
                },
                () => {
                    loading.value = false;
                }
            );
        };

        // Update app state based on auth service
        const updateAuthState = () => {
            authenticated.value = authService.authenticated;
            username.value = authService.username;
        };

        // Login method
        const login = () => {
            authService.login();
        };

        // Logout method
        const logout = () => {
            authService.logout();
        };

        // Fetch products
        const fetchProducts = async () => {
            try {
                loading.value = true;
                products.value = await apiService.fetchProducts();
            } catch (error) {
                console.error('Error in fetchProducts:', error);
            } finally {
                loading.value = false;
            }
        };

        // Create product
        const createProduct = async () => {
            try {
                loading.value = true;
                await apiService.createProduct(newProduct.value);

                // Reset form
                newProduct.value = {
                    name: '',
                    description: '',
                    price: 0,
                    inventoryCount: 0,
                    category: ''
                };

                // Refresh products
                fetchProducts();
            } catch (error) {
                loading.value = false;
            }
        };

        // Delete product
        const deleteProduct = async (id) => {
            if (!confirm('Are you sure you want to delete this product?')) {
                return;
            }

            try {
                loading.value = true;
                await apiService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                loading.value = false;
            }
        };

        // Select product for editing
        const selectProductForEdit = (product) => {
            selectedProduct.value = { ...product };
        };

        // Cancel edit
        const cancelEdit = () => {
            selectedProduct.value = null;
        };

        // Update product
        const updateProduct = async () => {
            try {
                loading.value = true;
                await apiService.updateProduct(selectedProduct.value);
                selectedProduct.value = null;
                fetchProducts();
            } catch (error) {
                loading.value = false;
            }
        };

        return {
            // State
            authenticated,
            username,
            isAdmin,
            products,
            loading,
            newProduct,
            selectedProduct,

            // Methods
            login,
            logout,
            createProduct,
            deleteProduct,
            selectProductForEdit,
            cancelEdit,
            updateProduct
        };
    }
});

// Mount the app
app.mount('#app');