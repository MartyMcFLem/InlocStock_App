# Génération des icônes

Pour générer automatiquement toutes les icônes nécessaires à partir du logo SVG :

## Option 1 : PWA Asset Generator (Recommandé)

```bash
# Installation
npm install -g pwa-asset-generator

# Génération (depuis la racine du projet)
pwa-asset-generator icons/logo.svg icons/ --favicon --padding "10%" --background "#4F46E5"
```

## Option 2 : ImageMagick

```bash
# Installation
# Ubuntu/Debian
sudo apt install imagemagick

# macOS
brew install imagemagick

# Windows
# Télécharger depuis https://imagemagick.org/

# Génération
convert icons/logo.svg -resize 72x72 icons/icon-72x72.png
convert icons/logo.svg -resize 96x96 icons/icon-96x96.png
convert icons/logo.svg -resize 128x128 icons/icon-128x128.png
convert icons/logo.svg -resize 144x144 icons/icon-144x144.png
convert icons/logo.svg -resize 152x152 icons/icon-152x152.png
convert icons/logo.svg -resize 192x192 icons/icon-192x192.png
convert icons/logo.svg -resize 384x384 icons/icon-384x384.png
convert icons/logo.svg -resize 512x512 icons/icon-512x512.png
```

## Option 3 : Script Bash automatique

Créer un fichier `generate-icons.sh` :

```bash
#!/bin/bash

sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"
do
    convert icons/logo.svg -resize ${size}x${size} icons/icon-${size}x${size}.png
    echo "✓ Généré icon-${size}x${size}.png"
done

echo "✅ Toutes les icônes ont été générées !"
```

Puis exécuter :
```bash
chmod +x generate-icons.sh
./generate-icons.sh
```

## Option 4 : Services en ligne

Téléversez votre logo SVG sur :
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

## Tailles requises

| Taille | Usage |
|--------|-------|
| 72x72 | Android petit |
| 96x96 | Android petit |
| 128x128 | Android moyen |
| 144x144 | Android moyen |
| 152x152 | iOS |
| 192x192 | Android standard (minimum PWA) |
| 384x384 | Android large |
| 512x512 | Android splash screen (minimum PWA) |

## Conseils

1. **Logo simple** : Fonctionne mieux en petite taille
2. **Contraste élevé** : Visible sur tous les fonds
3. **Pas de texte fin** : Illisible en petit
4. **Marge interne 10%** : Pour les icônes maskables
5. **Format PNG** : Transparent ou fond uni
6. **Optimisation** : Utiliser [TinyPNG](https://tinypng.com/) pour réduire la taille

## Vérification

Après génération, vérifier que vous avez :
```
icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

## Test

Valider vos icônes PWA sur :
- https://web.dev/measure/
- Lighthouse dans Chrome DevTools
