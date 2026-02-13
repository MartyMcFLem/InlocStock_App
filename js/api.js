/**
 * Module de gestion de l'API Inloc
 * Documentation: https://www.inloc.be/admin/api/documentation
 */

class InlocAPI {
    constructor() {
        this.baseURL = localStorage.getItem('apiUrl') || 'https://www.inloc.be/admin/api';
        this.apiKey = localStorage.getItem('apiKey') || '';
        this.token = localStorage.getItem('apiToken') || '';
    }

    /**
     * Configuration de l'API
     */
    configure(baseURL, apiKey) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
        localStorage.setItem('apiUrl', baseURL);
        localStorage.setItem('apiKey', apiKey);
    }

    /**
     * Requête HTTP générique
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Ajouter l'authentification
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        } else if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        const options = {
            method,
            headers,
            mode: 'cors'
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (response.status === 401) {
                throw new Error('Non authentifié - Vérifiez vos credentials API');
            }
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || `Erreur HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur API:', error);
            
            // Si hors ligne, utiliser les données en cache
            if (!navigator.onLine) {
                const cachedData = await this.getCachedData(endpoint);
                if (cachedData) {
                    return cachedData;
                }
            }
            
            throw error;
        }
    }

    /**
     * Authentification
     */
    async login(email, password) {
        try {
            const response = await this.request('/auth/login', 'POST', { email, password });
            if (response.token) {
                this.token = response.token;
                localStorage.setItem('apiToken', response.token);
            }
            return response;
        } catch (error) {
            throw new Error('Erreur de connexion: ' + error.message);
        }
    }

    /**
     * Déconnexion
     */
    logout() {
        this.token = '';
        localStorage.removeItem('apiToken');
    }

    /**
     * Récupérer tous les produits
     */
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        const endpoint = `/products${params.toString() ? '?' + params.toString() : ''}`;
        const data = await this.request(endpoint);
        
        // Mettre en cache
        await this.cacheData(endpoint, data);
        return data;
    }

    /**
     * Récupérer un produit par ID
     */
    async getProduct(id) {
        const endpoint = `/products/${id}`;
        const data = await this.request(endpoint);
        await this.cacheData(endpoint, data);
        return data;
    }

    /**
     * Rechercher un produit par code-barres ou QR code
     */
    async searchProductByCode(code) {
        const endpoint = `/products/search?code=${encodeURIComponent(code)}`;
        try {
            const data = await this.request(endpoint);
            await this.cacheData(endpoint, data);
            return data;
        } catch (error) {
            console.error('Erreur de recherche:', error);
            return null;
        }
    }

    /**
     * Rechercher un produit par numéro de série
     */
    async searchProductBySerial(serial) {
        const endpoint = `/products/search?serial=${encodeURIComponent(serial)}`;
        try {
            const data = await this.request(endpoint);
            await this.cacheData(endpoint, data);
            return data;
        } catch (error) {
            console.error('Erreur de recherche:', error);
            return null;
        }
    }

    /**
     * Créer un nouveau produit
     */
    async createProduct(productData) {
        const data = await this.request('/products', 'POST', productData);
        
        // Invalider le cache des produits
        await this.invalidateCache('/products');
        
        return data;
    }

    /**
     * Mettre à jour un produit
     */
    async updateProduct(id, productData) {
        const data = await this.request(`/products/${id}`, 'PUT', productData);
        
        // Invalider le cache
        await this.invalidateCache(`/products/${id}`);
        await this.invalidateCache('/products');
        
        return data;
    }

    /**
     * Supprimer un produit
     */
    async deleteProduct(id) {
        const data = await this.request(`/products/${id}`, 'DELETE');
        
        // Invalider le cache
        await this.invalidateCache(`/products/${id}`);
        await this.invalidateCache('/products');
        
        return data;
    }

    /**
     * Récupérer les mouvements de stock
     */
    async getMovements(filters = {}) {
        const params = new URLSearchParams(filters);
        const endpoint = `/stock/movements${params.toString() ? '?' + params.toString() : ''}`;
        const data = await this.request(endpoint);
        await this.cacheData(endpoint, data);
        return data;
    }

    /**
     * Enregistrer une entrée de stock
     */
    async addStockEntry(movementData) {
        const data = await this.request('/stock/entry', 'POST', movementData);
        
        // Invalider les caches pertinents
        await this.invalidateCache('/stock/movements');
        if (movementData.product_id) {
            await this.invalidateCache(`/products/${movementData.product_id}`);
        }
        
        return data;
    }

    /**
     * Enregistrer une sortie de stock
     */
    async addStockExit(movementData) {
        const data = await this.request('/stock/exit', 'POST', movementData);
        
        // Invalider les caches pertinents
        await this.invalidateCache('/stock/movements');
        if (movementData.product_id) {
            await this.invalidateCache(`/products/${movementData.product_id}`);
        }
        
        return data;
    }

    /**
     * Récupérer les statistiques
     */
    async getStats() {
        const endpoint = '/stats';
        const data = await this.request(endpoint);
        await this.cacheData(endpoint, data);
        return data;
    }

    /**
     * Mettre en cache les données
     */
    async cacheData(key, data) {
        try {
            const cacheKey = `api_cache_${key}`;
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Erreur de mise en cache:', error);
        }
    }

    /**
     * Récupérer les données en cache
     */
    async getCachedData(key, maxAge = 3600000) { // 1 heure par défaut
        try {
            const cacheKey = `api_cache_${key}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            
            // Vérifier si le cache n'est pas expiré
            if (Date.now() - timestamp > maxAge) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return data;
        } catch (error) {
            console.warn('Erreur de lecture du cache:', error);
            return null;
        }
    }

    /**
     * Invalider le cache
     */
    async invalidateCache(key) {
        try {
            const cacheKey = `api_cache_${key}`;
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.warn('Erreur d\'invalidation du cache:', error);
        }
    }

    /**
     * Vérifier la connexion à l'API
     */
    async checkConnection() {
        try {
            await this.request('/health');
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Instance globale de l'API
window.inlocAPI = new InlocAPI();
