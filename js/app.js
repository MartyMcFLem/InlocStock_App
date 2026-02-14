/**
 * Fichier principal de l'application InlocStock
 */

// Variables globales
let currentPage = 'dashboard';
let currentProduct = null;

// Gestion du Dark Mode
function initDarkMode() {
    // Charger la préférence depuis localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        updateThemeColor('#1F2937'); // gray-800
        document.body.style.backgroundColor = '#1F2937';
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        updateThemeColor('#1F2937'); // gray-800
        document.body.style.backgroundColor = '#1F2937';
    }
    
    // Ajouter l'event listener pour le toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
    
    // Mettre à jour le theme-color et background immédiatement
    if (isDark) {
        updateThemeColor('#1F2937'); // gray-800
        document.body.style.backgroundColor = '#1F2937';
    } else {
        updateThemeColor('#1F2937'); // gray-800
        document.body.style.backgroundColor = '#1F2937';
    }
}

function updateThemeColor(color) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation de l\'application...');

    // Initialiser le dark mode
    initDarkMode();

    // Initialiser le stockage local
    try {
        await storageManager.init();
        console.log('Stockage initialisé');
    } catch (error) {
        console.error('Erreur d\'initialisation du stockage:', error);
    }

    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('Service Worker enregistré:', registration.scope);

            // Écouter les messages du service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                handleServiceWorkerMessage(event.data);
            });
        } catch (error) {
            console.error('Erreur d\'enregistrement du Service Worker:', error);
        }
    }

    // Initialiser l'interface
    initializeUI();
    
    // Charger les données initiales
    await loadInitialData();

    // Vérifier les paramètres de configuration
    checkConfiguration();
    
    // Vérifier si l'app est en mode standalone
    checkStandaloneMode();

    // Masquer le loader
    const appLoader = document.getElementById('appLoader');
    if (appLoader) {
        appLoader.classList.add('loaded');
        setTimeout(() => appLoader.remove(), 300);
    }

    console.log('Application prête');
});

/**
 * Vérifier si l'app est en mode standalone (installée)
 */
function checkStandaloneMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || window.navigator.standalone 
        || document.referrer.includes('android-app://');
    
    if (!isStandalone) {
        console.log('💡 L\'application n\'est pas installée. Pour profiter du mode plein écran, installez-la sur votre écran d\'accueil.');
        // Optionnel : afficher un message à l'utilisateur
        setTimeout(() => {
            if (!localStorage.getItem('installPromptShown')) {
                showToast('💡 Astuce : Installez l\'app sur votre écran d\'accueil pour une meilleure expérience', 'info', 5000);
                localStorage.setItem('installPromptShown', 'true');
            }
        }, 2000);
    } else {
        console.log('✅ Application en mode standalone (installée)');
    }
}

/**
 * Initialiser l'interface utilisateur
 */
function initializeUI() {
    // Menu
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn, [data-page]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
                closeMenu();
            }
        });
    });

    // Scanner
    const scanQRBtn = document.getElementById('scanQRBtn');
    const scanSerialBtn = document.getElementById('scanSerialBtn');
    const stopScanBtn = document.getElementById('stopScanBtn');
    const searchManualBtn = document.getElementById('searchManualBtn');

    if (scanQRBtn) scanQRBtn.addEventListener('click', startQRScanner);
    if (scanSerialBtn) scanSerialBtn.addEventListener('click', startSerialScanner);
    if (stopScanBtn) stopScanBtn.addEventListener('click', stopScanner);
    if (searchManualBtn) searchManualBtn.addEventListener('click', searchManual);

    // Produits
    const addProductBtn = document.getElementById('addProductBtn');
    const searchProducts = document.getElementById('searchProducts');

    if (addProductBtn) addProductBtn.addEventListener('click', showAddProductDialog);
    if (searchProducts) searchProducts.addEventListener('input', debounce(searchProductsHandler, 300));

    // Mouvements
    const addEntryBtn = document.getElementById('addEntryBtn');
    const addExitBtn = document.getElementById('addExitBtn');

    if (addEntryBtn) addEntryBtn.addEventListener('click', () => showMovementDialog('entry'));
    if (addExitBtn) addExitBtn.addEventListener('click', () => showMovementDialog('exit'));

    // Paramètres
    const saveApiSettingsBtn = document.getElementById('saveApiSettingsBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');

    if (saveApiSettingsBtn) saveApiSettingsBtn.addEventListener('click', saveApiSettings);
    if (clearCacheBtn) clearCacheBtn.addEventListener('click', clearCache);

    // Vérifier le statut de connexion
    window.addEventListener('online', () => {
        showToast('Connexion rétablie', 'success');
        syncPendingData();
    });

    window.addEventListener('offline', () => {
        showToast('Mode hors ligne', 'warning');
    });
}

