-- 006_create_catalog.sql
-- DineExplorer-p-2026 — Cardápio dos restaurantes
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS catalog_items (
  id            BIGINT        PRIMARY KEY AUTO_INCREMENT,
  firestore_id  VARCHAR(128)  UNIQUE,
  restaurant_id BIGINT        NOT NULL,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category      VARCHAR(80),
  photo_url     TEXT,
  available     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP     NULL,
  CONSTRAINT fk_catalog_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_catalog_restaurant_avail (restaurant_id, available),
  INDEX idx_catalog_category         (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
