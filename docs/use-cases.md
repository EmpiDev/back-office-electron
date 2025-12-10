# Cas d'Utilisation

Ce document décrit les fonctionnalités principales de l'application Back-Office Cyna.

## 1. Gestion des Utilisateurs (`/users`)
- **Visualiser** la liste des utilisateurs de l'application.
- **Ajouter** un nouvel utilisateur (login, mot de passe hashé, rôle).
- **Modifier** un utilisateur existant.
- **Supprimer** un utilisateur.
- **Rôles** : Gestion des permissions (ex: admin, utilisateur).

## 2. Gestion des Services (`/services`)
Les services représentent les briques fonctionnelles élémentaires (ex: "Audit de sécurité", "Formation").
- **Visualiser** le catalogue des services existants.
- **Créer/Éditer/Supprimer** un service.
- **Catégoriser** les services via des Catégories.
- **Associer** des Tags aux services pour faciliter la recherche.

## 3. Gestion des Catégories (`/categories`)
Classement logique des services (ex: "Conseil", "Technique", "Formation").
- **CRUD** complet sur les catégories.

## 4. Gestion des Produits (`/products`)
Un produit est un ensemble commercialisable composé de plusieurs services (bundle).
- **Créer** un produit avec un nom, une description, un prix, et un type de paiement (ponctuel/mensuel).
- **Composer** le produit en sélectionnant des services existants et en définissant leur quantité/volume.
- **Associer** des Tags.

## 5. Gestion de la Vitrine (Showcase) (`/showcase`)
Configuration des éléments mis en avant sur le front-end client ou commercial.
- **Carousel** : Sélectionner les produits à afficher dans le carrousel principal.
- **Top Produits** : Marquer certains produits comme "Top Produits" pour une mise en avant spécifique.

## 6. Gestion des Tags (`/tags`)
Étiquettes transverses pour classifier Produits et Services.
- **CRUD** complet sur les tags.
