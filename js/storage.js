/**
 * Module de gestion du stockage local
 * Utilise IndexedDB pour le stockage des données hors ligne
 */

class StorageManager {
    constructor() {
        this.dbName = 'InlocStockDB';
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * Initialiser la base de données
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Erreur d\'ouverture de la base de données');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Base de données ouverte');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store pour les produits
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('code', 'code', { unique: false });
                    productStore.createIndex('serial', 'serial', { unique: false });
                    productStore.createIndex('name', 'name', { unique: false });
                }

                // Store pour les mouvements
                if (!db.objectStoreNames.contains('movements')) {
                    const movementStore = db.createObjectStore('movements', { keyPath: 'id', autoIncrement: true });
                    movementStore.createIndex('product_id', 'product_id', { unique: false });
                    movementStore.createIndex('type', 'type', { unique: false });
                    movementStore.createIndex('date', 'date', { unique: false });
                    movementStore.createIndex('synced', 'synced', { unique: false });
                }

                // Store pour les mouvements en attente de synchronisation
                if (!db.objectStoreNames.contains('pending_movements')) {
                    db.createObjectStore('pending_movements', { keyPath: 'id', autoIncrement: true });
                }

                // Store pour les paramètres
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                console.log('Base de données créée/mise à jour');
            };
        });
    }

    /**
     * Sauvegarder un produit
     */
    async saveProduct(product) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const request = store.put(product);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Sauvegarder plusieurs produits
     */
    async saveProducts(products) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');

        const promises = products.map(product => {
            return new Promise((resolve, reject) => {
                const request = store.put(product);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Récupérer un produit par ID
     */
    async getProduct(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupérer tous les produits
     */
    async getAllProducts() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Rechercher un produit par code
     */
    async findProductByCode(code) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const index = store.index('code');
            const request = index.get(code);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Rechercher un produit par numéro de série
     */
    async findProductBySerial(serial) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const index = store.index('serial');
            const request = index.get(serial);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Rechercher des produits par nom (texte partiel)
     */
    async searchProducts(searchTerm) {
        const allProducts = await this.getAllProducts();
        
        if (!searchTerm) return allProducts;

        const term = searchTerm.toLowerCase();
        return allProducts.filter(product => {
            return (
                (product.name && product.name.toLowerCase().includes(term)) ||
                (product.code && product.code.toLowerCase().includes(term)) ||
                (product.serial && product.serial.toLowerCase().includes(term))
            );
        });
    }

    /**
     * Supprimer un produit
     */
    async deleteProduct(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Sauvegarder un mouvement
     */
    async saveMovement(movement) {
        if (!this.db) await this.init();

        // Ajouter la date si non présente
        if (!movement.date) {
            movement.date = new Date().toISOString();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['movements'], 'readwrite');
            const store = transaction.objectStore('movements');
            const request = store.put(movement);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupérer tous les mouvements
     */
    async getAllMovements() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['movements'], 'readonly');
            const store = transaction.objectStore('movements');
            const request = store.getAll();

            request.onsuccess = () => {
                const movements = request.result || [];
                // Trier par date décroissante
                movements.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(movements);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupérer les mouvements par produit
     */
    async getMovementsByProduct(productId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['movements'], 'readonly');
            const store = transaction.objectStore('movements');
            const index = store.index('product_id');
            const request = index.getAll(productId);

            request.onsuccess = () => {
                const movements = request.result || [];
                movements.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(movements);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Ajouter un mouvement en attente de synchronisation
     */
    async addPendingMovement(movement) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pending_movements'], 'readwrite');
            const store = transaction.objectStore('pending_movements');
            
            movement.pending = true;
            movement.created_at = new Date().toISOString();
            
            const request = store.put(movement);

            request.onsuccess = () => {
                console.log('Mouvement en attente ajouté');
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupérer tous les mouvements en attente
     */
    async getPendingMovements() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pending_movements'], 'readonly');
            const store = transaction.objectStore('pending_movements');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Supprimer un mouvement en attente
     */
    async removePendingMovement(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pending_movements'], 'readwrite');
            const store = transaction.objectStore('pending_movements');
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Sauvegarder un paramètre
     */
    async saveSetting(key, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupérer un paramètre
     */
    async getSetting(key, defaultValue = null) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obtenir des statistiques
     */
    async getStats() {
        const products = await this.getAllProducts();
        const movements = await this.getAllMovements();

        // Calculer les statistiques
        const totalProducts = products.length;
        const inStock = products.filter(p => p.quantity && p.quantity > 0).length;
        const lowStock = products.filter(p => p.quantity && p.low_stock_threshold && p.quantity <= p.low_stock_threshold).length;

        // Mouvements des dernières 24h
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const movements24h = movements.filter(m => new Date(m.date) > yesterday).length;

        return {
            totalProducts,
            inStock,
            lowStock,
            movements24h
        };
    }

    /**
     * Vider toute la base de données
     */
    async clearAll() {
        if (!this.db) await this.init();

        const storeNames = ['products', 'movements', 'pending_movements'];
        
        const promises = storeNames.map(storeName => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Fermer la connexion à la base de données
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('Base de données fermée');
        }
    }
}

// Instance globale du gestionnaire de stockage
window.storageManager = new StorageManager();
