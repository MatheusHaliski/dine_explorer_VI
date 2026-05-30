-- 002_create_user_sessions.sql
-- FAI-TCC-2026 — Sessões de usuário (refresh token storage)
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS user_sessions (
  id            BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT       NOT NULL,
  refresh_token VARCHAR(512) NOT NULL UNIQUE,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  expires_at    TIMESTAMP    NOT NULL,
  revoked       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_sessions_user    (user_id),
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
