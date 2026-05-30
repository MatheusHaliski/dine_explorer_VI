-- 009_create_concierge.sql
-- DineExplorer-p-2026 — BioDine™ Concierge (mood check-ins e recomendações)
USE dine_explorer_2026;

CREATE TABLE IF NOT EXISTS mood_checkins (
  id            BIGINT   PRIMARY KEY AUTO_INCREMENT,
  firestore_id  VARCHAR(128) UNIQUE,
  user_id       BIGINT   NOT NULL,
  restaurant_id BIGINT   NOT NULL,
  mood          ENUM('relaxed','celebratory','romantic','social','comfort') NOT NULL,
  occasion      ENUM('date','family','business','solo','friends') NOT NULL,
  party_size    TINYINT  NOT NULL DEFAULT 1 CHECK (party_size > 0),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_checkin_user       FOREIGN KEY (user_id)       REFERENCES users(id),
  CONSTRAINT fk_checkin_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_checkin_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS concierge_recommendations (
  id              BIGINT    PRIMARY KEY AUTO_INCREMENT,
  firestore_id    VARCHAR(128) UNIQUE,
  user_id         BIGINT    NOT NULL,
  checkin_id      BIGINT    NOT NULL,
  recommended_items JSON    NOT NULL,
  match_score     DECIMAL(5,4) DEFAULT 0.0000,
  post_draft      JSON,
  status          ENUM('pending','accepted','dismissed') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at     TIMESTAMP NULL,
  CONSTRAINT fk_reco_user    FOREIGN KEY (user_id)    REFERENCES users(id),
  CONSTRAINT fk_reco_checkin FOREIGN KEY (checkin_id) REFERENCES mood_checkins(id),
  INDEX idx_reco_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
