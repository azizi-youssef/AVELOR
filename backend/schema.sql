-- =============================================================================
-- AVELOR LUXURY FASHION - SCHÉMA DE BASE DE DONNÉES POSTGRESQL (SUPABASE)
-- Ce script peut être exécuté directement dans le "SQL Editor" de Supabase
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUPPRESSION PREVENTIVE DES TABLES SI RE-EXECUTION (Optionnel)
-- DROP TABLE IF EXISTS audit_logs, payments, shipments, order_items, orders, coupon_redemptions, promotions, inventory_movements, product_variants, product_images, products, categories, addresses, users, campaigns CASCADE;
-- DROP TYPE IF EXISTS gender_universe, user_role, order_status, payment_status, payment_method, discount_type, inventory_reason CASCADE;

-- 3. TYPES ENUMS
DO $$ BEGIN
    CREATE TYPE gender_universe AS ENUM ('MEN', 'WOMEN', 'UNISEX');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH_ON_DELIVERY', 'ONLINE_CARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory_reason AS ENUM ('SALE', 'RESTOCK', 'RETURN', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. TABLE UTILISATEURS (USERS)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),
    role user_role DEFAULT 'CUSTOMER' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 5. TABLE ADRESSES (ADDRESSES)
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    postal_code VARCHAR(20),
    delivery_instructions TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_addresses_user_id ON addresses(user_id);

-- 6. TABLE CATEGORIES (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_fr VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    description_fr TEXT,
    description_ar TEXT,
    image_url VARCHAR(500),
    universe gender_universe DEFAULT 'UNISEX' NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS ix_categories_universe ON categories(universe);

-- 7. TABLE PRODUITS (PRODUCTS)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    short_desc_fr TEXT,
    short_desc_ar TEXT,
    description_fr TEXT,
    description_ar TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    universe gender_universe NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_new BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS ix_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS ix_products_universe ON products(universe);
CREATE INDEX IF NOT EXISTS ix_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS ix_products_is_active ON products(is_active);

-- 8. TABLE IMAGES PRODUITS (PRODUCT_IMAGES)
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    url VARCHAR(500) NOT NULL,
    alt_text_fr VARCHAR(255),
    alt_text_ar VARCHAR(255),
    is_cover BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_product_images_product_id ON product_images(product_id);

-- 9. TABLE VARIANTES PRODUITS (PRODUCT_VARIANTS)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(50) NOT NULL,
    color_name_fr VARCHAR(50) NOT NULL,
    color_name_ar VARCHAR(50) NOT NULL,
    color_code VARCHAR(20) NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS ix_product_variants_sku ON product_variants(sku);

-- 10. TABLE MOUVEMENTS DE STOCK (INVENTORY_MOVEMENTS)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    reason inventory_reason NOT NULL,
    order_id INTEGER,
    reference VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_inventory_movements_variant_id ON inventory_movements(variant_id);

-- 11. TABLE PROMOTIONS (PROMOTIONS)
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    starts_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0 NOT NULL,
    target_universe gender_universe DEFAULT 'UNISEX',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_promotions_code ON promotions(code);

-- 12. TABLE COMMANDES (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20),
    delivery_notes TEXT,
    status order_status DEFAULT 'PENDING' NOT NULL,
    payment_status payment_status DEFAULT 'PENDING' NOT NULL,
    payment_method payment_method DEFAULT 'CASH_ON_DELIVERY' NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS ix_orders_user_id ON orders(user_id);

-- 13. TABLE ARTICLES DE COMMANDE (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE RESTRICT NOT NULL,
    product_name_fr VARCHAR(255) NOT NULL,
    product_name_ar VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    color_name_fr VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items(order_id);

-- 14. TABLE EXPEDITIONS (SHIPMENTS)
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    carrier_name VARCHAR(100) DEFAULT 'AVELOR Express Maroc' NOT NULL,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP WITHOUT TIME ZONE,
    delivered_at TIMESTAMP WITHOUT TIME ZONE,
    notes TEXT
);

-- 15. TABLE PAIEMENTS (PAYMENTS)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    provider VARCHAR(50) DEFAULT 'CASH_ON_DELIVERY' NOT NULL,
    transaction_id VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status DEFAULT 'PENDING' NOT NULL,
    payment_date TIMESTAMP WITHOUT TIME ZONE,
    provider_payload TEXT
);

-- 16. TABLE UTILISATION DE COUPONS (COUPON_REDEMPTIONS)
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER REFERENCES promotions(id) ON DELETE CASCADE NOT NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    discount_applied NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. TABLE CAMPAGNES & BANNIÈRES (CAMPAIGNS)
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    title_fr VARCHAR(200) NOT NULL,
    title_ar VARCHAR(200) NOT NULL,
    subtitle_fr TEXT,
    subtitle_ar TEXT,
    button_text_fr VARCHAR(100) DEFAULT 'Découvrir la collection',
    button_text_ar VARCHAR(100) DEFAULT 'اكتشف التشكيلة',
    link_url VARCHAR(255) NOT NULL,
    desktop_image VARCHAR(500) NOT NULL,
    mobile_image VARCHAR(500),
    target_universe gender_universe DEFAULT 'UNISEX' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    starts_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_campaigns_target_universe ON campaigns(target_universe);
