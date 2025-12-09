# Documentation des Données (Data Layer)

Ce dossier contient la couche d'accès aux données de l'application Back-Office Cyna. L'application utilise **SQLite** comme base de données locale.

## Structure du Dossier

- **`database.js`** : Point d'entrée de la base de données. Gère l'initialisation de la connexion SQLite, l'exécution du schéma, et les migrations automatiques.
- **`schema.js`** : Définit la structure des tables (DDL). Contient les requêtes `CREATE TABLE`.
- **`seeder.js`** : Script de peuplement de la base de données avec des données initiales (fixtures) pour le développement et les tests (Admin par défaut, catégories, services exemples).
- **`db-helper.js`** : Fonctions utilitaires (`dbRun`, `dbGet`, `dbAll`) encapsulant les callbacks de SQLite dans des Promises pour permettre l'utilisation de `async/await`.
- **`services/`** : Dossier contenant les modules de logique métier ("Services") qui interagissent avec la base de données.
    - `product.service.js` : Gestion des produits commerciaux.
    - `service.service.js` : Gestion des services unitaires (briques métier).
    - `user.service.js` : Gestion des utilisateurs et de l'authentification.

## Modèle de Données Principal

### Products (Produits Commerciaux)
Table : `products`
- `code`, `name`, `description`
- `price` (REAL) : Prix du produit.
- `payment_type` (TEXT) : Type de facturation ('one_time' ou 'monthly').
- `is_in_carousel`, `is_top_product` : Attributs de mise en avant.

### Services (Briques Métier)
Table : `services`
- `code`, `name`, `description`
- `unit` : Unité de comptage (Jours, Tickets...).
- `category_id` : Lien vers la table `categories`.

### Users (Utilisateurs)
Table : `users`
- `username`
- `password_hash`
- `role` ('admin', 'user')

## Utilisation

Le fichier `database.js` est appelé par le processus principal Electron (`main.js`). Il initialise la DB dans le dossier `userData` de l'application.

Pour ajouter une nouvelle entité :
1. Ajouter la table dans `schema.js`.
2. Créer un fichier de service dans `services/` (ex: `myentity.service.js`).
3. Ajouter des données initiales dans `seeder.js` (optionnel).
