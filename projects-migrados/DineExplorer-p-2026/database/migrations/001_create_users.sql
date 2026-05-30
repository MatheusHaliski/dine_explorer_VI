-- 001_create_users.sql
-- DineExplorer-p-2026 — Tabela de usuários da plataforma
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT        PRIMARY KEY AUTO_INCREMENT,
  firebase_uid  VARCHAR(128)  NOT NULL UNIQUE,
  email         VARCHAR(254)  NOT NULL UNIQUE,
  display_name  VARCHAR(120),
  global_role   ENUM('platform_admin','restaurant_user','customer') NOT NULL DEFAULT 'customer',
  password_hash VARCHAR(255),
  active        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP     NULL,
  INDEX idx_users_email       (email),
  INDEX idx_users_firebase_uid(firebase_uid),
  INDEX idx_users_global_role (global_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
