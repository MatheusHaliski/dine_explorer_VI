-- 009_create_search_filters.sql
-- FAI-TCC-2026 — Filtros de busca salvos pelo usuário
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS search_filters (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  name        VARCHAR(120) NOT NULL,
  entity_type ENUM('wardrobe_items','outfits','users','brands') NOT NULL,
  filters     JSON         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_filters_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_filters_user_entity (user_id, entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
