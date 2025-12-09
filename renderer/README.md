# Renderer React + Vite + TypeScript

Cette application utilise Vite + React + TypeScript avec une architecture modulaire.

## Structure générale

- `modules/` : modules **fonctionnels** et partagés
  - `products/` : module de gestion des produits
    - `pages/`
      - `ProductsPage.tsx` : page principale de gestion/affichage des produits.
  - `services/` : module de gestion des services
    - `pages/`
      - `ServicesPage.tsx` : page principale de gestion/affichage des services.
  - `users/` : module de gestion des utilisateurs
    - `pages/`
      - `UsersPage.tsx` : page principale de gestion/affichage des utilisateurs.
  - `debug/` : module de debug
    - `pages/`
      - `DebugPage.tsx` : page pour le debug de la base de données.
  - `shared/` : éléments génériques et réutilisables
    - `components/` : futurs composants transverses (ex : `ActionMenu/ActionMenu.tsx`…)

- `services/` : couche métier / données (API, stockage, etc.)
  - *Les services spécifiques à chaque domaine (products, services, users) seront ajoutés ici si nécessaire pour isoler la logique.*

- `config/` : configuration applicative (ex. `appConfig.js`).
- `types/` : types globaux (par ex. `electron-api.d.ts` pour `window.electronApi`).

## Principes d'architecture

1. **Composants auto-contenus**

Chaque composant vit dans son propre dossier qui regroupe :
- le composant (`*.tsx`),
- ses styles (`*.styles.ts` ou `*.module.css`),
- ses types (`*.types.ts`),
- ses tests (`*.test.tsx`).

2. **Services séparés de la UI**

Les services sont rassemblés dans `services/` et ne dépendent jamais des composants. Ils :

- exposent la logique métier,
- définissent leurs propres types (DTO, payloads…),
- disposent de leurs tests dédiés.

3. **Modules et Shared**

- `modules/*` regroupe les fonctionnalités par domaine (ex: `products`, `services`) ainsi que le code partagé.
- `modules/shared` contient les briques UI et utilitaires réutilisables partout (boutons, menus, hooks outils, helpers…).

4. **Flux typique**

- une page (ex. `ProductsPage`) appelle l'API Electron (`window.electronApi`) pour récupérer des données,
- l'API Electron communique avec le processus main qui interagit avec la base de données SQLite,
- la page récupère ces données et les affiche via des composants,
- les tests valident séparément le rendu et la logique.

Cette organisation vise à :

- faciliter la navigation dans le code,
- encourager la réutilisation des composants et services,
- garder une séparation claire entre UI et logique métier.