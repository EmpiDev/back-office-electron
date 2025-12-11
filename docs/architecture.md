# Architecture Technique

L'application suit une architecture classique **Electron + React** avec une base de données **SQLite** embarquée.

## Vue d'Ensemble

```mermaid
graph TD
    subgraph "Electron Main Process (Node.js)"
        Main[Main Entry Point]
        IPC_Main[IPC Handlers]
        DB[(SQLite Database)]
        
        Main --> IPC_Main
        IPC_Main <-->|SQL Queries| DB
    end

    subgraph "Renderer Process (Chromium/React)"
        UI[React App]
        Router[React Router]
        Pages[Pages (Modules)]
        IPC_Bridge[Context Bridge (window.electron)]
        
        UI --> Router
        Router --> Pages
        Pages <-->|Invoke| IPC_Bridge
    end

    IPC_Bridge <-->|IPC Channels (invoke/handle)| IPC_Main
```

## Composants Principaux

### 1. Processus Principal (Electron)
- **Rôle** : Point d'entrée de l'application, gestion des fenêtres natives, et accès au système de fichiers/OS.
- **Base de Données** : Gère la connexion directe au fichier SQLite local (via `better-sqlite3` ou `sqlite3`).
- **Communication** : Expose des "Handlers" IPC (Inter-Process Communication) pour répondre aux demandes du Front-End (ex: `get-conf-users`, `add-product`).

### 2. Processus de Rendu (React/Vite)
- **Rôle** : Interface utilisateur interactive.
- **Routing** : Utilise `react-router-dom` pour la navigation SPA (Single Page Application).
- **Modules** : Organisation du code par fonctionnalité (`modules/products`, `modules/services`, etc.) plutôt que par type technique.
- **Styles** : Utilisation de CSS standard ou modulaire.

### 3. IPC Bridge (Preload Script)
- Sécurise la communication entre le rendu (web) et le main (node).
- Expose une API typée (`window.electron`) qui permet au React d'appeler des fonctions backend sans accès direct à Node.js.

## Organisation du Backend (Data Layer)

Le dossier `electron/data/` concentre la logique d'accès aux données et la gestion de la base SQLite.

### Structure des Fichiers

- **`database.js`** : Point d'entrée. Initialise la connexion, crée les tables et gère les migrations.
- **`schema.js`** : Contient les définitions SQL des tables (`CREATE TABLE`).
- **`seeder.js`** : Script de peuplement (fixtures) pour l'initialisation (Admin, données de test).
- **`db-helper.js`** : Utilitaires (`dbRun`, `dbGet`, `dbAll`) transformant les callbacks SQLite en Promises.
- **`services/`** : Modules de logique métier (ex: `product.service.js`, `user.service.js`).

### Guide : Ajouter une nouvelle entité

1. **Schéma** : Ajouter la définition de la table dans `electron/data/schema.js`.
2. **Service** : Créer un fichier de service dans `electron/data/services/` (ex: `new-entity.service.js`).
3. **Seeder** : Ajouter des données initiales dans `electron/data/seeder.js` (optionnel).
4. **IPC** : Exposer les méthodes via IPC dans `electron/main.js` pour qu'elles soient accessibles par le frontend.

## Flux de Données Typique (Ex: Création d'un Produit)
1. L'utilisateur remplit le formulaire sur la page `ProductsPage`.
2. Le composant React appelle `window.electron.createProduct(data)`.
3. Le message transite via IPC vers le processus principal.
4. Le `IPC Main Handler` reçoit la demande.
5. Le handler exécute la requête `INSERT` SQL dans la base SQLite.
7. L'UI se met à jour, affichant une notification de succès ou d'erreur basée sur le code retourné.

## Standard de Réponse IPC

Pour garantir une gestion uniforme des erreurs et des notifications, toutes les méthodes IPC retournent un objet standardisé `ApiResponse<T>` :

```typescript
interface ApiResponse<T> {
  success: boolean;  // Indique si l'opération a réussi
  code: number;      // Code statut (similaire HTTP) : 200 (OK), 400 (Bad Request), 500 (Server Error)
  data: T;           // Les données demandées (si succès)
  error?: string;    // Message d'erreur (si échec)
}
```

## Système de Notification

L'application utilise un système de notification piloté par les codes retour du backend :
- **Backend (Electron)** : Génère un code statut (par défaut 200 ou 500, personnalisable par les services).
- **Frontend (React)** : Un `NotificationContext` global intercepte les réponses.
    - Code **2xx** -> Notification de succès (Vert).
    - Code **4xx** -> Notification d'avertissement (Orange).
    - Code **5xx** -> Notification d'erreur (Rouge).

Cela permet de centraliser la logique de feedback utilisateur et de garder le code des composants propre.
