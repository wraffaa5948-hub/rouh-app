# Deploiement ROUH

## Neon PostgreSQL

1. Creer un projet Neon.
2. Copier l'URL PostgreSQL avec `sslmode=require`.
3. La placer dans `DATABASE_URL`.
4. Generer un secret long pour `SECRET_KEY`.

Les tables sont creees automatiquement au demarrage par SQLAlchemy. La migration SQL de reference est dans `migrations/001_initial_schema.sql`.

## Vercel serverless

Le projet est pret pour Vercel avec:

- `app.py`: exporte l'objet Flask `app` pour la detection automatique Vercel.
- `api/index.py`: contient les routes Flask.
- `vercel.json`: reste minimal pour eviter les erreurs de pattern `functions`.
- `pyproject.toml`: indique explicitement l'entrypoint Flask `app:app`.
- `web_mvc/views`: templates Flask.
- `web_mvc/assets`: CSS, JS et images servis par Flask sous `/static`.

Variables Vercel a definir dans Project Settings:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
SECRET_KEY=...
FLASK_ENV=production
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=Lax
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact.rouh.ma@gmail.com
SMTP_PASSWORD=mot-de-passe-application-google
SMTP_FROM=contact.rouh.ma@gmail.com
```

Sans `DATABASE_URL`, l'application utilise SQLite en local. Sur Vercel, un SQLite temporaire dans `/tmp` permet d'eviter un crash de demarrage, mais les donnees ne sont pas persistantes. Pour une vraie application, gardez Neon PostgreSQL dans `DATABASE_URL`.

Au demarrage, `database.py` cree les tables manquantes et ajoute les petites colonnes attendues par l'application si une base Neon existe deja.

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
