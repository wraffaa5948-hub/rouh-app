# Architecture MVC ROUH Flask

```text
rouh-desktop/
|-- api/
|   `-- index.py              # Application Flask compatible Vercel
|-- app.py                    # Point d'entree Flask detecte par Vercel
|-- controllers/
|   `-- app_controller.py     # Controleur MVC
|-- models/
|   |-- data_model.py         # Donnees demo
|   `-- db_models.py          # Modeles SQLAlchemy PostgreSQL
|-- services/                 # Services backend decoupes par responsabilite
|-- web_mvc/
|   |-- PAGE_MAP.md           # Carte simple page -> fichier -> fonction
|   |-- views/
|   |   `-- index.html        # Template Flask
|   `-- assets/
|       |-- assets/           # Images
|       |-- js/               # MVC frontend
|       `-- styles.css        # Styles
|-- requirements.txt
|-- vercel.json
|-- pyproject.toml
`-- README.md
```

## Modele

`models/db_models.py` contient les tables SQLAlchemy connectees a PostgreSQL Neon.

`models/data_model.py` contient les donnees de demonstration utilisees pour initialiser la base si elle est vide.

## Controleur

`controllers/app_controller.py` reste la facade MVC appelee par Flask. Il delegue maintenant vers des sous-fichiers Python pour rendre les modifications plus simples:

- `services/bootstrap_service.py`: initialisation demo et payload principal.
- `services/account_service.py`: inscription, connexion, profil et mot de passe oublie.
- `services/medical_service.py`: rendez-vous, ordonnances, dossiers, messages, pharmacie et urgences.
- `services/status_service.py`: changements de statut.
- `services/email_service.py`: envoi du code de reinitialisation par email.

## Vue

`web_mvc/views/index.html`, `web_mvc/assets/styles.css` et `web_mvc/assets/js/` construisent l'experience utilisateur sans changer le design ROUH.

Le JavaScript est organise par responsabilite:

- `web_mvc/assets/js/models/`: etat local, menus et selecteurs de donnees.
- `web_mvc/assets/js/controllers/`: authentification, navigation et actions utilisateur.
- `web_mvc/assets/js/views/`: pages, composants HTML et carte des pages.
- `web_mvc/assets/js/services/`: appels API et generation PDF.
- `web_mvc/assets/js/utils/`: icones, formatage, badges, avatars et helpers DOM.

## Trouver le fichier responsable d'une page

La methode simple est:

1. Ouvrir `web_mvc/PAGE_MAP.md`.
2. Chercher le nom de la page.
3. Ouvrir le fichier et la fonction indiques.

La meme carte existe en JavaScript dans `web_mvc/assets/js/views/page_map.js`.

## Icones

Toutes les icones de l'application sont centralisees dans `web_mvc/assets/js/utils/icons.js`.
