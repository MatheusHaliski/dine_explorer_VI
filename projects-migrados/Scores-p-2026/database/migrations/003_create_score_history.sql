-- 003_create_score_history.sql
-- Scores-p-2026 — Histórico imutável de alterações de pontuação
USE scores_p_2026;

CREATE TABLE IF NOT EXISTS score_history (
  id          BIGINT        PRIMARY KEY AUTO_INCREMENT,
  score_id    BIGINT        NOT NULL,
  user_id     BIGINT        NOT NULL,
  old_value   DECIMAL(10,2),
  new_value   DECIMAL(10,2) NOT NULL,
  changed_by  BIGINT        NOT NULL,
  reason      VARCHAR(300),
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_score      FOREIGN KEY (score_id)   REFERENCES scores(id),
  CONSTRAINT fk_hist_user       FOREIGN KEY (user_id)    REFERENCES users(id),
  CONSTRAINT fk_hist_changed_by FOREIGN KEY (changed_by) REFERENCES users(id),
  INDEX idx_hist_score_id (score_id),
  INDEX idx_hist_user_id  (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
