# 📁 Dossier API (Backend PHP - OPTIONNEL)

## ⚠️ Important pour GitHub Pages

Les fichiers PHP de ce dossier **ne sont PAS nécessaires** pour GitHub Pages car :
- GitHub Pages ne supporte **pas PHP** (uniquement HTML/CSS/JS)
- L'application fonctionne **100% côté client**
- Chaque utilisateur entre ses propres credentials

## 🔒 Sécurité

Ce dossier est **exclu de Git** (voir `.gitignore`) pour éviter d'exposer des credentials.

## 📋 Quand utiliser ces fichiers ?

Utilisez le backend PHP **uniquement si** :
- Vous voulez un proxy server pour cacher vos tokens API
- Vous hébergez sur votre propre serveur (pas GitHub Pages)
- Vous avez besoin de fonctionnalités backend

## 🚀 Pour GitHub Pages (recommandé)

**Ignorez ce dossier** et utilisez directement l'app frontend :
- Les utilisateurs entrent leurs credentials dans Paramètres
- Pas besoin de serveur PHP
- Tout fonctionne dans le navigateur

## 💻 Configuration pour serveur PHP (optionnel)

Si vous voulez utiliser le backend :

1. **Copiez le fichier exemple** :
   ```bash
   cp ../api-config.php.example ../api-config.php
   ```

2. **Éditez `api-config.php`** avec vos credentials

3. **Ne committez JAMAIS** `api-config.php` (déjà dans .gitignore)

4. **Modifiez `js/api.js`** pour utiliser votre proxy :
   ```javascript
   this.baseURL = '/api/index.php';
   ```

---

**Pour GitHub Pages : Ce dossier n'est pas utilisé. L'app fonctionne sans lui ! ✅**
