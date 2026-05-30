-- 005_create_security_audit_logs.sql
-- Scores-p-2026 — Tabela de auditoria de segurança
USE scores_p_2026;

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT       NULL,
  action      VARCHAR(120) NOT NULL,
  entity_name VARCHAR(120),
  entity_id   VARCHAR(120),
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  metadata    JSON,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user    (user_id),
  INDEX idx_audit_action  (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
