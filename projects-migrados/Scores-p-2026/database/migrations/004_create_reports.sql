-- 004_create_reports.sql
-- Scores-p-2026 — Relatórios gerados
USE scores_p_2026;

CREATE TABLE IF NOT EXISTS reports (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  type        VARCHAR(80)  NOT NULL,
  generated_by BIGINT      NOT NULL,
  parameters  JSON,
  result_url  TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (generated_by) REFERENCES users(id),
  INDEX idx_reports_type    (type),
  INDEX idx_reports_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
