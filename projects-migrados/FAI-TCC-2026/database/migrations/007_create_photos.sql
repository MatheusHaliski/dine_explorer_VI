-- 007_create_photos.sql
-- FAI-TCC-2026 — Fotos do usuário (linha do tempo + galeria)
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS photos (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  outfit_id   BIGINT       NULL,
  url         TEXT         NOT NULL,
  thumbnail_url TEXT,
  caption     VARCHAR(500),
  visibility  ENUM('private','public') NOT NULL DEFAULT 'private',
  taken_at    TIMESTAMP    NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP    NULL,
  CONSTRAINT fk_photos_user   FOREIGN KEY (user_id)  REFERENCES users(id),
  CONSTRAINT fk_photos_outfit FOREIGN KEY (outfit_id) REFERENCES outfits(id),
  INDEX idx_photos_user_vis   (user_id, visibility),
  INDEX idx_photos_taken_at   (user_id, taken_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
