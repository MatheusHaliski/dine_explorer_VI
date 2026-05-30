-- 001_create_users.sql
-- Scores-p-2026 — Tabela de usuários
USE scores_p_2026;

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT       PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(254) NOT NULL UNIQUE,
  display_name  VARCHAR(120),
  role          ENUM('USER','ADMIN','AUDITOR') NOT NULL DEFAULT 'USER',
  password_hash VARCHAR(255) NOT NULL,
  active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP    NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
