# Deploiement ROUH

## Neon PostgreSQL

1. Creer un projet Neon.
2. Copier l'URL PostgreSQL avec `sslmode=require`.
3. La placer dans `DATABASE_URL`.
4. Generer un secret long pour `SECRET_KEY`.

Les tables sont creees automatiquement au demarrage par SQLAlchemy. La migration SQL de reference est dans `migrations/001_initial_schema.sql`.

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

## Frontend Vercel

Le projet actuel reste compatible Vercel via `vercel.json`. Pour une separation frontend/backend stricte, configurer les appels `/api/*` vers l'URL Render/Railway avec une rewrite Vercel ou un proxy.
