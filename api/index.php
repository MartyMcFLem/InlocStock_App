<?php
/**
 * Proxy API pour InlocStock
 * 
 * Ce fichier sert de proxy entre l'application frontend et l'API Inloc.
 * Il permet de sécuriser les tokens API côté serveur.
 * 
 * Usage: À placer dans un dossier /api/ sur votre serveur
 */

require_once __DIR__ . '/api-config.php';

// Activer les CORS
setCorsHeaders();

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Récupérer le corps de la requête
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Récupérer l'action demandée
$action = $_GET['action'] ?? '';

// Router les requêtes
try {
    switch ($action) {
        case 'products':
            handleProductsRequest($method, $data);
            break;
            
        case 'product':
            handleProductRequest($method, $data);
            break;
            
        case 'search':
            handleSearchRequest($data);
            break;
            
        case 'movements':
            handleMovementsRequest($method, $data);
            break;
            
        case 'entry':
            handleStockEntry($data);
            break;
            
        case 'exit':
            handleStockExit($data);
            break;
            
        case 'stats':
            handleStatsRequest();
            break;
            
        case 'health':
            sendJsonResponse(['status' => 'ok', 'timestamp' => time()]);
            break;
            
        default:
            sendError('Action non reconnue', 404);
    }
} catch (Exception $e) {
    sendError('Erreur du serveur', 500, $e->getMessage());
}

/**
 * Gérer les requêtes produits
 */
function handleProductsRequest($method, $data) {
    switch ($method) {
        case 'GET':
            // Récupérer tous les produits ou filtrer
            $filters = $_GET;
            unset($filters['action']);
            
            $query = http_build_query($filters);
            $endpoint = '/products' . ($query ? '?' . $query : '');
            
            $result = callInlocAPI($endpoint);
            
            if ($result['success']) {
                sendJsonResponse($result['data']);
            } else {
                sendError('Impossible de récupérer les produits', $result['code']);
            }
            break;
            
        case 'POST':
            // Créer un nouveau produit
            if (!$data) {
                sendError('Données manquantes');
            }
            
            $result = callInlocAPI('/products', 'POST', $data);
            
            if ($result['success']) {
                sendJsonResponse($result['data'], 201);
            } else {
                sendError('Impossible de créer le produit', $result['code']);
            }
            break;
            
        default:
            sendError('Méthode non autorisée', 405);
    }
}

/**
 * Gérer les requêtes pour un produit spécifique
 */
function handleProductRequest($method, $data) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendError('ID produit manquant');
    }
    
    switch ($method) {
        case 'GET':
            $result = callInlocAPI("/products/$id");
            
            if ($result['success']) {
                sendJsonResponse($result['data']);
            } else {
                sendError('Produit non trouvé', $result['code']);
            }
            break;
            
        case 'PUT':
            $result = callInlocAPI("/products/$id", 'PUT', $data);
            
            if ($result['success']) {
                sendJsonResponse($result['data']);
            } else {
                sendError('Impossible de modifier le produit', $result['code']);
            }
            break;
            
        case 'DELETE':
            $result = callInlocAPI("/products/$id", 'DELETE');
            
            if ($result['success']) {
                sendJsonResponse(['message' => 'Produit supprimé']);
            } else {
                sendError('Impossible de supprimer le produit', $result['code']);
            }
            break;
            
        default:
            sendError('Méthode non autorisée', 405);
    }
}

/**
 * Gérer les recherches
 */
function handleSearchRequest($data) {
    $code = $_GET['code'] ?? '';
    $serial = $_GET['serial'] ?? '';
    
    if (!$code && !$serial) {
        sendError('Code ou numéro de série requis');
    }
    
    $endpoint = '/products/search?';
    if ($code) {
        $endpoint .= 'code=' . urlencode($code);
    } else {
        $endpoint .= 'serial=' . urlencode($serial);
    }
    
    $result = callInlocAPI($endpoint);
    
    if ($result['success']) {
        sendJsonResponse($result['data']);
    } else {
        sendError('Produit non trouvé', $result['code']);
    }
}

/**
 * Gérer les mouvements de stock
 */
function handleMovementsRequest($method, $data) {
    if ($method !== 'GET') {
        sendError('Méthode non autorisée', 405);
    }
    
    $filters = $_GET;
    unset($filters['action']);
    
    $query = http_build_query($filters);
    $endpoint = '/stock/movements' . ($query ? '?' . $query : '');
    
    $result = callInlocAPI($endpoint);
    
    if ($result['success']) {
        sendJsonResponse($result['data']);
    } else {
        sendError('Impossible de récupérer les mouvements', $result['code']);
    }
}

/**
 * Gérer les entrées de stock
 */
function handleStockEntry($data) {
    if (!$data) {
        sendError('Données manquantes');
    }
    
    // Valider les données
    if (!isset($data['product_id']) || !isset($data['quantity'])) {
        sendError('product_id et quantity sont requis');
    }
    
    $result = callInlocAPI('/stock/entry', 'POST', $data);
    
    if ($result['success']) {
        sendJsonResponse($result['data'], 201);
    } else {
        sendError('Impossible d\'enregistrer l\'entrée', $result['code']);
    }
}

/**
 * Gérer les sorties de stock
 */
function handleStockExit($data) {
    if (!$data) {
        sendError('Données manquantes');
    }
    
    // Valider les données
    if (!isset($data['product_id']) || !isset($data['quantity'])) {
        sendError('product_id et quantity sont requis');
    }
    
    $result = callInlocAPI('/stock/exit', 'POST', $data);
    
    if ($result['success']) {
        sendJsonResponse($result['data'], 201);
    } else {
        sendError('Impossible d\'enregistrer la sortie', $result['code']);
    }
}

/**
 * Gérer les statistiques
 */
function handleStatsRequest() {
    $result = callInlocAPI('/stats');
    
    if ($result['success']) {
        sendJsonResponse($result['data']);
    } else {
        sendError('Impossible de récupérer les statistiques', $result['code']);
    }
}
