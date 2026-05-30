-- 005_create_outfits.sql
-- FAI-TCC-2026 — Outfits (combinações de peças)
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS outfits (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  name        VARCHAR(200) NOT NULL,
  occasion    VARCHAR(80),
  season      ENUM('spring','summer','autumn','winter','all') DEFAULT 'all',
  visibility  ENUM('private','public') NOT NULL DEFAULT 'private',
  ai_generated TINYINT(1)  NOT NULL DEFAULT 0,
  cover_url   TEXT,
  notes       TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP    NULL,
  CONSTRAINT fk_outfits_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_outfits_user_vis (user_id, visibility),
  INDEX idx_outfits_occasion (occasion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS outfit_items (
  id              BIGINT    PRIMARY KEY AUTO_INCREMENT,
  outfit_id       BIGINT    NOT NULL,
  wardrobe_item_id BIGINT   NOT NULL,
  position        TINYINT   DEFAULT 0,
  CONSTRAINT fk_outfit_items_outfit   FOREIGN KEY (outfit_id)        REFERENCES outfits(id),
  CONSTRAINT fk_outfit_items_wardrobe FOREIGN KEY (wardrobe_item_id) REFERENCES wardrobe_items(id),
  INDEX idx_outfit_items_outfit (outfit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
