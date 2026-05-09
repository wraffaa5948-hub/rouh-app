# ROUH Flask MVC + PostgreSQL Neon

ROUH est une application Flask MVC connectee a PostgreSQL Neon via SQLAlchemy. Le design et les parcours existants sont conserves: patient, medecin, infirmier, pharmacie, urgence et administration.

## Structure

```text
rouh-desktop/
|-- api/
|   `-- index.py
|-- controllers/
|   `-- app_controller.py
|-- models/
|   |-- data_model.py
|   `-- db_models.py
|-- services/
|-- migrations/
|-- web_mvc/
|   |-- PAGE_MAP.md
|   |-- views/
|   |   `-- index.html
|   `-- assets/
|       |-- assets/
|       |-- js/
|       `-- styles.css
|-- requirements.txt
|-- vercel.json
|-- pyproject.toml
`-- README.md
```

## Installation locale

```powershell
copy .env.example .env
pip install -r requirements.txt
python api/index.py
```

Puis ouvrez:

```text
http://127.0.0.1:8010
```

Pour Neon, remplacez `DATABASE_URL` dans `.env` par l'URL PostgreSQL Neon avec `sslmode=require`. Au premier lancement, les tables sont creees automatiquement et les comptes de demonstration sont importes en base.

## API principale

- `POST /register` / `POST /api/register`
- `POST /login` / `POST /api/login`
- `POST /logout` / `POST /api/logout`
- `GET /dashboard` / `GET /api/dashboard`
- `GET|POST /appointments`
- `GET|POST /prescriptions`
- `GET|POST /messages`

## Deploiement

Vercel est configure via `vercel.json` et `pyproject.toml`.

Toutes les requetes sont routees vers `api/index.py`, et Flask sert les vues depuis `web_mvc/views` et les assets depuis `web_mvc/assets`.

## Trouver le fichier d'une page

Ouvrez `web_mvc/PAGE_MAP.md`. Ce fichier indique pour chaque page du menu:

- le nom technique de la page;
- le fichier responsable;
- la fonction JavaScript responsable.

## Comptes fictifs

| Role | Email | Telephone | Mot de passe |
|---|---|---|---|
| Admin | admin@rouh.ma | 06 10 00 00 01 | admin123 |
| Patient | ahmed.benali@rouh.ma | 06 12 34 56 78 | patient123 |
| Medecin | karim.benali@rouh.ma | 06 22 44 66 88 | doctor123 |
| Infirmier | fatima.zahra@rouh.ma | 06 32 21 10 00 | nurse123 |
| Pharmacie | contact@pharmaciecentrale.ma | 05 22 33 44 55 | pharmacy123 |
| Urgence | urgence.admin@rouh.ma | 06 12 34 56 78 | emergency123 |
