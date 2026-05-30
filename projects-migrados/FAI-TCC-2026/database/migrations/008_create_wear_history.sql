-- 008_create_wear_history.sql
-- FAI-TCC-2026 — Histórico de vestimenta (linha do tempo)
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS wear_history (
  id              BIGINT    PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT    NOT NULL,
  outfit_id       BIGINT    NULL,
  wardrobe_item_id BIGINT   NULL,
  worn_date       DATE      NOT NULL,
  photo_id        BIGINT    NULL,
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  CONSTRAINT fk_wear_user    FOREIGN KEY (user_id)         REFERENCES users(id),
  CONSTRAINT fk_wear_outfit  FOREIGN KEY (outfit_id)       REFERENCES outfits(id),
  CONSTRAINT fk_wear_item    FOREIGN KEY (wardrobe_item_id) REFERENCES wardrobe_items(id),
  CONSTRAINT fk_wear_photo   FOREIGN KEY (photo_id)        REFERENCES photos(id),
  INDEX idx_wear_user_date (user_id, worn_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
