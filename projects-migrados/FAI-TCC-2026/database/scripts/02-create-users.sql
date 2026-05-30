-- ═══════════════════════════════════════════════════════════════
-- FAI-TCC-2026 (Fashion AI) — Criação de usuários MySQL
-- ATENÇÃO: Substituir SENHA_FORTE_* por senhas geradas seguramente.
-- ═══════════════════════════════════════════════════════════════

CREATE USER IF NOT EXISTS 'fai_app_user'@'%'
  IDENTIFIED BY 'SENHA_FORTE_APP_AQUI';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON fai_tcc_2026.*
  TO 'fai_app_user'@'%';

CREATE USER IF NOT EXISTS 'fai_readonly_user'@'%'
  IDENTIFIED BY 'SENHA_FORTE_READONLY_AQUI';

GRANT SELECT
  ON fai_tcc_2026.*
  TO 'fai_readonly_user'@'%';

CREATE USER IF NOT EXISTS 'fai_backup_user'@'localhost'
  IDENTIFIED BY 'SENHA_FORTE_BACKUP_AQUI';

GRANT SELECT, LOCK TABLES, SHOW VIEW, TRIGGER, EVENT
  ON fai_tcc_2026.*
  TO 'fai_backup_user'@'localhost';

FLUSH PRIVILEGES;
