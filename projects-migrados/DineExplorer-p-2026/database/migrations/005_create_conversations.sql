-- 005_create_conversations.sql
-- DineExplorer-p-2026 — Conversas (inbox do restaurante)
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS conversations (
  id              BIGINT   PRIMARY KEY AUTO_INCREMENT,
  firestore_id    VARCHAR(128) UNIQUE,
  restaurant_id   BIGINT   NOT NULL,
  client_user_id  BIGINT   NOT NULL,
  intent          ENUM('reservation','order_help','complaint','delivery','feedback','general') NOT NULL DEFAULT 'general',
  status          ENUM('new','assigned','pending','waiting_customer','resolved') NOT NULL DEFAULT 'new',
  priority        ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
  assigned_to_id  BIGINT   NULL,
  channel         ENUM('in_app','instagram','whatsapp','facebook') NOT NULL DEFAULT 'in_app',
  last_message    TEXT,
  due_at          TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  CONSTRAINT fk_conv_restaurant   FOREIGN KEY (restaurant_id)  REFERENCES restaurants(id),
  CONSTRAINT fk_conv_client       FOREIGN KEY (client_user_id) REFERENCES users(id),
  CONSTRAINT fk_conv_assigned     FOREIGN KEY (assigned_to_id) REFERENCES users(id),
  INDEX idx_conv_restaurant_status (restaurant_id, status),
  INDEX idx_conv_client            (client_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
