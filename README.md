# Cyna Back-Office

Application Back-Office pour la gestion des services, produits, utilisateurs et vitrine commerciale de Cyna.
Cette application est construite avec **Electron**, **React**, **TypeScript** et **SQLite**.

## Démarrage Rapide

### Prérequis
- Node.js
- npm

### Installation
```bash
npm install
```

### Lancement en développement
Pour lancer à la fois le processus Electron et le serveur de développement React :
```bash
npm run dev
```

##  Structure du Projet

- `electron/` : Code du processus principal Electron et gestion de la base de données SQLite.
- `renderer/` : Code de l'interface utilisateur (React + Vite).
- `docs/` : Documentation technique détaillée.

##  Documentation Technique

Pour plus de détails sur la conception de l'application, veuillez consulter le dossier `docs/` :

- [Cas d'utilisation (`docs/use-cases.md`)](./docs/use-cases.md)
- [Modèles de données (`docs/data-models.md`)](./docs/data-models.md)
- [Architecture (`docs/architecture.md`)](./docs/architecture.md)
