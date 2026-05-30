-- 003_create_restaurant_members.sql
-- DineExplorer-p-2026 — Membros (staff) por restaurante
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS restaurant_members (
  id            BIGINT   PRIMARY KEY AUTO_INCREMENT,
  restaurant_id BIGINT   NOT NULL,
  user_id       BIGINT   NOT NULL,
  role          ENUM('manager','attendant','worker') NOT NULL DEFAULT 'worker',
  active        TINYINT(1) NOT NULL DEFAULT 1,
  permissions   JSON,
  joined_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_member_restaurant_user (restaurant_id, user_id),
  CONSTRAINT fk_members_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  CONSTRAINT fk_members_user       FOREIGN KEY (user_id)       REFERENCES users(id),
  INDEX idx_members_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
