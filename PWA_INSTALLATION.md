# Installation de la PWA InlocStock

## Pourquoi le mode plein écran ne fonctionne pas dans le navigateur ?

Le mode **standalone** (sans barre d'URL du navigateur) ne fonctionne **QUE** lorsque l'application est **installée sur l'écran d'accueil** de votre appareil. Si vous testez dans un navigateur classique, vous verrez toujours la barre d'adresse.

## Comment installer la PWA

### Sur Android (Chrome, Edge, Samsung Internet)

1. Ouvrez l'application dans votre navigateur
2. Appuyez sur le menu (⋮) en haut à droite
3. Sélectionnez **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**
4. Confirmez l'installation
5. L'icône apparaîtra sur votre écran d'accueil
6. Lancez l'app depuis cette icône → **Mode plein écran activé !**

### Sur iOS (Safari)

1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton **Partager** (□↑) en bas
3. Faites défiler et sélectionnez **"Sur l'écran d'accueil"**
4. Confirmez avec **"Ajouter"**
5. Lancez l'app depuis l'icône → **Mode plein écran activé !**

### Sur Windows (Edge, Chrome)

1. Ouvrez l'application dans votre navigateur
2. Cliquez sur l'icône d'installation (⊕) dans la barre d'adresse
3. Ou allez dans Menu → **"Installer InlocStock"**
4. Confirmez l'installation
5. Lancez l'app depuis le raccourci → **Mode plein écran activé !**

## Vérification

Une fois installée, l'application :
- ✅ N'aura plus de barre d'URL du navigateur
- ✅ La barre d'état système sera de couleur indigo (#4F46E5)
- ✅ Fonctionnera hors ligne
- ✅ Aura son propre raccourci
- ✅ S'ouvrira en plein écran comme une vraie application

## Mise à jour de la PWA

Après avoir modifié le code :
1. **Désinstallez** l'ancienne version (maintenez l'icône, puis "Désinstaller")
2. Videz le cache du navigateur (Ctrl+Shift+Delete)
3. Rechargez la page dans le navigateur (Ctrl+F5)
4. **Réinstallez** la PWA comme indiqué ci-dessus

## Dépannage

**Problème** : La barre du navigateur est toujours visible
**Solution** : Vous testez dans le navigateur. Installez l'application sur votre écran d'accueil.

**Problème** : La couleur de la barre d'état n'est pas la bonne
**Solution** : Désinstallez, videz le cache, et réinstallez la PWA.

**Problème** : L'application ne s'installe pas
**Solution** : Vérifiez que vous utilisez HTTPS (ou localhost) et que le manifest.json se charge correctement.