/**
 * Charger les données initiales
 */
async function loadInitialData() {
    try {
        // Charger les statistiques
        await updateDashboard();

        // Charger les produits
        await loadProducts();

        // Charger les mouvements
        await loadMovements();

    } catch (error) {
        console.error('Erreur de chargement des données:', error);
    }
}

/**
 * Vérifier la configuration de l'API
 */
function checkConfiguration() {
    const apiKey = localStorage.getItem('apiKey');
    
    if (!apiKey) {
        showToast('Veuillez configurer l\'API dans les paramètres', 'warning', 5000);
    }
}

/**
 * Navigation
 */
function navigateToPage(pageName) {
    // Masquer toutes les pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.add('hidden'));

    // Afficher la page demandée
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('slide-in');
    }

    // Mettre à jour la navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('text-indigo-600');
        btn.classList.add('text-gray-500');
        
        if (btn.getAttribute('data-page') === pageName) {
            btn.classList.remove('text-gray-500');
            btn.classList.add('text-indigo-600');
        }
    });

    currentPage = pageName;

    // Charger les données de la page
    switch (pageName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'movements':
            loadMovements();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

/**
 * Menu
 */
function openMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    sideMenu.classList.remove('translate-x-full');
    menuOverlay.classList.remove('hidden');
}

function closeMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    sideMenu.classList.add('translate-x-full');
    menuOverlay.classList.add('hidden');
}

/**
 * Mise à jour du tableau de bord
 */
async function updateDashboard() {
    try {
        let stats;

        // Essayer de récupérer depuis l'API
        if (navigator.onLine) {
            try {
                stats = await inlocAPI.getStats();
                await storageManager.saveSetting('last_stats', stats);
            } catch (error) {
                console.warn('Impossible de récupérer les stats de l\'API, utilisation du cache');
                stats = await storageManager.getSetting('last_stats');
            }
        } else {
            // Hors ligne, utiliser les stats locales
            stats = await storageManager.getStats();
        }

        if (stats) {
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('inStock').textContent = stats.inStock || 0;
            document.getElementById('lowStock').textContent = stats.lowStock || 0;
            document.getElementById('movements24h').textContent = stats.movements24h || 0;
        }

        // Charger les mouvements récents
        await loadRecentMovements();

    } catch (error) {
        console.error('Erreur de mise à jour du tableau de bord:', error);
    }
}

/**
 * Charger les mouvements récents
 */
async function loadRecentMovements() {
    try {
        const movements = await storageManager.getAllMovements();
        const recentMovements = movements.slice(0, 5);

        const container = document.getElementById('recentMovements');
        
        if (recentMovements.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun mouvement récent</p>';
            return;
        }

        container.innerHTML = recentMovements.map(movement => {
            const icon = movement.type === 'entry' ? 'arrow-down' : 'arrow-up';
            const color = movement.type === 'entry' ? 'green' : 'red';
            const date = new Date(movement.date).toLocaleString('fr-FR');

            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="bg-${color}-100 p-2 rounded-full">
                            <i class="fas fa-${icon} text-${color}-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">${movement.product_name || 'Produit inconnu'}</p>
                            <p class="text-sm text-gray-500">${date}</p>
                        </div>
                    </div>
                    <span class="font-semibold text-${color}-600">${movement.quantity > 0 ? '+' : ''}${movement.quantity}</span>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Erreur de chargement des mouvements récents:', error);
    }
}

/**
 * Scanner QR / Code-barres
 */
async function startQRScanner() {
    const scannerContainer = document.getElementById('scannerContainer');
    const scanResult = document.getElementById('scanResult');
    
    scanResult.innerHTML = '';
    scannerContainer.classList.remove('hidden');

    const success = await scannerManager.init(
        'reader',
        handleScanSuccess,
        handleScanError
    );

    if (success) {
        await scannerManager.startScanning();
    }
}

async function stopScanner() {
    await scannerManager.stopScanning();
    document.getElementById('scannerContainer').classList.add('hidden');
}

function handleScanSuccess(decodedText, decodedResult) {
    console.log('Code détecté:', decodedText);
    
    showToast('Code détecté: ' + decodedText, 'success');
    
    // Rechercher le produit
    searchProductByCode(decodedText);
}

function handleScanError(error) {
    console.error('Erreur de scan:', error);
    showToast(error, 'error');
}

/**
 * Scanner numéro de série (OCR)
 */
async function startSerialScanner() {
    const ocrContainer = document.getElementById('ocrContainer');
    const serialImageInput = document.getElementById('serialImageInput');
    const cancelOCRBtn = document.getElementById('cancelOCRBtn');

    ocrContainer.classList.remove('hidden');

    // Initialiser l'OCR
    ocrManager.onProgress = (progress) => {
        showToast(`Extraction en cours... ${progress}%`, 'info');
    };

    ocrManager.onComplete = (result) => {
        handleOCRResult(result);
    };

    ocrManager.onError = (error) => {
        showToast('Erreur OCR: ' + error, 'error');
        ocrContainer.classList.add('hidden');
    };

    // Ouvrir le sélecteur de fichiers
    serialImageInput.click();

    serialImageInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            showToast('Analyse de l\'image...', 'info');
            try {
                const result = await ocrManager.scanFile(file);
                handleOCRResult(result);
            } catch (error) {
                showToast('Erreur d\'analyse de l\'image', 'error');
            }
        }
        ocrContainer.classList.add('hidden');
    };

    cancelOCRBtn.onclick = () => {
        ocrContainer.classList.add('hidden');
    };
}

