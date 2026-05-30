-- ═══════════════════════════════════════════════════════════════
-- Scores-p-2026 — Criação de usuários MySQL
-- ATENÇÃO: Substituir SENHA_FORTE_* por senhas geradas seguramente.
-- ═══════════════════════════════════════════════════════════════

CREATE USER IF NOT EXISTS 'scores_app_user'@'%'
  IDENTIFIED BY 'SENHA_FORTE_APP_AQUI';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON scores_p_2026.*
  TO 'scores_app_user'@'%';

CREATE USER IF NOT EXISTS 'scores_readonly_user'@'%'
  IDENTIFIED BY 'SENHA_FORTE_READONLY_AQUI';

GRANT SELECT
  ON scores_p_2026.*
  TO 'scores_readonly_user'@'%';

CREATE USER IF NOT EXISTS 'scores_backup_user'@'localhost'
  IDENTIFIED BY 'SENHA_FORTE_BACKUP_AQUI';

GRANT SELECT, LOCK TABLES, SHOW VIEW, TRIGGER, EVENT
  ON scores_p_2026.*
  TO 'scores_backup_user'@'localhost';

FLUSH PRIVILEGES;
