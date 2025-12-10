# Modèles de Données

Ce document décrit le schéma de la base de données SQLite locale utilisée par l'application.

## Schéma Relationnel (ER Diagram)

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string password_hash
        string role
        datetime created_at
        datetime updated_at
    }

    CATEGORIES ||--|{ SERVICES : "contains"
    CATEGORIES {
        int id PK
        string name
        string description
    }

    SERVICES ||--|{ PRODUCT_SERVICES : "included in"
    SERVICES }|--|{ SERVICE_TAGS : "tagged with"
    SERVICES {
        int id PK
        string name
        string description
        int category_id FK
    }

    PRODUCTS ||--|{ PRODUCT_SERVICES : "composed of"
    PRODUCTS }|--|{ PRODUCT_TAGS : "tagged with"
    PRODUCTS {
        int id PK
        string name
        string description
        string target_segment
        boolean is_in_carousel
        boolean is_top_product
        real price
        string payment_type
    }

    TAGS }|--|{ SERVICE_TAGS : "tags"
    TAGS }|--|{ PRODUCT_TAGS : "tags"
    TAGS {
        int id PK
        string name
    }

    PRODUCT_SERVICES {
        int product_id PK, FK
        int service_id PK, FK
        int quantity "Volume included"
        int display_order
    }

    PRODUCT_TAGS {
        int product_id PK, FK
        int tag_id PK, FK
    }

    SERVICE_TAGS {
        int service_id PK, FK
        int tag_id PK, FK
    }
```

## Description des Entités

### Users
Comptes permettant l'accès au Back-Office.
- **role** : Définit les droits d'accès.

### Services
Briques de base de l'offre Cyna.
- **category_id** : Lien vers la catégorie.

### Categories
Classification des services.

### Products
Offres commerciales packagées.
- **is_in_carousel** / **is_top_product** : Booléens pour la gestion de l'affichage vitrine.
- **price** / **payment_type** : Informations de tarification.

### Product_Services (Table de liaison)
Définit la composition d'un produit.
- **quantity** : Combien d'unités du service sont incluses dans ce produit.

### Tags
Système de marquage flexible pour la recherche et le filtrage.
