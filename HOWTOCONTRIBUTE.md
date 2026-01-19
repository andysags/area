# HOWTOCONTRIBUTE

Ce guide explique comment ajouter de nouveaux Services, Actions et Réactions à la plateforme.

## Principes
- La logique métier est côté serveur uniquement.
- Les clients web/mobile n’exposent que l’UI.
- Préférer l’intégration de bibliothèques existantes.

## Étapes d’ajout d’un Service
1. **Définir le Service**: clé (`key`), nom (`name`).
2. **Lister les Actions**: `actions[]` avec `name`, `description`, `config_schema`.
3. **Lister les Réactions**: `reactions[]` avec `name`, `description`, `config_schema`.
4. **Implémenter les handlers**:
   - Action: récupération des événements (polling ou webhook).
   - Réaction: exécution de l’action (appel API, webhook, etc.).
5. **Sécurité**: scopes minimaux, signature des webhooks, validation stricte de payloads.
6. **Tests**: unitaires et d’intégration.

## Modèles recommandés
- `Area` — lie une `action_key` et une `reaction_key` avec des configurations JSON.
- `EventLog` — journalise les exécutions (succès/échec, payload, timestamp).
- `ExecutionState` — curseurs pour le polling (éviter doublons).

## Moteur d’exécution
- **Polling**: planifier via scheduler, stocker le dernier événement vu.
- **Webhooks**: endpoint `POST /hooks/{service}`, vérifier signature, router vers AREA pertinentes.

## about.json
- Mettre à jour la liste des services/actions/réactions pour refléter le nouveau service.

## Processus de contribution
- Créer une branche de feature.
- Ajouter code + tests.
- Mettre à jour `API_ENDPOINTS.md` et `about.json`.
- Ouvrir une PR, passer les tests.
