# API Endpoints

Ce document décrit les endpoints actuels et ceux à implémenter côté serveur.

## Base URL
- **Backend** : `http://localhost:8080`

## Authentification (✅ Implémentés)
- `POST /auth/register/` : Inscription utilisateur
- `POST /auth/login/` : Connexion (retourne access + refresh tokens)
- `GET /auth/me/` : Profil utilisateur (authentifié)
- `POST /auth/refresh/` : Rafraîchir le token d'accès
- `POST /auth/password/reset/` : Demande de réinitialisation de mot de passe
- `POST /auth/password/reset/confirm/` : Confirmation de réinitialisation

## OAuth (✅ Implémentés)
- `POST /auth/oauth/link/` : Lie/actualise un compte OAuth tiers
  - Payload: `{ provider, external_user_id, access_token, refresh_token?, expires_at?, scopes? }`
- `GET /auth/oauth/accounts/` : Liste des comptes OAuth liés
- `DELETE /auth/oauth/accounts/{id}/` : Supprime un compte OAuth lié

## Métadonnées (✅ Implémenté)
- `GET /about.json` : Informations système et services
  - Retourne: `client.host`, `server.current_time`, `server.services[]`

## Services (✅ Implémentés)
- `GET /services/` : Liste des services disponibles
- `GET /services/subscriptions/` : Services auxquels l'utilisateur est abonné
- `POST /services/{id}/subscribe/` : S'abonner à un service

## AREA (✅ Implémentés)
- `GET /areas/` : Liste des AREAs de l'utilisateur
- `POST /areas/` : Créer une AREA
- `GET /areas/{id}/` : Détails d'une AREA
- `PATCH /areas/{id}/` : Mettre à jour une AREA
- `DELETE /areas/{id}/` : Supprimer une AREA

## Sécurité & Conventions
- **Auth** : Bearer JWT (djangorestframework-simplejwt)
- **CORS** : Configuré pour `localhost:8081`, `localhost:8084`, et autres origines de développement
- **Throttling** : 
  - Anonymous: 100/minute
  - Authenticated: 300/minute
  - Login: 10/minute
- **Erreurs** : Format standard DRF `{ detail: "message" }`