function handleOCRResult(result) {
    console.log('Résultat OCR:', result);
    
    if (result.serials && result.serials.length > 0) {
        const serial = result.serials[0];
        showToast('Numéro de série détecté: ' + serial, 'success');
        searchProductBySerial(serial);
    } else {
        showToast('Aucun numéro de série détecté. Texte extrait: ' + result.text.substring(0, 50), 'warning');
    }
}

/**
 * Recherche manuelle
 */
async function searchManual() {
    const code = document.getElementById('manualCode').value.trim();
    
    if (!code) {
        showToast('Veuillez entrer un code', 'warning');
        return;
    }

    await searchProductByCode(code);
}

/**
 * Rechercher un produit par code
 */
async function searchProductByCode(code) {
    try {
        showToast('Recherche en cours...', 'info');

        let product = null;

        // Rechercher d'abord en local
        product = await storageManager.findProductByCode(code);

        // Si non trouvé et en ligne, rechercher dans l'API
        if (!product && navigator.onLine) {
            product = await inlocAPI.searchProductByCode(code);
            if (product) {
                await storageManager.saveProduct(product);
            }
        }

        if (product) {
            showProductDetails(product);
        } else {
            showToast('Produit non trouvé', 'warning');
            // Proposer de créer le produit
            if (confirm('Produit non trouvé. Voulez-vous le créer?')) {
                showAddProductDialog(code);
            }
        }

    } catch (error) {
        console.error('Erreur de recherche:', error);
        showToast('Erreur de recherche: ' + error.message, 'error');
    }
}

/**
 * Rechercher un produit par numéro de série
 */
async function searchProductBySerial(serial) {
    try {
        showToast('Recherche en cours...', 'info');

        let product = null;

        // Rechercher d'abord en local
        product = await storageManager.findProductBySerial(serial);

        // Si non trouvé et en ligne, rechercher dans l'API
        if (!product && navigator.onLine) {
            product = await inlocAPI.searchProductBySerial(serial);
            if (product) {
                await storageManager.saveProduct(product);
            }
        }

        if (product) {
            showProductDetails(product);
        } else {
            showToast('Produit non trouvé', 'warning');
        }

    } catch (error) {
        console.error('Erreur de recherche:', error);
        showToast('Erreur de recherche: ' + error.message, 'error');
    }
}

/**
 * Afficher les détails d'un produit
 */
function showProductDetails(product) {
    const scanResult = document.getElementById('scanResult');
    
    scanResult.innerHTML = `
        <div class="bg-white border-2 border-indigo-600 rounded-lg p-6 mt-4">
            <h3 class="text-xl font-bold text-gray-800 mb-4">${product.name || 'Produit'}</h3>
            <div class="space-y-2 mb-4">
                <p class="text-gray-600"><strong>Code:</strong> ${product.code || 'N/A'}</p>
                ${product.serial ? `<p class="text-gray-600"><strong>N° série:</strong> ${product.serial}</p>` : ''}
                <p class="text-gray-600"><strong>Stock:</strong> ${product.quantity || 0}</p>
                ${product.description ? `<p class="text-gray-600"><strong>Description:</strong> ${product.description}</p>` : ''}
            </div>
            <div class="grid grid-cols-2 gap-3">
                <button onclick="showMovementDialog('entry', ${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                        class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-arrow-down mr-2"></i>Entrée
                </button>
                <button onclick="showMovementDialog('exit', ${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                        class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition">
                    <i class="fas fa-arrow-up mr-2"></i>Sortie
                </button>
            </div>
        </div>
    `;
}

