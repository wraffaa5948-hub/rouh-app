# Organisation JavaScript ROUH

Ce dossier garde la logique de l'interface separee en sous-fichiers lisibles, sans modifier le comportement de l'application.

## models

- `state.js`: etat global, libelles, menus, titres et initialisation des donnees.
- `selectors.js`: fonctions qui filtrent les donnees par role ou par page.

## controllers

- `auth_controller.js`: connexion, inscription et choix du role.
- `shell_controller.js`: menu lateral, titre de page et routage interne.
- `page_actions_controller.js`: clics, formulaires, modales, messages, SOS, Bluetooth et sauvegardes.

## views

- `pages.js`: pages completes par role.
- `components.js`: tableaux, catalogues, cartes, formulaires, graphiques et listes.
- `page_map.js`: carte rapide page -> fichier -> fonction.

## services

- `api_service.js`: appels au backend Flask.
- `pdf_service.js`: generation, ouverture et nettoyage des PDF d'ordonnance.

## utils

- `icons.js`: registre central de toutes les icones.
- `formatters.js`: badges, libelles, avatars, initiales et helpers DOM.
