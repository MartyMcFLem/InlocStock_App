# 🤝 Contribuer à InlocStock

Merci de votre intérêt pour contribuer à InlocStock ! Ce document vous guide pour proposer des améliorations.

## 📋 Comment contribuer

### 1. Signaler un bug

Si vous trouvez un bug :

1. Vérifiez qu'il n'a pas déjà été signalé dans les [Issues](https://github.com/MartyMcFLem/InlocStock_App/issues)
2. Créez une nouvelle issue avec :
   - **Titre clair** décrivant le problème
   - **Description détaillée** avec étapes pour reproduire
   - **Environnement** (navigateur, OS, version)
   - **Captures d'écran** si possible
   - **Messages d'erreur** de la console

**Template de bug** :
```markdown
## Description
[Description claire du bug]

## Étapes pour reproduire
1. Aller sur...
2. Cliquer sur...
3. Observer...

## Comportement attendu
[Ce qui devrait se passer]

## Comportement actuel
[Ce qui se passe réellement]

## Environnement
- OS : [ex: Windows 10]
- Navigateur : [ex: Chrome 120]
- Version app : [ex: 1.0.0]

## Logs console
```
[Copier les erreurs de la console ici]
```

## Captures d'écran
[Si applicable]
```

### 2. Proposer une fonctionnalité

Pour suggérer une nouvelle fonctionnalité :

1. Vérifiez la [Roadmap](README.md#roadmap)
2. Créez une issue "Feature Request"
3. Décrivez :
   - Le besoin / problème résolu
   - La solution proposée
   - Les alternatives envisagées
   - L'impact sur les utilisateurs

### 3. Contribuer du code

#### Workflow

1. **Fork** le projet
2. **Clonez** votre fork
   ```bash
   git clone https://github.com/VOTRE-USERNAME/InlocStock_App.git
   cd InlocStock_App
   ```

3. **Créez une branche** pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-fonctionnalite
   # ou
   git checkout -b fix/mon-correctif
   ```

4. **Développez** votre fonctionnalité

5. **Testez** vos modifications
   - Vérifiez que l'app fonctionne toujours
   - Testez sur plusieurs navigateurs
   - Testez en mode hors ligne
   - Testez sur mobile

6. **Committez** avec des messages clairs
   ```bash
   git add .
   git commit -m "✨ Ajout de la fonctionnalité X"
   ```

7. **Poussez** vers votre fork
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

8. **Créez une Pull Request**
   - Décrivez clairement vos changements
   - Référencez les issues liées
   - Ajoutez des captures d'écran si UI modifiée

## 📝 Conventions de code

### JavaScript

```javascript
// Utiliser const/let, pas var
const maConstante = 'valeur';
let maVariable = 'valeur';

// Noms de variables en camelCase
const nomDeVariable = 'valeur';

// Noms de classes en PascalCase
class MaClasse {
    constructor() {
        this.propriete = 'valeur';
    }
}

// Fonctions fléchées pour les callbacks
array.map(item => item.value);

// Commentaires clairs
/**
 * Description de la fonction
 * @param {string} param1 - Description
 * @returns {boolean} Description
 */
function maFonction(param1) {
    // ...
}

// Async/await pour les promesses
async function fetchData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur:', error);
    }
}
```

### HTML

```html
<!-- Indentation : 4 espaces -->
<!-- Attributs en minuscules -->
<!-- Classes Tailwind organisées -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
    <span class="text-gray-700">Contenu</span>
</div>

<!-- IDs en camelCase -->
<button id="monBouton">Cliquer</button>
```

### CSS (si nécessaire)

```css
/* Classes en kebab-case */
.ma-classe {
    property: value;
}

/* Utiliser Tailwind en priorité */
```

## 🧪 Tests

Avant de soumettre :

### Tests manuels

- [ ] Testé sur Chrome
- [ ] Testé sur Firefox
- [ ] Testé sur Safari (si possible)
- [ ] Testé sur mobile Android
- [ ] Testé sur mobile iOS (si possible)
- [ ] Mode hors ligne fonctionne
- [ ] Scanner fonctionne
- [ ] PWA installable
- [ ] Pas d'erreurs console

### Points de vérification

```javascript
// Console du navigateur (F12)
// Aucune erreur ne doit apparaître
console.log('✅ Pas d\'erreurs');

// Service Worker
navigator.serviceWorker.getRegistrations()
    .then(regs => console.log('SW:', regs));

// IndexedDB
// Application → Storage → IndexedDB doit contenir InlocStockDB
```

## 📚 Structure du projet

```
InlocStock_App/
├── index.html          # Page principale (UI)
├── manifest.json       # Configuration PWA
├── service-worker.js   # Cache et hors ligne
├── icons/             # Icônes app
├── js/
│   ├── app.js         # Logique principale
│   ├── api.js         # Communication API Inloc
│   ├── scanner.js     # Scanner QR/barcode
│   ├── ocr.js         # OCR numéros de série
│   └── storage.js     # IndexedDB
└── api/               # Backend PHP (optionnel)
    └── index.php      # Proxy API
```

## 🎨 Guide de style

### Messages utilisateur

```javascript
// ✅ Bon : Clair et actionnable
showToast('Produit ajouté avec succès', 'success');

// ❌ Mauvais : Vague
showToast('OK', 'success');
```

### Gestion d'erreurs

```javascript
// ✅ Bon : Détaillé et informatif
catch (error) {
    console.error('Erreur de chargement des produits:', error);
    showToast('Impossible de charger les produits. Vérifiez votre connexion.', 'error');
}

// ❌ Mauvais : Générique
catch (error) {
    console.log(error);
    alert('Erreur');
}
```

### Accessibilité

```html
<!-- ✅ Bon : Labels et ARIA -->
<button aria-label="Scanner un code QR" class="...">
    <i class="fas fa-qrcode"></i>
    <span>Scanner</span>
</button>

<!-- ❌ Mauvais : Pas de contexte -->
<button>
    <i class="fas fa-qrcode"></i>
</button>
```

## 🔄 Types de commits

Préfixes recommandés :

- ✨ `:sparkles:` - Nouvelle fonctionnalité
- 🐛 `:bug:` - Correction de bug
- 📝 `:memo:` - Documentation
- 🎨 `:art:` - Amélioration UI/UX
- ⚡ `:zap:` - Performance
- 🔒 `:lock:` - Sécurité
- ♻️ `:recycle:` - Refactoring
- ✅ `:white_check_mark:` - Tests
- 🔧 `:wrench:` - Configuration

Exemples :
```bash
git commit -m "✨ Ajout du filtre par catégorie"
git commit -m "🐛 Correction du scan en mode sombre"
git commit -m "📝 Mise à jour du README"
```

## 🚀 Publier une release

Pour les mainteneurs uniquement :

1. **Mettre à jour la version**
   - `manifest.json` → `version`
   - `service-worker.js` → `CACHE_NAME`
   - `README.md` → Version

2. **Créer un tag**
   ```bash
   git tag -a v1.0.1 -m "Version 1.0.1"
   git push origin v1.0.1
   ```

3. **Créer une release GitHub**
   - Aller sur Releases → New release
   - Sélectionner le tag
   - Rédiger le changelog
   - Publier

## 📞 Questions ?

- 💬 Ouvrez une [Discussion](https://github.com/MartyMcFLem/InlocStock_App/discussions)
- 📧 Contactez : [email]
- 🐛 Signalez un bug : [Issues](https://github.com/MartyMcFLem/InlocStock_App/issues)

## 📄 Code de conduite

Soyez respectueux, constructif et professionnel dans toutes vos interactions.

---

Merci pour votre contribution ! 🙏