/**
 * Charger les produits
 */
async function loadProducts() {
    try {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '<p class="text-gray-500 text-center py-8">Chargement...</p>';

        let products = [];

        // Charger depuis l'API si en ligne
        if (navigator.onLine) {
            try {
                products = await inlocAPI.getProducts();
                await storageManager.saveProducts(products);
            } catch (error) {
                console.warn('Erreur API, chargement depuis le cache');
                products = await storageManager.getAllProducts();
            }
        } else {
            products = await storageManager.getAllProducts();
        }

        displayProducts(products);

    } catch (error) {
        console.error('Erreur de chargement des produits:', error);
        showToast('Erreur de chargement des produits', 'error');
    }
}

/**
 * Afficher la liste des produits
 */
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) {
        productsList.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun produit</p>';
        return;
    }

    productsList.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition" 
             onclick='showProductDetails(${JSON.stringify(product).replace(/'/g, "\\'")})'> 
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-bold text-gray-800">${product.name || 'Sans nom'}</h3>
                    <p class="text-sm text-gray-500">${product.code || 'N/A'}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${product.quantity || 0}
                    </p>
                    <p class="text-xs text-gray-500">en stock</p>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Rechercher des produits (handler)
 */
async function searchProductsHandler(e) {
    const searchTerm = e.target.value.trim();
    const products = await storageManager.searchProducts(searchTerm);
    displayProducts(products);
}

/**
 * Afficher le dialogue d'ajout de produit
 */
function showAddProductDialog(defaultCode = '') {
    showToast('Fonctionnalité en cours de développement', 'info');
    // TODO: Implémenter un modal pour ajouter un produit
}

/**
 * Charger les mouvements
 */
