# Carte des pages ROUH

Pour trouver rapidement le fichier responsable d'une page:

1. Regardez le nom de la page dans `web_mvc/assets/js/models/state.js`, variable `menus`.
2. Cherchez ce nom dans `web_mvc/assets/js/views/page_map.js`.
3. Ouvrez la fonction indiquee dans `web_mvc/assets/js/views/pages.js`.

## Pages

| Page dans le menu | Fichier responsable | Fonction responsable |
|---|---|---|
| `dashboard` | `web_mvc/assets/js/views/pages.js` | `dashboardPage(role)` |
| `requests` | `web_mvc/assets/js/views/pages.js` | `registrationRequestsPage()` ou `doctorRequestsPage()` |
| `users` | `web_mvc/assets/js/views/pages.js` | `usersPage()` |
| `appointments` | `web_mvc/assets/js/views/pages.js` | `patientAppointmentsPage()` |
| `medications` | `web_mvc/assets/js/views/pages.js` | `patientMedicationsPage()` |
| `homecare` | `web_mvc/assets/js/views/pages.js` | `patientHomecarePage()` |
| `records` | `web_mvc/assets/js/views/pages.js` | `recordsPage(role)` |
| `sos` | `web_mvc/assets/js/views/pages.js` | `sosPage()` |
| `smartwatch` | `web_mvc/assets/js/views/pages.js` | `smartwatchPage()` |
| `messages` | `web_mvc/assets/js/views/pages.js` | `messagesPage()` |
| `profile` | `web_mvc/assets/js/views/pages.js` | `profilePage()` |
| `teleconsultations` | `web_mvc/assets/js/views/pages.js` | `teleconsultationsPage()` |
| `schedule` | `web_mvc/assets/js/views/pages.js` | `schedulePage()` |
| `prescriptions` | `web_mvc/assets/js/views/pages.js` | `prescriptionsPage(role)` |
| `history` | `web_mvc/assets/js/views/pages.js` | `historyPage(role)` |
| `tasks` | `web_mvc/assets/js/views/pages.js` | `nurseTasksPage()` |
| `patients` | `web_mvc/assets/js/views/pages.js` | `nursePatientsPage()` |
| `alerts` | `web_mvc/assets/js/views/pages.js` | `emergencyAlertsPage()` |
| `interventions` | `web_mvc/assets/js/views/pages.js` | `interventionsPage()` |

## Responsabilites MVC

| Couche | Dossier | Role |
|---|---|---|
| Model backend | `models/` | Tables SQLAlchemy et donnees |
| Controller backend | `controllers/` | Logique metier Flask |
| View frontend | `web_mvc/views/` | Templates HTML Flask |
| Assets frontend | `web_mvc/assets/` | CSS, JS, images |
| Model frontend | `web_mvc/assets/js/models/` | Etat JS, menus, selecteurs |
| Controller frontend | `web_mvc/assets/js/controllers/` | Actions, auth, navigation |
| View frontend JS | `web_mvc/assets/js/views/` | Rendu des pages et composants |
| Services | `services/` et `web_mvc/assets/js/services/` | DB/auth/API/PDF |
