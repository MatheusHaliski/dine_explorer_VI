-- 002_create_scores.sql
-- Scores-p-2026 — Pontuações dos usuários
USE scores_p_2026;

CREATE TABLE IF NOT EXISTS scores (
  id         BIGINT        PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT        NOT NULL,
  category   VARCHAR(80)   NOT NULL,
  value      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes      TEXT,
  created_by BIGINT        NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP     NULL,
  CONSTRAINT fk_scores_user      FOREIGN KEY (user_id)    REFERENCES users(id),
  CONSTRAINT fk_scores_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_scores_user     (user_id),
  INDEX idx_scores_category (category),
  INDEX idx_scores_created  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