CREATE INDEX IF NOT EXISTS ix_campaigns_is_active ON campaigns(is_active);

-- 18. TABLE JOURNAL D'AUDIT SÉCURITÉ (AUDIT_LOGS)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs(action);

-- =============================================================================
-- DONNÉES INITIALES (SEED DE DÉMONSTRATION HAUTE COUTURE MAROC)
-- =============================================================================

-- Utilisateurs (Admin: AdminAvelor2026! / Client: ClientAvelor2026!)
INSERT INTO users (email, hashed_password, first_name, last_name, phone, role, is_active)
VALUES 
('admin@avelor.ma', '$2b$12$6/7n7iQ5fB0t7zS8GvX1sO9kQeFvP0yQx7rY0k0bZtX9V0b1f2g3h', 'Karim', 'El Fassi', '+212661000001', 'ADMIN', TRUE),
('client@avelor.ma', '$2b$12$6/7n7iQ5fB0t7zS8GvX1sO9kQeFvP0yQx7rY0k0bZtX9V0b1f2g3h', 'Yasmine', 'Bennani', '+212662000002', 'CUSTOMER', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Catégories Homme et Femme
INSERT INTO categories (id, slug, name_fr, name_ar, universe, sort_order) VALUES
(1, 'homme-costumes', 'Costumes & Blazers', 'بدلات وسترات رسمية', 'MEN', 1),
(2, 'homme-chemises', 'Chemises de Luxe', 'قمصان فاخرة', 'MEN', 2),
(3, 'homme-chaussures', 'Chaussures & Derbies', 'أحذية وأكسفورد', 'MEN', 3),
(4, 'homme-accessoires', 'Accessoires & Cuir', 'إكسسوارات وجلود', 'MEN', 4),
(5, 'femme-robes', 'Robes de Soirée', 'فساتين سهرة راقية', 'WOMEN', 1),
(6, 'femme-blazers', 'Tailleurs & Blazers', 'سترات وبدلات نسائية', 'WOMEN', 2),
(7, 'femme-sacs', 'Sacs à Main en Cuir', 'حقائب يد جلدية', 'WOMEN', 3),
(8, 'femme-chaussures', 'Escarpins & Talons', 'أحذية كعب عالي', 'WOMEN', 4)
ON CONFLICT (slug) DO NOTHING;

-- Produits Haute Couture
INSERT INTO products (id, sku, slug, name_fr, name_ar, base_price, discount_price, universe, category_id, is_featured, is_new) VALUES
(1, 'AV-M-CST-01', 'costume-croise-laine-italienne-noir', 'Costume Croisé en Laine Royale Italienne', 'بدلة رجالية بصدر مزدوج من الصوف الإيطالي الملكي', 2890.00, 2490.00, 'MEN', 1, TRUE, TRUE),
(2, 'AV-M-CHM-01', 'chemise-popeline-coton-egyptien-blanc', 'Chemise Col Italien en Coton d''Égypte', 'قميص ياقة إيطالية من قطن الجيزة المصري', 890.00, NULL, 'MEN', 2, TRUE, TRUE),
(3, 'AV-M-CHS-01', 'mocassins-cuir-veau-patine-marron', 'Mocassins Péniche en Cuir Patiné à la Main', 'حذاء لوفر من جلد العجل المعتّق يدوياً', 1950.00, 1690.00, 'MEN', 3, TRUE, FALSE),
(4, 'AV-M-ACC-01', 'sac-weekend-cuir-marocain-prestige', 'Sac Weekend 48H en Cuir Pleine Fleur', 'حقيبة عطلة أسبوعية جلدية فاخرة 48 ساعة', 2450.00, NULL, 'MEN', 4, FALSE, TRUE),
(5, 'AV-W-ROB-01', 'robe-longue-satin-soie-emeraude', 'Robe Sculpturale en Satin de Soie Vert Émeraude', 'فستان سهرة طويل من حرير الساتان الأخضر الزمردي', 3200.00, 2850.00, 'WOMEN', 5, TRUE, TRUE),
(6, 'AV-W-BLZ-01', 'blazer-tailleur-crepe-ivoire-boutons-dores', 'Blazer Structuré en Crêpe Ivoire & Boutons Gravés', 'سترة بليزر كريب عاجية بأزرار معدنية مذهبة', 2100.00, NULL, 'WOMEN', 6, TRUE, TRUE),
(7, 'AV-W-SAC-01', 'sac-a-main-cuir-graine-fermoir-or', 'Sac Trapèze en Cuir Grainé avec Fermoir Or 24K', 'حقيبة ترابيز من الجلد المحبب بقفل مطلي بالذهب 24 قيراط', 3500.00, 2990.00, 'WOMEN', 7, TRUE, FALSE),
(8, 'AV-W-ESC-01', 'escarpins-cuir-verni-talon-stiletto', 'Escarpins Stiletto en Cuir Verni Noir 85mm', 'حذاء كعب ستيليتو من الجلد اللامع 85 مم', 1850.00, NULL, 'WOMEN', 8, FALSE, TRUE)
ON CONFLICT (sku) DO NOTHING;

-- Images Produits
INSERT INTO product_images (product_id, url, alt_text_fr, alt_text_ar, is_cover, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop', 'Costume noir vue 1', 'بدلة سوداء', TRUE, 0),
(2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop', 'Chemise blanche vue 1', 'قميص أبيض', TRUE, 0),
(3, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop', 'Mocassins vue 1', 'حذاء لوفر', TRUE, 0),
(4, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop', 'Sac voyage vue 1', 'حقيبة سفر', TRUE, 0),
(5, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop', 'Robe émeraude vue 1', 'فستان زمردي', TRUE, 0),
(6, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', 'Blazer ivoire vue 1', 'سترة عاجية', TRUE, 0),
(7, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop', 'Sac cuir vue 1', 'حقيبة جلد', TRUE, 0),
(8, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', 'Escarpins vue 1', 'حذاء كعب', TRUE, 0);

-- Variantes et Stocks
INSERT INTO product_variants (product_id, sku, size, color_name_fr, color_name_ar, color_code, stock) VALUES
(1, 'AV-M-CST-01-48-BLK', '48', 'Noir Profond', 'أسود داكن', '#111111', 12),
(1, 'AV-M-CST-01-50-BLK', '50', 'Noir Profond', 'أسود داكن', '#111111', 15),
(2, 'AV-M-CHM-01-39-WHT', '39', 'Blanc Pur', 'أبيض ناصع', '#FFFFFF', 25),
(2, 'AV-M-CHM-01-40-WHT', '40', 'Blanc Pur', 'أبيض ناصع', '#FFFFFF', 20),
(3, 'AV-M-CHS-01-41-BRN', '41', 'Havane Patiné', 'بني تبغي', '#5A3825', 8),
(4, 'AV-M-ACC-01-TU-CHST', 'TU', 'Châtaigne', 'كستنائي ملكي', '#4A2E18', 14),
(5, 'AV-W-ROB-01-38-EMR', '38', 'Vert Émeraude', 'أخضر زمردي', '#097969', 10),
(6, 'AV-W-BLZ-01-38-IVR', '38', 'Ivoire Impérial', 'عاجي ملكي', '#FFFFF0', 14),
(7, 'AV-W-SAC-01-TU-CML', 'TU', 'Camel Chaud', 'جملي دافئ', '#C19A6B', 8),
(8, 'AV-W-ESC-01-38-BLK', '38', 'Noir Miroir', 'أسود مرآتي', '#0A0A0A', 12)
ON CONFLICT (sku) DO NOTHING;

-- Promotions
INSERT INTO promotions (code, name_fr, name_ar, discount_type, discount_value, min_order_amount, is_active) VALUES
('BIENVENUE10', 'Offre de Bienvenue 10%', 'عرض الترحيب 10%', 'PERCENTAGE', 10.00, 400.00, TRUE),
('AVELOR100', 'Privilège 100 MAD', 'امتياز 100 درهم', 'FIXED', 100.00, 1200.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Bannières & Campagnes
INSERT INTO campaigns (title_fr, title_ar, subtitle_fr, subtitle_ar, link_url, desktop_image, target_universe, sort_order, is_active) VALUES
('L''Élégance Intemporelle', 'الأناقة الخالدة', 'Nouvelle collection Homme & Femme confectionnée dans les plus nobles matières.', 'تشكيلة جديدة للرجال والنساء مصممة من أنبل الخامات العالمية.', '/homme', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop', 'UNISEX', 1, TRUE),
('L''Allure Masculine Moderne', 'الجاذبية الرجالية العصرية', 'Costumes sur mesure, souliers patinés et maroquinerie haut de gamme.', 'بدلات راقية، أحذية معتقة وجلود فاخرة لإطلالة تفرض حضورك.', '/homme', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop', 'MEN', 2, TRUE),
('Grâce & Haute Couture Féminine', 'الرقة والأناقة النسائية الرفيعة', 'Robes de soie, tailleurs impeccables et sacs à main d''exception.', 'فساتين حريرية، بدلات متقنة وحقائب يد تليق بجمالك.', '/femme', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop', 'WOMEN', 3, TRUE);
