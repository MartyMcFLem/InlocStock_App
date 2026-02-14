# Dossier CSS - InlocStock

## Structure

Ce dossier contient les feuilles de styles de l'application.

### Fichiers

- **styles.css** : Feuille de styles principale contenant :
  - Variables CSS (safe-area-insets, couleurs)
  - Styles de base (html, body)
  - Styles du header et navigation
  - Styles dark mode
  - Animations (slideIn, scan, spin)
  - Composants (scanner, loader)

## Organisation

Les styles sont organisés de manière modulaire :
1. Variables et configuration
2. Éléments de base
3. Layout (header, navigation, contenu)
4. Dark mode
5. Animations
6. Composants spécifiques

## Utilisation

Le fichier `styles.css` est inclus dans `index.html` :
```html
<link rel="stylesheet" href="css/styles.css">
```

## Notes importantes

- Les styles utilisent `env(safe-area-inset-*)` pour gérer les encoches des smartphones
- Le mode dark est géré via les classes `.dark` sur `html` et `body`
- Les couleurs principales sont :
  - Mode clair : `#4F46E5` (indigo-600)
  - Mode sombre : `#111827` (gray-900)
