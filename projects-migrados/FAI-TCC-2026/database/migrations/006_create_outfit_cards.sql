-- 006_create_outfit_cards.sql
-- FAI-TCC-2026 — Outfit cards salvos (favoritos/coleção)
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS outfit_cards (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  outfit_id   BIGINT       NOT NULL,
  title       VARCHAR(200),
  description TEXT,
  cover_url   TEXT,
  tags        JSON,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP    NULL,
  CONSTRAINT fk_outfit_cards_user   FOREIGN KEY (user_id)   REFERENCES users(id),
  CONSTRAINT fk_outfit_cards_outfit FOREIGN KEY (outfit_id) REFERENCES outfits(id),
  INDEX idx_outfit_cards_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
