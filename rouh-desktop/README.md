# ROUH Flask MVC

ROUH est une application Flask MVC prete pour Vercel. Le design et les parcours existants sont conserves: patient, medecin, infirmier, pharmacie, urgence et administration.

## Structure

```text
rouh-desktop/
|-- api/
|   `-- index.py
|-- controllers/
|   `-- app_controller.py
|-- models/
|   `-- data_model.py
|-- templates/
|   `-- index.html
|-- static/
|   |-- assets/
|   |-- js/
|   `-- styles.css
|-- requirements.txt
|-- vercel.json
`-- README.md
```

## Installation locale

```powershell
pip install -r requirements.txt
python api/index.py
```

Puis ouvrez:

```text
http://127.0.0.1:8010
```

## Deploiement Vercel

1. Poussez ce dossier sur GitHub.
2. Importez le projet dans Vercel.
3. Vercel utilise `vercel.json` et `api/index.py` automatiquement.

## Comptes fictifs

| Role | Email | Telephone | Mot de passe |
|---|---|---|---|
| Admin | admin@rouh.ma | 06 10 00 00 01 | admin123 |
| Patient | ahmed.benali@rouh.ma | 06 12 34 56 78 | patient123 |
| Medecin | karim.benali@rouh.ma | 06 22 44 66 88 | doctor123 |
| Infirmier | fatima.zahra@rouh.ma | 06 32 21 10 00 | nurse123 |
| Pharmacie | contact@pharmaciecentrale.ma | 05 22 33 44 55 | pharmacy123 |
| Urgence | urgence.admin@rouh.ma | 06 12 34 56 78 | emergency123 |

