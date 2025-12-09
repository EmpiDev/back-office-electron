const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table (for Services)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
-- Définition Métier : "Ce que Cyna fait concrètement : audit, SOC, CERT, formation, etc."
-- C’est la “brique fonctionnelle” de base, sans notion commerciale directe (pas de prix ici).
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    -- Unité de l'intervention (ex: 'Jours', 'Heures', 'Forfait', 'Ticket', 'Utilisateur')
    unit TEXT, 
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products Table
-- Définition Commerciale : "Ensemble packagé de services + un cadrage commercial (prix, durée, volume, options)"
-- C'est ce que l'on vend au client.
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    target_segment TEXT,
    -- Mise en avant
    is_in_carousel BOOLEAN DEFAULT 0,
    is_top_product BOOLEAN DEFAULT 0,
    price REAL,
    payment_type TEXT, -- 'one_time', 'monthly'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pricing Plans Table
-- Le cadrage commercial principal (Prix, Durée)
CREATE TABLE IF NOT EXISTS pricing_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- ex: "Standard", "Premium"
    price REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    billing_interval TEXT, -- ex: 'monthly', 'yearly', 'one-shot'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Options Table
-- Options additionnelles vendables avec un produit
CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    unit TEXT, -- ex: 'Jours supplémentaires', 'TB Stockage'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Join Table: Product <-> Service
-- "Ensemble packagé de services" + "Volume"
-- Définit QUELS services sont dans le produit et en QUELLE quantité (Volume).
CREATE TABLE IF NOT EXISTS product_services (
    product_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1, -- Le "Volume" inclus (ex: 5 Jours d'audit, 1 SOC Monitoring)
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, service_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Join Table: Product <-> Option
CREATE TABLE IF NOT EXISTS option_products (
    product_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, option_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
);

-- Join Table: Product <-> Tag
CREATE TABLE IF NOT EXISTS product_tags (
    product_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Join Table: Service <-> Tag
CREATE TABLE IF NOT EXISTS service_tags (
    service_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (service_id, tag_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
`;

module.exports = schema;
