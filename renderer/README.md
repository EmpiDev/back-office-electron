# Renderer React + Vite + TypeScript

Cette application utilise Vite + React + TypeScript avec une architecture modulaire.

## Structure générale

  - `dashboard/` : vue d'ensemble et statistiques.
    - `hooks/` : logique et data-fetching (`useDashboardStats.ts`).
    - `components/` : composants UI découpés (`StatCard.tsx`, `RecentProducts.tsx`).
    - `pages/` : orchestration (`DashboardPage.tsx`).
  - `products/` : gestion des produits.
    - `hooks/` : logique métier complexe (`useProducts.ts`).
    - `components/` : formulaires et dialogues (`ProductFormDialog.tsx`).
    - `pages/` : page principale (`ProductsPage.tsx`, `ShowcasePage.tsx`).
  - `services/`, `users/`, `tags/` : structure similaire (`hooks/`, `components/`, `pages/`).
  - `shared/` : éléments génériques.
    - `components/`
      - `DataTable/` : Tableau générique (MUI) avec support d'actions.

- `services/` : couche métier / données (API, stockage, etc.)
  - *Les services spécifiques à chaque domaine (products, services, users) seront ajoutés ici si nécessaire pour isoler la logique complexe.*

- `config/` : configuration applicative (ex. `appConfig.js`).
- `locales/` : Fichiers de traduction (`en.json`, `fr.json`).
- `types/` : types globaux (par ex. `electron-api.d.ts` pour `window.electronApi`).

## Fonctionnalités Clés

### Internationalisation (i18n)
- L'application utilise `i18next` et `react-i18next`.
- Les traductions sont stockées dans `src/locales/`.
- Un bouton dans la barre de navigation permet de basculer instantanément entre Français et Anglais.
- Les hooks `useTranslation` sont utilisés dans les composants pour l'affichage dynamique des textes.

### Composants Partagés
- **DataTable** : Un tableau standardisé utilisé par les modules `products`, `services` et `users` pour afficher les listes, assurant une cohérence visuelle et fonctionnelle (affichage des colonnes, bouton supprimer, message "aucune donnée").

## Principes d'architecture

1. **Composants auto-contenus**

Chaque composant vit dans son propre dossier qui regroupe :
- le composant (`*.tsx`),
- ses styles (`*.styles.ts` ou `*.module.css`),
- ses types (`*.types.ts`),
- ses tests (`*.test.tsx`).


2. **Architecture View / Logic (Hooks)**

Pour éviter les "God Components", la logique est extraite des pages :
- **Pages (`pages/`)** : Composants "Container" qui ne font que de l'orchestration. Ils appellent les hooks et passent les données aux composants de présentation.
- **Hooks (`hooks/`)** : Contiennent toute la logique d'état, les appels API (`window.electronApi`), et les règles métier (ex: `useProducts`).
- **Composants (`components/`)** : Composants de présentation purs (reçoivent des props, affichent l'UI). Ex: formulaires, dialogues.

3. **Services séparés de la UI**

Les services sont rassemblés dans `services/` et ne dépendent jamais des composants. Ils :

- exposent la logique métier,
- définissent leurs propres types (DTO, payloads…),
- disposent de leurs tests dédiés.

4. **Modules et Shared**

- `modules/*` regroupe les fonctionnalités par domaine (ex: `products`, `services`) ainsi que le code partagé.
- `modules/shared` contient les briques UI et utilitaires réutilisables partout.

5. **Flux typique**

- une page (ex. `ProductsPage`) instancie un hook (ex. `useProducts`),
- le hook appelle l'API Electron (`window.electronApi`) pour récupérer des données,
- l'API Electron communique avec le processus main qui interagit avec la base de données SQLite,
- la page récupère ces données via le hook et les affiche via des composants spécialisés (comme `DataTable` ou `ProductFormDialog`),
- les tests valident séparément le rendu et la logique.

Cette organisation vise à :

- faciliter la navigation dans le code,
- encourager la réutilisation des composants et services,
- garder une séparation claire entre UI et logique métier.

## Tests

Les tests sont exécutés avec **Vitest** et **React Testing Library**.

### Lancer les tests
```bash
npm test
```

### Stratégie de test
- **Tests d'Intégration (Pages)** : Les fichiers `*.test.tsx` situés dans les `pages/` valident l'intégration complète.
    - L'API Electron (`window.electronApi`) est mockée (simulée) pour ne pas dépendre du backend réel.
    - On vérifie que la page charge les données, affiche les éléments UI, et réagit aux interactions (clics, formulaires).
- **Tests Unitaires** : Peuvent être utilisés pour tester des fonctions utilitaires ou des hooks complexes isolément.

