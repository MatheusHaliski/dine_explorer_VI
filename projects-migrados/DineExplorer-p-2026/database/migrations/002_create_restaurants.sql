-- 002_create_restaurants.sql
-- DineExplorer-p-2026 — Tabela de restaurantes
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS restaurants (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  firestore_id VARCHAR(128) UNIQUE,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(80),
  address     VARCHAR(300),
  city        VARCHAR(100),
  country     VARCHAR(100),
  photo_url   TEXT,
  avg_rating  DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT        DEFAULT 0,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP    NULL,
  INDEX idx_restaurants_name    (name),
  INDEX idx_restaurants_city    (city),
  INDEX idx_restaurants_category(category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
