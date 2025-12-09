# Renderer React + Vite + TypeScript

Cette application utilise Vite + React + TypeScript avec une architecture modulaire.

## Structure générale

- `modules/` : modules fonctionnels et partagés
  - `jokes/` : module de gestion des blagues
    - `pages/`
      - `JokesPage.tsx` : page principale de gestion/affichage des blagues.
    - `components/`
      - `JokeForm/`
        - `JokeForm.tsx` : composant de formulaire pour créer une blague.
        - *(tests / styles / types spécifiques viendront se placer ici : `JokeForm.test.tsx`, `JokeForm.styles.ts`, `JokeForm.types.ts`, etc.)*
      - `JokeCard/`
        - `JokeCard.tsx` : composant d'affichage d'une blague sous forme de carte.
        - *(même logique : tests / styles / types co-localisés dans ce dossier)*
  - `shared/` : éléments génériques et réutilisables
    - `components/` : futurs composants transverses (ex : `ActionMenu/ActionMenu.tsx`…)

- `services/` : couche métier / données (API, stockage, etc.)
  - `jokes/`
    - `jokes.service.ts` : service de gestion des blagues (lecture, ajout, etc.).
    - `tests/` : tests unitaires du service (par ex. `jokes.service.test.ts`) à ajouter ici.

- `config/` : configuration applicative (ex. `appConfig.js`).
- `types/` : types globaux (par ex. `electron-api.d.ts` pour `window.electronApi`).

## Principes d'architecture

1. **Composants auto-contenus**

Chaque composant vit dans son propre dossier qui regroupe :
- le composant (`*.tsx`),
- ses styles (`*.styles.ts` ou `*.module.css`),
- ses types (`*.types.ts`),
- ses tests (`*.test.tsx`).

Exemple attendu :

```text
JokeCard/
  JokeCard.tsx
  JokeCard.styles.ts
  JokeCard.types.ts
  JokeCard.test.tsx
```

2. **Services séparés de la UI**

Les services sont rassemblés dans `services/` et ne dépendent jamais des composants. Ils :

- exposent la logique métier (ex : `getAllJokes`, `addJoke`, …),
- définissent leurs propres types (DTO, payloads…),
- disposent de leurs tests dédiés dans `services/<domaine>/tests`.

Exemple :

```text
services/
  jokes/
    jokes.service.ts
    jokes.service.types.ts
    tests/
      jokes.service.test.ts
```

3. **Modules et Shared**

- `modules/*` regroupe les fonctionnalités par domaine (ex: `jokes`) ainsi que le code partagé.
- `modules/shared` contient les briques UI et utilitaires réutilisables partout (boutons, menus, hooks outils, helpers…).

4. **Flux typique**

- une page (ex. `JokesPage`) appelle un service (`jokes.service`) pour récupérer des données,
- le service interagit avec la source de données (fichier JSON local, API, etc.),
- la page passe ces données typées aux composants (`JokeCard`, `JokeForm`),
- les tests valident séparément :
  - le rendu/interactions des composants,
  - la logique métier des services.

Cette organisation vise à :

- faciliter la navigation dans le code,
- encourager la réutilisation des composants et services,
- garder une séparation claire entre UI et logique métier.
