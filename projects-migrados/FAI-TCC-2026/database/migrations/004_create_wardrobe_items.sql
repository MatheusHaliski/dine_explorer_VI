-- 004_create_wardrobe_items.sql
-- FAI-TCC-2026 — Peças do guarda-roupa virtual
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS wardrobe_items (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(80)  NOT NULL,
  subcategory VARCHAR(80),
  color       VARCHAR(80),
  size        VARCHAR(20),
  brand_id    BIGINT       NULL,
  brand_name  VARCHAR(120) DEFAULT 'default',
  status      ENUM('available','unavailable','favorite','sell','donate') NOT NULL DEFAULT 'available',
  image_url   TEXT,
  notes       TEXT,
  price_paid  DECIMAL(10,2),
  visibility  ENUM('private','public') NOT NULL DEFAULT 'private',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP    NULL,
  CONSTRAINT fk_wardrobe_user  FOREIGN KEY (user_id)  REFERENCES users(id),
  CONSTRAINT fk_wardrobe_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
  INDEX idx_wardrobe_user_cat    (user_id, category),
  INDEX idx_wardrobe_user_status (user_id, status),
  INDEX idx_wardrobe_visibility  (visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
