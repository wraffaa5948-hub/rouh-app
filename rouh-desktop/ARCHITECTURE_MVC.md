# Architecture MVC ROUH Flask

```text
rouh-desktop/
|-- api/
|   `-- index.py              # Application Flask compatible Vercel
|-- controllers/
|   `-- app_controller.py     # Controleur MVC
|-- models/
|   `-- data_model.py         # Donnees demo
|-- templates/
|   `-- index.html            # Template Flask
|-- static/
|   |-- assets/               # Images
|   |-- js/                   # Vue JS decoupee
|   `-- styles.css            # Styles
|-- requirements.txt
|-- vercel.json
`-- README.md
```

## Modele

`models/data_model.py` contient la base fictive: comptes, patients, medecins, infirmiers, pharmacies, urgences, rendez-vous, prescriptions, soins, messages et activites.

## Controleur

`controllers/app_controller.py` expose le payload complet a la route Flask `/api/bootstrap`.

## Vue

`templates/index.html`, `static/styles.css` et `static/js/` construisent l'experience utilisateur sans changer le design ROUH.

Le JavaScript est organise par responsabilite:

- `models/`: etat local et selecteurs de donnees.
- `controllers/`: authentification, navigation et actions utilisateur.
- `views/`: pages et composants HTML.
- `services/`: generation et ouverture des PDF.
- `utils/`: icones, formatage, badges, avatars et helpers DOM.

## Icones

Toutes les icones de l'application sont centralisees dans `static/js/utils/icons.js`.

