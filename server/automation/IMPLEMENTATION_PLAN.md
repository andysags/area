# Plan d'implémentation des actions et réactions par service

Ce document liste les actions et réactions à implémenter (handlers dans `server/automation/hooks/actions/*.py` et `.../hooks/reactions/*.py`) pour chaque service du catalogue. Statut actuel: seul le couple `system.timer` (action) et `system.log` (réaction) est implémenté.

## System
- Actions:
  - timer — Implémenté (checker: `hooks/actions/timer.py`)
- Réactions:
  - log — Implémenté (executor: `hooks/reactions/log.py`)

## Google
- Actions (à implémenter):
  - gmail_new_email — Params: []
  - youtube_new_video — Params: channel_id:string
  - youtube_new_like — Params: []
- Réactions (à implémenter):
  - gmail_send_email — Params: to:string, subject:string, body:string

## GitHub
- Actions (à implémenter):
  - new_commit — Params: repository:string
  - new_issue — Params: repository:string
  - new_pull_request — Params: repository:string
- Réactions (à implémenter):
  - create_issue — Params: repository:string, title:string, body:string

## Discord
- Actions (à implémenter):
  - new_message — Params: channel_id:string
- Réactions (à implémenter):
  - send_message — Params: channel_id:string, content:string

## Spotify
- Actions (à implémenter):
  - new_saved_track — Params: []
- Réactions (à implémenter):
  - add_to_playlist — Params: playlist_id:string, track_uri:string

## Telegram
- Actions (à implémenter):
  - new_message — Params: chat_id:string
- Réactions (à implémenter):
  - send_message — Params: chat_id:string, text:string

## Twitter / X
- Actions (à implémenter):
  - new_tweet — Params: username:string
- Réactions (à implémenter):
  - post_tweet — Params: text:string

## WeatherAPI
- Actions (à implémenter):
  - temperature_change — Params: location:string
- Réactions:
  - (aucune)

## Notes d'implémentation
- Chaque action doit être enregistrée via `@register_action('<name>')` et retourner `bool` (déclencher ou non), en lisant `area.config_action` et les tokens utilisateur via `UserService` si nécessaire.
- Chaque réaction doit être enregistrée via `@register_reaction('<name>')` et exécuter l'effet, retournant un `dict` (ex: `{"ok": true, "detail": "..."}`) ou `str`.
- Récupération des tokens: `UserService.objects.get(user=area.user, service=...)` puis `get_access_token()`/`get_refresh_token()`.
- Erreurs doivent être remontées et seront journalisées dans `ExecutionLog`.
