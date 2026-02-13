# 📦 InlocStock - Application PWA de Gestion de Stock

Application mobile Progressive Web App (PWA) pour la gestion de stock avec scanner de codes QR, codes-barres et extraction OCR de numéros de série.

## 🚀 Fonctionnalités

- ✅ **PWA complète** : Installation sur mobile, mode hors ligne
- 📷 **Scanner QR codes et codes-barres** : Utilise la caméra du téléphone
- 🔍 **OCR pour numéros de série** : Extraction automatique depuis des images
- 📊 **Tableau de bord** : Statistiques et vue d'ensemble du stock
- 📦 **Gestion des produits** : Ajout, modification, recherche
- 🔄 **Mouvements de stock** : Entrées et sorties avec historique
- 🔌 **Intégration API Inloc** : Synchronisation avec le système Inloc
- 💾 **Mode hors ligne** : Travail sans connexion avec synchronisation automatique
- 🎨 **Design moderne** : Interface Tailwind CSS responsive

## 📋 Prérequis

- Un serveur web (Apache, Nginx, ou serveur local)
- HTTPS (requis pour PWA et accès caméra) - peut utiliser localhost en développement
- Navigateur moderne supportant:
  - Service Workers
  - IndexedDB
  - Camera API
  - ES6+

## 🛠️ Installation

### 1. Cloner ou télécharger le projet

```bash
git clone https://github.com/MartyMcFLem/InlocStock_App.git
cd InlocStock_App
```

### 2. Configuration du serveur web

#### Apache
Créez un fichier `.htaccess` à la racine :

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

<Files "service-worker.js">
    Header set Service-Worker-Allowed "/"
    Header set Cache-Control "no-cache"
</Files>
```

#### Nginx
Ajoutez dans votre configuration :

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location = /service-worker.js {
    add_header Service-Worker-Allowed "/";
    add_header Cache-Control "no-cache";
}
```

### 3. Générer les icônes

Créez ou générez vos icônes dans le dossier `icons/` aux différentes tailles requises :
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Vous pouvez utiliser [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) :

```bash
npx pwa-asset-generator logo.png icons/ --padding "10%"
```

### 4. Configuration de l'API Inloc

1. Ouvrez l'application dans votre navigateur
2. Allez dans **Paramètres** (menu hamburger)
3. Configurez :
   - **URL de l'API** : `https://www.inloc.be/admin/api`
   - **Clé API / Token** : Votre token d'authentification Inloc

### 5. Installation sur mobile

#### Android
1. Ouvrez l'application dans Chrome
2. Menu ⋮ → "Ajouter à l'écran d'accueil"
3. L'application s'installe comme une app native

#### iOS
1. Ouvrez l'application dans Safari
2. Bouton Partager → "Sur l'écran d'accueil"
3. L'application s'installe

## 📱 Utilisation

### Scanner un code

1. Allez dans l'onglet **Scanner**
2. Choisissez :
   - **Scanner QR/Code-barres** : Pour scanner un code avec la caméra
   - **Scanner N° de série** : Pour extraire un numéro de série d'une photo
3. Pointez la caméra vers le code
4. Le produit s'affiche automatiquement

### Enregistrer un mouvement

1. Après avoir scanné un produit, cliquez sur :
   - **Entrée** : Pour ajouter du stock
   - **Sortie** : Pour retirer du stock
2. Entrez la quantité et une note optionnelle
3. Confirmez

### Mode hors ligne

L'application fonctionne sans connexion Internet :
- Les données sont stockées localement (IndexedDB)
- Les mouvements sont mis en attente
- Synchronisation automatique lors du retour en ligne

## 🔧 Structure du projet

```
InlocStock_App/
├── index.html              # Page principale
├── manifest.json          # Manifest PWA
├── service-worker.js      # Service Worker pour mode hors ligne
├── icons/                 # Icônes de l'application
│   └── icon-*.png
├── js/
│   ├── app.js            # Logique principale de l'application
│   ├── api.js            # Gestion de l'API Inloc
│   ├── scanner.js        # Scanner QR/codes-barres
│   ├── ocr.js            # OCR pour numéros de série
│   └── storage.js        # Gestion IndexedDB
└── README.md             # Documentation
```

## 🔌 Intégration API Inloc

L'application s'intègre avec l'API Inloc. Endpoints principaux utilisés :

### Authentification
```
POST /auth/login
```

### Produits
```
GET    /products              # Liste des produits
GET    /products/:id          # Détails d'un produit
GET    /products/search?code  # Recherche par code
POST   /products              # Créer un produit
PUT    /products/:id          # Modifier un produit
DELETE /products/:id          # Supprimer un produit
```

### Mouvements de stock
```
GET  /stock/movements         # Liste des mouvements
POST /stock/entry            # Enregistrer une entrée
POST /stock/exit             # Enregistrer une sortie
```

### Statistiques
```
GET /stats                   # Statistiques globales
```

> **Note** : L'API Inloc nécessite une authentification. Consultez la documentation officielle sur https://www.inloc.be/admin/api/documentation

## 🎨 Personnalisation

### Couleurs
Modifier les couleurs dans [index.html](index.html) (Tailwind CSS) :
- Couleur principale : `indigo-600` (remplacer par votre couleur)
- Thème : `#4F46E5` dans manifest.json

### Logo
Remplacez les icônes dans le dossier `icons/`

### Textes
Tous les textes sont dans [index.html](index.html) et peuvent être modifiés directement

## 🐛 Débogage

### Console du navigateur
Ouvrez les DevTools (F12) pour voir les logs :
```javascript
console.log('Messages de debug')
```

### Vérifier le Service Worker
Dans Chrome : `chrome://serviceworker-internals/`

### Vérifier IndexedDB
Dans les DevTools → Application → Storage → IndexedDB

### Tester hors ligne
Dans les DevTools → Network → "Offline"

## 🔒 Sécurité

- ✅ HTTPS obligatoire en production
- ✅ Token API stocké dans localStorage (à améliorer avec chiffrement)
- ✅ Validation des entrées utilisateur
- ⚠️ Ne pas exposer les clés API dans le code côté client

## 📚 Bibliothèques utilisées

- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Font Awesome](https://fontawesome.com/) - Icônes
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - Scanner QR/codes-barres
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une [issue](https://github.com/MartyMcFLem/InlocStock_App/issues)
- Contactez le support Inloc : https://www.inloc.be

## 🔄 Mises à jour

### Version 1.0.0 (2026-02-13)
- ✨ Version initiale
- 📱 PWA complète avec mode hors ligne
- 📷 Scanner QR codes et codes-barres
- 🔍 OCR pour numéros de série
- 📊 Tableau de bord et statistiques
- 🔄 Gestion des mouvements de stock

## 🎯 Roadmap

- [ ] Authentification utilisateur complète
- [ ] Export des données en CSV/Excel
- [ ] Rapports avancés et graphiques
- [ ] Support multi-langues
- [ ] Gestion des catégories de produits
- [ ] Photos de produits
- [ ] Alertes de stock faible
- [ ] Synchronisation en temps réel
- [ ] Mode multi-entrepôts
- [ ] Impression d'étiquettes

---

Fait avec ❤️ pour la gestion de stock efficace
