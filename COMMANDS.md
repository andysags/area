# Commandes de démarrage et d’usage

Ce document liste les commandes à exécuter pour construire, lancer et utiliser le projet.

## Orchestration Docker

```bash
# Construire les images
docker-compose build

# Lancer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f server

docker-compose logs -f client_mobile

# Redémarrer un service spécifique
docker-compose restart server

# Arrêter
docker-compose down

# Nettoyer l'espace Docker (si nécessaire)
docker system prune -f
```

Accès :

- **Backend API** : `http://localhost:8080/`
- **Frontend Web** : `http://localhost:8081/`
- **APK Android** : `http://localhost:8081/client.apk`
- **Adminer (DB)** : `http://localhost:8082/`
- **Database** : `localhost:5433` (PostgreSQL)

## Lancer le serveur en local (hors Docker)

```bash
cd server

# Migrer la base
python manage.py makemigrations accounts
python manage.py migrate

# Démarrer le serveur (port 8080)
python manage.py runserver 0.0.0.0:8080
```

## Tests

```bash
cd server
python manage.py test accounts -v 2
```

## Appels API (exemples)

```bash
# Inscription
curl -X POST http://localhost:8080/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Aa1!aaaa"}'

# Connexion
curl -X POST http://localhost:8080/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Aa1!aaaa"}'

# Profil
curl -X GET http://localhost:8080/auth/me/ \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Refresh
curl -X POST http://localhost:8080/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"REFRESH_TOKEN"}'

# Lier compte OAuth
curl -X POST http://localhost:8080/auth/oauth/link/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -d '{"provider":"github","external_user_id":"12345","access_token":"TOKEN","expires_at":1735689600,"scopes":["read:user"]}'

# Lister comptes OAuth
curl -X GET http://localhost:8080/auth/oauth/accounts/ \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Supprimer compte OAuth
curl -X DELETE http://localhost:8080/auth/oauth/accounts/ACCOUNT_ID/ \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Notes

- `about.json` côté serveur est implémenté et accessible sur `/about.json`.
- Le volume partagé `apk_volume` permet à `client_mobile` de déposer `client.apk` afin que `client_web` le serve.
- Les quotas de throttling DRF sont configurés (voir `server/area_server/settings.py`).
- CORS est configuré pour permettre les requêtes depuis `localhost:8081` et autres origines de développement.
- Pour un build Android complet, prévoir 15-20 minutes et 5GB+ d'espace disque.
