# Configuration du Serveur Mobile - AREA

## Fonctionnalité

L'application mobile AREA permet maintenant aux utilisateurs de configurer l'URL du serveur backend directement depuis l'application.

## Accès

**Menu → Paramètres** (disponible pour les utilisateurs connectés)

## Fonctionnalités

### 1. Configuration de l'URL
- Champ de saisie pour l'URL du serveur
- Validation du format URL (http:// ou https://)
- Sauvegarde persistante dans AsyncStorage

### 2. Test de Connexion
- Bouton "Tester la connexion"
- Vérifie l'accessibilité du serveur via `/about.json`
- Affiche le nombre de services disponibles

### 3. Réinitialisation
- Bouton "Réinitialiser par défaut"
- Restaure l'URL par défaut selon la plateforme :
  - Android: `http://10.0.2.2:8080`
  - iOS: `http://localhost:8080`
  - Web: `http://localhost:8080`

## Utilisation

### Configuration initiale
1. Ouvrir l'application
2. Se connecter
3. Menu → Paramètres
4. Saisir l'URL du serveur (ex: `http://192.168.1.100:8080`)
5. Cliquer sur "Tester la connexion"
6. Si OK, cliquer sur "Enregistrer"
7. Redémarrer l'application

### Exemples d'URLs valides
```
http://localhost:8080    (Backend)
http://localhost:8081    (Mobile Web)
http://localhost:8084    (Frontend Web)
http://10.0.2.2:8080     (Android Emulator -> Backend)
https://api.area.example.com
```

## Architecture Technique

### Fichiers modifiés/créés

#### `mobile/src/config/env.ts`
- Classe `Config` avec méthodes :
  - `init()` - Charge l'URL depuis AsyncStorage
  - `setApiUrl(url)` - Sauvegarde une nouvelle URL
  - `resetToDefault()` - Réinitialise à la valeur par défaut
  - `getDefaultUrl()` - Retourne l'URL par défaut

#### `mobile/src/screens/Settings.tsx`
- Écran de configuration avec :
  - Input pour l'URL
  - Bouton Enregistrer
  - Bouton Tester la connexion
  - Bouton Réinitialiser
  - Affichage de l'URL par défaut

#### `mobile/src/api/client.ts`
- Utilise `config.apiUrl` au lieu de `config.apiBaseUrl`
- Initialise le config avant chaque requête

#### `mobile/src/components/Header.tsx`
- Ajout du menu "Paramètres" pour utilisateurs connectés

#### `mobile/App.tsx`
- Ajout de la route Settings

## Persistance

L'URL configurée est sauvegardée dans AsyncStorage avec la clé `api_base_url` et persiste entre les redémarrages de l'application.

## Notes

- **Redémarrage requis** : Après modification de l'URL, il est recommandé de redémarrer l'application pour que tous les composants utilisent la nouvelle URL
- **Validation** : L'URL doit commencer par `http://` ou `https://`
- **Sécurité** : En production, privilégier HTTPS
