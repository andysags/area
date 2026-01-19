# CI/CD Setup - AREA Project

## 📋 Vue d'ensemble

Le projet AREA dispose maintenant d'une pipeline CI/CD complète avec GitHub Actions pour automatiser les tests, builds et déploiements.

---

## 🔄 Workflows Implémentés

### 1. Backend CI (`ci-backend.yml`)
**Déclencheurs :** Push sur `main`, `develop`, `feature/**` | Pull Requests

**Actions :**
- ✅ Lint avec flake8
- ✅ Vérification formatage avec black
- ✅ Tests unitaires avec coverage
- ✅ Upload coverage vers Codecov
- ✅ Service PostgreSQL pour tests

### 2. Frontend CI (`ci-frontend.yml`)
**Déclencheurs :** Push sur `main`, `develop`, `feature/**` | Pull Requests

**Actions :**
- ✅ Lint ESLint
- ✅ Type checking TypeScript
- ✅ Build Next.js

### 3. Build Docker (`build-docker.yml`)
**Déclencheurs :** Push sur `main` | Tags `v*.*.*` | Manuel

**Actions :**
- ✅ Build image `area-backend`
- ✅ Build image `area-frontend`
- ✅ Build image `area-hook-engine`
- ✅ Push vers GitHub Container Registry (ghcr.io)
- ✅ Tagging automatique (version, sha, branch)
- ✅ Cache Docker layers

### 4. Deploy Production (`deploy-production.yml`)
**Déclencheurs :** Tags `v*.*.*` | Manuel

**Actions :**
- ✅ Connexion SSH au serveur
- ✅ Pull code et images Docker
- ✅ Restart services avec docker-compose
- ✅ Run migrations Django
- ✅ Collect static files
- ✅ Health check
- ✅ Notification Slack (optionnel)

### 5. Security Scan (`security-scan.yml`)
**Déclencheurs :** Push sur `main`, `develop` | Pull Requests | Hebdomadaire

**Actions :**
- ✅ Scan vulnérabilités Docker (Trivy)
- ✅ Scan dépendances Python (Safety, Bandit)
- ✅ Scan dépendances npm (npm audit)
- ✅ Upload résultats vers GitHub Security

---

## 🔐 Secrets GitHub Requis

Pour activer tous les workflows, configurez ces secrets dans GitHub :

### Déploiement
```
DEPLOY_SSH_KEY       # Clé SSH privée pour déploiement
DEPLOY_HOST          # Hostname du serveur (ex: area.example.com)
DEPLOY_USER          # User SSH (ex: deploy)
DEPLOY_PATH          # Chemin sur serveur (ex: /opt/area)
```

### Optionnels
```
SLACK_WEBHOOK        # Webhook Slack pour notifications
API_URL              # URL API pour build frontend
```

---

## Utilisation

### Tests automatiques
Les tests s'exécutent automatiquement sur chaque push et pull request :
```bash
# Déclenché automatiquement par Git push
git push origin feature/my-feature
```

### Build Docker Images
```bash
# Sur push vers main
git push origin main

# Ou avec un tag
git tag v1.0.0
git push origin v1.0.0
```

### Déploiement Production
```bash
# Automatique avec tag
git tag v1.2.3
git push origin v1.2.3

# Ou manuel via GitHub Actions UI
```

---

## 📊 Monitoring

### Badges GitHub
Ajoutez ces badges dans votre README.md :

```markdown
![Backend CI](https://github.com/YOUR_ORG/G-DEV-500-COT-5-2-area-1/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/YOUR_ORG/G-DEV-500-COT-5-2-area-1/workflows/Frontend%20CI/badge.svg)
![Security Scan](https://github.com/YOUR_ORG/G-DEV-500-COT-5-2-area-1/workflows/Security%20Scan/badge.svg)
```

### Logs
- Consultez les logs dans l'onglet "Actions" de GitHub
- Coverage reports disponibles sur Codecov
- Security alerts dans l'onglet "Security"

---

## Configuration Serveur

### Prérequis serveur
```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Cloner le repo
git clone https://github.com/YOUR_ORG/G-DEV-500-COT-5-2-area-1.git /opt/area
cd /opt/area

# Créer .env
cp server/.env.example server/.env
# Éditer server/.env avec vos valeurs

# Premier déploiement
docker-compose up -d
docker-compose exec server python manage.py migrate
docker-compose exec server python manage.py createsuperuser
```

### SSH Key Setup
```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions"
cat ~/.ssh/id_ed25519.pub  # Ajouter au serveur

# Sur le serveur
echo "VOTRE_CLE_PUBLIQUE" >> ~/.ssh/authorized_keys
```

---

## 🔄 Workflow de Développement

### Branches
- `main` → Staging (auto-deploy)
- `production` → Production (tag deploy)
- `feature/*` → Développement (tests only)

### Process
1. Créer feature branch : `git checkout -b feature/my-feature`
2. Développer et commit
3. Push : `git push origin feature/my-feature`
4. ✅ Tests CI s'exécutent automatiquement
5. Créer Pull Request vers `main`
6. Après merge → Build et deploy staging
7. Tag version → Deploy production

---

## 📝 Maintenance

### Mettre à jour les workflows
```bash
# Éditer les workflows
vim .github/workflows/ci-backend.yml

# Commit et push
git add .github/workflows/
git commit -m "chore: update CI workflow"
git push
```

### Rollback
```bash
# SSH au serveur
ssh deploy@area.example.com

# Rollback Docker Compose
cd /opt/area
git checkout v1.0.0  # Version précédente
docker-compose pull
docker-compose up -d --force-recreate
```

---

## ✅ Checklist Post-Setup

- [ ] Configurer tous les secrets GitHub
- [ ] Tester workflow CI sur feature branch
- [ ] Vérifier build Docker images
- [ ] Configurer serveur de déploiement
- [ ] Tester déploiement staging
- [ ] Configurer notifications Slack (optionnel)
- [ ] Ajouter badges dans README
- [ ] Documenter process pour l'équipe
