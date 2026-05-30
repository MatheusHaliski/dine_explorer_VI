-- 008_create_posts.sql
-- DineExplorer-p-2026 — Posts sociais dos restaurantes
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS social_posts (
  id            BIGINT    PRIMARY KEY AUTO_INCREMENT,
  firestore_id  VARCHAR(128) UNIQUE,
  restaurant_id BIGINT    NOT NULL,
  author_id     BIGINT    NOT NULL,
  type          ENUM('text','image','video','poll') NOT NULL DEFAULT 'text',
  category      ENUM('promo','event','announcement','ugc-feature') NOT NULL DEFAULT 'announcement',
  body          TEXT      NOT NULL,
  media_url     TEXT,
  poll_options  JSON,
  shoppable_cta JSON,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,
  CONSTRAINT fk_posts_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  CONSTRAINT fk_posts_author     FOREIGN KEY (author_id)     REFERENCES users(id),
  INDEX idx_posts_restaurant_created (restaurant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
