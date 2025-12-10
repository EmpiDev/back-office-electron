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

## Flux de Données Typique (Ex: Création d'un Produit)
1. L'utilisateur remplit le formulaire sur la page `ProductsPage`.
2. Le composant React appelle `window.electron.createProduct(data)`.
3. Le message transite via IPC vers le processus principal.
4. Le `IPC Main Handler` reçoit la demande.
5. Le handler exécute la requête `INSERT` SQL dans la base SQLite.
6. Le résultat (succès/erreur) est renvoyé via IPC au composant React.
7. L'UI se met à jour.
