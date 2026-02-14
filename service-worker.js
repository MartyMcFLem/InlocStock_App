const CACHE_NAME = 'inlocstock-v1.1.1';
const RUNTIME_CACHE = 'inlocstock-runtime';

// Fichiers à mettre en cache lors de l'installation
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/js/app.js',
    '/js/api.js',
    '/js/scanner.js',
    '/js/ocr.js',
    '/js/storage.js',
    '/icons/android/android-launchericon-192-192.png',
    '/icons/android/android-launchericon-512-512.png'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Installation en cours...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Mise en cache des ressources');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[Service Worker] Installation terminée');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[Service Worker] Erreur d\'installation:', err);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activation en cours...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Supprimer les anciens caches
                            return cacheName.startsWith('inlocstock-') && 
                                   cacheName !== CACHE_NAME && 
                                   cacheName !== RUNTIME_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[Service Worker] Suppression du cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation terminée');
                return self.clients.claim();
            })
    );
});

// Stratégie de cache: Network First, fallback to Cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorer les requêtes vers des domaines externes (sauf CDN)
    if (url.origin !== location.origin && 
        !url.hostname.includes('cdn') && 
        !url.hostname.includes('unpkg')) {
        return;
    }

    // Pour les requêtes API, toujours essayer le réseau d'abord
    if (url.pathname.includes('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Pour les autres fichiers, utiliser cache d'abord
    event.respondWith(cacheFirst(request));
});

// Stratégie: Cache d'abord
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        
        // Mettre en cache les nouvelles ressources
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[Service Worker] Erreur de récupération:', error);
        
        // Retourner une page d'erreur hors ligne si disponible
        return caches.match('/offline.html') || new Response('Hors ligne', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stratégie: Réseau d'abord
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    
    try {
        const response = await fetch(request);
        
        // Mettre en cache pour utilisation hors ligne
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[Service Worker] Réseau indisponible, utilisation du cache');
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        return new Response(JSON.stringify({
            error: 'Hors ligne',
            message: 'Cette fonctionnalité nécessite une connexion internet'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Nettoyage périodique du cache runtime
self.addEventListener('message', event => {
    if (event.data === 'clearCache') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                return self.clients.matchAll();
            }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'cacheCleared' });
                });
            })
        );
    }
});

// Synchronisation en arrière-plan (pour les mouvements hors ligne)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-movements') {
        event.waitUntil(syncMovements());
    }
});

async function syncMovements() {
    console.log('[Service Worker] Synchronisation des mouvements...');
    
    try {
        // Récupérer les mouvements en attente depuis IndexedDB
        const pendingMovements = await getPendingMovements();
        
        if (pendingMovements.length === 0) {
            console.log('[Service Worker] Aucun mouvement à synchroniser');
            return;
        }

        // Envoyer chaque mouvement à l'API
        for (const movement of pendingMovements) {
            try {
                const response = await fetch('/api/movements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movement)
                });

                if (response.ok) {
                    await removePendingMovement(movement.id);
                    console.log('[Service Worker] Mouvement synchronisé:', movement.id);
                }
            } catch (error) {
                console.error('[Service Worker] Erreur de synchronisation:', error);
            }
        }
        
        // Notifier le client
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ 
                type: 'syncComplete',
                count: pendingMovements.length
            });
        });
        
    } catch (error) {
        console.error('[Service Worker] Erreur de synchronisation:', error);
    }
}

// Helpers pour IndexedDB (simplifié)
async function getPendingMovements() {
    // Cette fonction sera implémentée dans storage.js
    // et accessible via window.storageManager
    return [];
}

async function removePendingMovement(id) {
    // Cette fonction sera implémentée dans storage.js
    return true;
}

// Notifications Push (si nécessaire)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Nouvelle notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: data
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'InlocStock', options)
    );
});

// Clic sur notification
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
