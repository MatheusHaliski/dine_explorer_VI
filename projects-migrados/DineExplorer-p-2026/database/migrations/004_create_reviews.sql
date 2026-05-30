-- 004_create_reviews.sql
-- DineExplorer-p-2026 — Avaliações de restaurantes
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS reviews (
  id            BIGINT        PRIMARY KEY AUTO_INCREMENT,
  firestore_id  VARCHAR(128)  UNIQUE,
  restaurant_id BIGINT        NOT NULL,
  user_id       BIGINT        NOT NULL,
  rating        TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP     NULL,
  CONSTRAINT fk_reviews_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  CONSTRAINT fk_reviews_user       FOREIGN KEY (user_id)       REFERENCES users(id),
  INDEX idx_reviews_restaurant_id (restaurant_id),
  INDEX idx_reviews_user_id       (user_id),
  INDEX idx_reviews_rating        (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
