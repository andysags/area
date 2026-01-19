# AREA Platform

Plateforme d'automatisation (type IFTTT/Zapier) composée de :

- `server` : Application serveur (Django/DRF) exposant une API REST sur `8080`.
- `client_web` : Client web (Next.js) exposé sur `8081`.
- `client_mobile` : Client mobile (React Native) - APK disponible via le web.

Les clients n'embarquent aucune logique métier; toute la logique est côté serveur.

## Architecture & Exigences

- Orchestration Docker via `docker-compose.yml`.
- Les services `client_web` et `client_mobile` partagent un volume (`apk_volume`) : l'APK construite par le mobile est servie par le web via `http://localhost:8081/client.apk`.
- Le serveur expose `GET /about.json` décrivant le client et la liste des services/actions/réactions (format requis par le sujet).
- CORS configuré pour permettre les requêtes cross-origin entre services.
- Accessibilité : respecter les bonnes pratiques dans les clients web et mobile.

## Installation & Lancement

Pré-requis :

- Docker + Docker Compose
- 5GB+ d'espace disque libre (pour builds Android complets)

Démarrage (mode projet):

```bash
docker-compose build
docker-compose up -d
```

Points d'accès :

- **Backend API** : `http://localhost:8080/`
- **Frontend Web** : `http://localhost:8081/`
- **APK Android** : `http://localhost:8081/client.apk`
- **Adminer (DB UI)** : `http://localhost:8082/`

## Services Docker

| Service | Port | Description |
|---------|------|-------------|
| `server` | 8080 | Backend Django/DRF |
| `client_web` | 8081 | Frontend Next.js |
| `client_mobile` | - | Build APK Android |
| `hook_engine` | - | Moteur d'automatisation |
| `db` | 5433 | PostgreSQL |
| `adminer` | 8082 | Interface DB |

## Documentation

- **API Endpoints** : Voir `API_ENDPOINTS.md`
- **Commandes** : Voir `COMMANDS.md`
- **CI/CD** : Voir `CICD.md`
- **Contribution** : Voir `HOWTOCONTRIBUTE.md`
- **Mobile Config** : Voir `mobile/SERVER_CONFIG.md`

## Tests

Les tests d'authentification et AREA sont disponibles côté serveur. Voir `COMMANDS.md` pour les commandes de test et d'exécution.

## Configuration

Variables d'environnement importantes (voir `server/.env.example`) :
- `DATABASE_URL` : Connexion PostgreSQL
- `DJANGO_SECRET_KEY` : Clé secrète Django
- OAuth credentials pour GitHub, Spotify, etc.
