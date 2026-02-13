# 🚀 Guide d'installation détaillé - InlocStock

Ce guide vous accompagne pas à pas dans l'installation et la configuration de l'application InlocStock.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation locale (développement)](#installation-locale)
3. [Installation sur serveur (production)](#installation-production)
4. [Configuration de l'API](#configuration-api)
5. [Installation mobile](#installation-mobile)
6. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Obligatoires
- ✅ Serveur web (Apache, Nginx, ou serveur local)
- ✅ PHP 7.4+ (si utilisation du proxy PHP)
- ✅ HTTPS activé (sauf localhost en développement)
- ✅ Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Recommandés
- SSL/TLS certificat (Let's Encrypt gratuit)
- Compte Inloc avec accès API
- Espace disque : 50 MB minimum

---

## 💻 Installation locale (développement)

### Option 1 : Serveur PHP intégré

1. **Télécharger le projet**
   ```bash
   git clone https://github.com/MartyMcFLem/InlocStock_App.git
   cd InlocStock_App
   ```

2. **Démarrer le serveur**
   ```bash
   php -S localhost:8000
   ```

3. **Ouvrir dans le navigateur**
   ```
   http://localhost:8000
   ```

### Option 2 : XAMPP

1. **Installer XAMPP**
   - Télécharger depuis https://www.apachefriends.org/
   - Installer et démarrer Apache

2. **Copier les fichiers**
   ```bash
   # Copier le dossier dans htdocs
   cp -r InlocStock_App C:/xampp/htdocs/
   ```

3. **Accéder à l'application**
   ```
   http://localhost/InlocStock_App
   ```

### Option 3 : WAMP

1. **Installer WAMP**
   - Télécharger depuis https://www.wampserver.com/
   - Installer et démarrer

2. **Copier les fichiers**
   ```bash
   # Copier dans www
   cp -r InlocStock_App C:/wamp64/www/
   ```

3. **Ouvrir**
   ```
   http://localhost/InlocStock_App
   ```

### Option 4 : VS Code + Live Server

1. **Installer l'extension Live Server**
   - Dans VS Code : Extensions → "Live Server"

2. **Ouvrir le projet**
   - Fichier → Ouvrir le dossier → Sélectionner InlocStock_App

3. **Lancer**
   - Clic droit sur index.html → "Open with Live Server"

---

## 🌐 Installation production

### Sur hébergement partagé (cPanel)

1. **Téléverser les fichiers**
   - Via FTP (FileZilla) ou File Manager cPanel
   - Destination : `public_html/` ou `www/`

2. **Configurer HTTPS**
   - cPanel → SSL/TLS → Let's Encrypt
   - Activer "Force HTTPS Redirect"

3. **Vérifier les permissions**
   ```bash
   chmod 755 /public_html/InlocStock_App
   chmod 644 /public_html/InlocStock_App/*.html
   chmod 644 /public_html/InlocStock_App/*.js
   ```

4. **Tester**
   ```
   https://votredomaine.com/InlocStock_App
   ```

### Sur VPS/Serveur dédié

#### Ubuntu/Debian + Nginx

1. **Installer Nginx et PHP**
   ```bash
   sudo apt update
   sudo apt install nginx php-fpm php-curl php-json
   ```

2. **Créer le dossier du site**
   ```bash
   sudo mkdir -p /var/www/inlocstock
   sudo chown -R $USER:$USER /var/www/inlocstock
   ```

3. **Copier les fichiers**
   ```bash
   git clone https://github.com/MartyMcFLem/InlocStock_App.git /var/www/inlocstock
   ```

4. **Configurer Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/inlocstock
   ```
   
   Contenu :
   ```nginx
   server {
       listen 80;
       server_name votredomaine.com;
       root /var/www/inlocstock;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location = /service-worker.js {
           add_header Service-Worker-Allowed "/";
           add_header Cache-Control "no-cache";
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
       }
   }
   ```

5. **Activer le site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/inlocstock /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Installer SSL avec Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d votredomaine.com
   ```

#### Ubuntu/Debian + Apache

1. **Installer Apache et PHP**
   ```bash
   sudo apt update
   sudo apt install apache2 php libapache2-mod-php php-curl php-json
   ```

2. **Copier les fichiers**
   ```bash
   sudo git clone https://github.com/MartyMcFLem/InlocStock_App.git /var/www/html/inlocstock
   ```

3. **Activer les modules nécessaires**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod headers
   sudo a2enmod ssl
   sudo systemctl restart apache2
   ```

4. **Installer SSL**
   ```bash
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d votredomaine.com
   ```

---

## 🔌 Configuration API

### 1. Obtenir les credentials Inloc

1. Connectez-vous sur https://www.inloc.be/admin
2. Allez dans **Paramètres** → **API**
3. Générez un nouveau token
4. Copiez le token

### 2. Configurer dans l'application

#### Option A : Via l'interface (recommandé)

1. Ouvrez l'application
2. Menu ☰ → **Paramètres**
3. Remplissez :
   - **URL API** : `https://www.inloc.be/admin/api`
   - **Token** : Votre token copié
4. Cliquez **Enregistrer**

#### Option B : Via le fichier PHP (si proxy backend)

1. Éditez `api-config.php` :
   ```php
   define('INLOC_API_KEY', 'votre_token_ici');
   ```

2. Modifiez `js/api.js` pour utiliser le proxy :
   ```javascript
   this.baseURL = '/api/index.php';
   ```

### 3. Tester la connexion

1. Dans l'application, tentez de charger les produits
2. Vérifiez la console (F12) pour d'éventuelles erreurs
3. Si succès : "✅ Connexion établie"
4. Si erreur : Vérifiez le token et l'URL

---

## 📱 Installation mobile

### Android

#### Chrome

1. **Ouvrir l'application**
   - Accédez à `https://votredomaine.com/InlocStock_App`

2. **Installer**
   - Menu ⋮ (3 points) → "Ajouter à l'écran d'accueil"
   - Ou bannière de bas de page → "Installer"

3. **Utiliser**
   - L'icône apparaît sur l'écran d'accueil
   - S'ouvre comme une app native

#### Samsung Internet

1. Menu → "Ajouter une page à"
2. "Écran d'accueil"

#### Firefox

1. Menu → "Installer"
2. Confirmer

### iOS (iPhone/iPad)

#### Safari (obligatoire sur iOS)

1. **Ouvrir l'application**
   - Safari → `https://votredomaine.com/InlocStock_App`

2. **Installer**
   - Bouton Partager 📤 (en bas)
   - "Sur l'écran d'accueil"
   - Modifier le nom si souhaité
   - "Ajouter"

3. **Utiliser**
   - Icône sur l'écran d'accueil
   - Fonctionne comme une app

> **Note** : Sur iOS, seul Safari supporte les PWA

---

## 🎨 Personnalisation

### Changer les couleurs

1. **Ouvrir `index.html`**

2. **Rechercher et remplacer** :
   - `indigo-600` → Votre couleur (ex: `blue-600`, `green-600`)
   - Couleurs Tailwind disponibles : https://tailwindcss.com/docs/customizing-colors

3. **Modifier le thème dans `manifest.json`** :
   ```json
   "theme_color": "#4F46E5"  // Votre couleur hex
   ```

### Changer le logo

1. **Créer vos icônes** aux tailles :
   - 72×72, 96×96, 128×128, 144×144, 152×152, 192×192, 384×384, 512×512 pixels

2. **Placer dans `icons/`**

3. **Ou utiliser un générateur** :
   ```bash
   npx pwa-asset-generator logo.png icons/
   ```

### Modifier le nom

1. **Dans `manifest.json`** :
   ```json
   "name": "Votre Nom",
   "short_name": "Nom Court"
   ```

2. **Dans `index.html`** :
   ```html
   <title>Votre Nom</title>
   <h1>Votre Nom</h1>
   ```

---

## 🐛 Dépannage

### ❌ Erreur : "Service Worker non enregistré"

**Cause** : Pas en HTTPS ou problème de chemin

**Solution** :
```javascript
// Vérifier dans la console :
navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('✅ OK:', reg))
    .catch(err => console.error('❌ Erreur:', err));
```

### ❌ Erreur : "Impossible d'accéder à la caméra"

**Cause** : Permissions refusées ou pas de HTTPS

**Solutions** :
1. Vérifier les permissions du navigateur
2. Utiliser HTTPS (obligatoire sauf localhost)
3. Chrome → Paramètres → Confidentialité → Autorisations du site → Appareil photo

### ❌ Erreur : "API non accessible"

**Causes possibles** :
1. Token invalide
2. URL incorrecte
3. CORS bloqué

**Solutions** :
1. Générer un nouveau token Inloc
2. Vérifier l'URL : `https://www.inloc.be/admin/api`
3. Si erreur CORS, utiliser le proxy PHP :
   - Configurer `api-config.php`
   - Utiliser `/api/index.php` comme baseURL

### ❌ Erreur : "Hors ligne" alors que connecté

**Solution** :
1. Vider le cache du navigateur
2. Dans l'app : Paramètres → "Vider le cache"
3. Désinstaller et réinstaller la PWA

### ❌ L'application ne se met pas à jour

**Solution** :
1. Incrémenter la version dans `service-worker.js` :
   ```javascript
   const CACHE_NAME = 'inlocstock-v1.0.1'; // Augmenter
   ```
2. Vider le cache navigateur (Ctrl+Shift+Del)
3. Réinstaller la PWA

### ❌ Scanner ne fonctionne pas

**Solutions** :
1. Vérifier HTTPS activé
2. Autoriser la caméra dans les paramètres
3. Tester sur Chrome/Firefox (meilleur support)
4. Vérifier l'éclairage (scanner nécessite bonne lumière)

### ❌ OCR ne détecte rien

**Conseils** :
1. Prendre une photo nette et bien éclairée
2. Texte bien lisible et contrasté
3. Éviter les reflets
4. Recadrer l'image sur le texte

---

## 📞 Support

### Ressources
- 📚 [Documentation complète](README.md)
- 🐛 [Signaler un bug](https://github.com/MartyMcFLem/InlocStock_App/issues)
- 💬 Support Inloc : https://www.inloc.be/contact

### Logs de débogage

Pour obtenir des logs détaillés :

1. **Ouvrir la console** (F12)
2. **Activer le mode verbose** :
   ```javascript
   localStorage.setItem('debug', 'true');
   ```
3. **Recharger la page**
4. **Copier les logs** et les inclure dans votre rapport de bug

---

## ✅ Checklist post-installation

- [ ] Application accessible via HTTPS
- [ ] Service Worker enregistré
- [ ] Peut s'installer sur mobile
- [ ] API Inloc configurée
- [ ] Scanner fonctionne
- [ ] OCR fonctionne
- [ ] Mode hors ligne testé
- [ ] Synchronisation testée
- [ ] Logo et nom personnalisés

---

Besoin d'aide ? N'hésitez pas à ouvrir une issue sur GitHub ! 

👉 https://github.com/MartyMcFLem/InlocStock_App/issues
