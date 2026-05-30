-- 003_create_brands.sql
-- FAI-TCC-2026 — Marcas de roupas
USE fai_tcc_2026;

CREATE TABLE IF NOT EXISTS brands (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(120) NOT NULL UNIQUE,
  logo_url   TEXT,
  website    VARCHAR(300),
  active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_brands_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS retail_brands (
  id             BIGINT       PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  country        VARCHAR(80),
  category       VARCHAR(80),
  affiliate_url  TEXT,
  logo_url       TEXT,
  active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_retail_brands_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
