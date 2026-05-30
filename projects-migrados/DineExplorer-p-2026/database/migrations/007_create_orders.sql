-- 007_create_orders.sql
-- DineExplorer-p-2026 — Pedidos
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS orders (
  id              BIGINT        PRIMARY KEY AUTO_INCREMENT,
  firestore_id    VARCHAR(128)  UNIQUE,
  restaurant_id   BIGINT        NOT NULL,
  user_id         BIGINT        NOT NULL,
  status          ENUM('pending','confirmed','preparing','ready','delivered','cancelled') NOT NULL DEFAULT 'pending',
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes           TEXT,
  idempotency_key VARCHAR(128)  UNIQUE,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP     NULL,
  CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  CONSTRAINT fk_orders_user       FOREIGN KEY (user_id)       REFERENCES users(id),
  INDEX idx_orders_restaurant_status (restaurant_id, status),
  INDEX idx_orders_user              (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id             BIGINT        PRIMARY KEY AUTO_INCREMENT,
  order_id       BIGINT        NOT NULL,
  catalog_item_id BIGINT       NOT NULL,
  quantity       SMALLINT      NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price     DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)        REFERENCES orders(id),
  CONSTRAINT fk_order_items_catalog FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id),
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