async function loadMovements() {
    try {
        const movementsList = document.getElementById('movementsList');
        movementsList.innerHTML = '<p class="text-gray-500 text-center py-4">Chargement...</p>';

        const movements = await storageManager.getAllMovements();

        if (movements.length === 0) {
            movementsList.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun mouvement</p>';
            return;
        }

        movementsList.innerHTML = movements.map(movement => {
            const icon = movement.type === 'entry' ? 'arrow-down' : 'arrow-up';
            const color = movement.type === 'entry' ? 'green' : 'red';
            const date = new Date(movement.date).toLocaleString('fr-FR');
            const typeLabel = movement.type === 'entry' ? 'Entrée' : 'Sortie';

            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3 flex-1">
                        <div class="bg-${color}-100 p-2 rounded-full">
                            <i class="fas fa-${icon} text-${color}-600"></i>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-800">${movement.product_name || 'Produit'}</p>
                            <p class="text-sm text-gray-500">${typeLabel} • ${date}</p>
                            ${movement.note ? `<p class="text-xs text-gray-400 mt-1">${movement.note}</p>` : ''}
                        </div>
                    </div>
                    <span class="font-semibold text-${color}-600 ml-3">${movement.quantity > 0 ? '+' : ''}${movement.quantity}</span>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Erreur de chargement des mouvements:', error);
    }
}

/**
 * Afficher le dialogue de mouvement
 */
function showMovementDialog(type, product = null) {
    const typeLabel = type === 'entry' ? 'Entrée' : 'Sortie';
    const color = type === 'entry' ? 'green' : 'red';
    
    const productInfo = product ? `
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <p class="font-medium">${product.name}</p>
            <p class="text-sm text-gray-500">Stock actuel: ${product.quantity || 0}</p>
        </div>
    ` : '';

    // Créer un modal simple
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 class="text-xl font-bold mb-4">${typeLabel} de stock</h3>
            ${productInfo}
            ${!product ? `
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                    <input type="text" id="movementProductCode" placeholder="Code produit" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600">
                </div>
            ` : ''}
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <input type="number" id="movementQuantity" min="1" value="1" 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Note (optionnel)</label>
                <textarea id="movementNote" rows="2" 
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"></textarea>
            </div>
            <div class="flex space-x-3">
                <button id="confirmMovement" class="flex-1 bg-${color}-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-${color}-700 transition">
                    Confirmer
                </button>
                <button id="cancelMovement" class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition">
                    Annuler
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Événements
    document.getElementById('confirmMovement').onclick = async () => {
        const quantity = parseInt(document.getElementById('movementQuantity').value);
        const note = document.getElementById('movementNote').value;
        
        let productCode = product ? product.code : document.getElementById('movementProductCode')?.value;

        if (!productCode || !quantity) {
            showToast('Veuillez remplir tous les champs', 'warning');
            return;
        }

        await createMovement(type, productCode, quantity, note, product);
        modal.remove();
    };

    document.getElementById('cancelMovement').onclick = () => {
        modal.remove();
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

/**
 * Créer un mouvement
 */
async function createMovement(type, productCode, quantity, note, product = null) {
    try {
        // Préparer le mouvement
        const movement = {
            type: type,
            product_code: productCode,
            product_id: product?.id,
            product_name: product?.name,
            quantity: type === 'entry' ? quantity : -quantity,
            note: note,
            date: new Date().toISOString()
        };

        // Sauvegarder localement
        await storageManager.saveMovement(movement);

        // Essayer de synchroniser avec l'API si en ligne
        if (navigator.onLine) {
            try {
                const apiMethod = type === 'entry' ? 'addStockEntry' : 'addStockExit';
                await inlocAPI[apiMethod](movement);
                showToast('Mouvement enregistré', 'success');
            } catch (error) {
                // Ajouter aux mouvements en attente
                await storageManager.addPendingMovement(movement);
                showToast('Mouvement enregistré localement (sera synchronisé)', 'info');
            }
        } else {
            await storageManager.addPendingMovement(movement);
            showToast('Mouvement enregistré (mode hors ligne)', 'info');
        }

        // Mettre à jour l'affichage
        await updateDashboard();
        await loadMovements();

    } catch (error) {
        console.error('Erreur de création du mouvement:', error);
        showToast('Erreur: ' + error.message, 'error');
    }
}

/**
 * Charger les paramètres
 */
function loadSettings() {
    const apiUrl = localStorage.getItem('apiUrl') || 'https://www.inloc.be/admin/api';
    const apiKey = localStorage.getItem('apiKey') || '';

    document.getElementById('apiUrl').value = apiUrl;
    document.getElementById('apiKey').value = apiKey;
}

/**
 * Sauvegarder les paramètres API
 */
function saveApiSettings() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!apiUrl) {
        showToast('L\'URL de l\'API est requise', 'warning');
        return;
    }

    inlocAPI.configure(apiUrl, apiKey);
    showToast('Paramètres sauvegardés', 'success');
}

/**
 * Vider le cache
 */
async function clearCache() {
    if (!confirm('Voulez-vous vraiment vider le cache? Cette action est irréversible.')) {
        return;
    }

    try {
        // Vider IndexedDB
        await storageManager.clearAll();

        // Vider le localStorage
        const keysToKeep = ['apiUrl', 'apiKey', 'apiToken'];
        Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        // Demander au service worker de vider son cache
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage('clearCache');
        }

        showToast('Cache vidé', 'success');

        // Recharger les données
        await loadInitialData();

    } catch (error) {
        console.error('Erreur de vidage du cache:', error);
        showToast('Erreur: ' + error.message, 'error');
    }
}

/**
 * Synchroniser les données en attente
 */
async function syncPendingData() {
    try {
        const pendingMovements = await storageManager.getPendingMovements();
        
        if (pendingMovements.length === 0) {
            return;
        }

        console.log(`Synchronisation de ${pendingMovements.length} mouvements...`);

        for (const movement of pendingMovements) {
            try {
                const apiMethod = movement.type === 'entry' ? 'addStockEntry' : 'addStockExit';
                await inlocAPI[apiMethod](movement);
                await storageManager.removePendingMovement(movement.id);
            } catch (error) {
                console.error('Erreur de synchronisation du mouvement:', error);
            }
        }

        showToast(`${pendingMovements.length} mouvements synchronisés`, 'success');

    } catch (error) {
        console.error('Erreur de synchronisation:', error);
    }
}

/**
 * Gérer les messages du Service Worker
 */
function handleServiceWorkerMessage(data) {
    switch (data.type) {
        case 'cacheCleared':
            showToast('Cache du Service Worker vidé', 'success');
            break;
        case 'syncComplete':
            showToast(`${data.count} mouvements synchronisés`, 'success');
            break;
    }
}

/**
 * Afficher une notification toast
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-orange-600',
        info: 'bg-blue-600'
    };

    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 slide-in`;
    toast.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Debounce helper
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
