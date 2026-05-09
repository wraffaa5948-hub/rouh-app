# Deploiement ROUH

## Neon PostgreSQL

1. Creer un projet Neon.
2. Copier l'URL PostgreSQL avec `sslmode=require`.
3. La placer dans `DATABASE_URL`.
4. Generer un secret long pour `SECRET_KEY`.

Les tables sont creees automatiquement au demarrage par SQLAlchemy. La migration SQL de reference est dans `migrations/001_initial_schema.sql`.

## Vercel serverless

Le projet est pret pour Vercel avec:

- `vercel.json`: toutes les requetes sont routees vers `api/index.py`.
- `pyproject.toml`: indique explicitement l'entrypoint Flask `api.index:app`.
- `web_mvc/views`: templates Flask.
- `web_mvc/assets`: CSS, JS et images servis par Flask sous `/static`.

Variables Vercel a definir dans Project Settings:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
SECRET_KEY=...
FLASK_ENV=production
SESSION_COOKIE_SECURE=true
```

## Backend Render ou Railway

Commande de demarrage:

```bash
gunicorn api.index:app
```

Variables:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
SECRET_KEY=...
FLASK_ENV=production
SESSION_COOKIE_SECURE=true
```

## Separation frontend/backend optionnelle

Si vous separez plus tard le frontend et le backend, configurez les appels `/api/*` vers l'URL Render/Railway avec une rewrite Vercel ou un proxy.
