-- ═══════════════════════════════════════════════════════════════
-- DineExplorer-p-2026 — Criação de usuários MySQL
-- ATENÇÃO: Substituir SENHA_FORTE_* por senhas geradas seguramente.
-- Nunca usar o usuário root na aplicação.
-- ═══════════════════════════════════════════════════════════════

-- Usuário da aplicação (DML apenas — sem DDL nem GRANT)
CREATE USER IF NOT EXISTS 'dine_app_user'@'%'
  IDENTIFIED BY 'SENHA_FORTE_APP_AQUI';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON dine_explorer_2026.*
  TO 'dine_app_user'@'%';

-- Usuário somente leitura (relatórios / auditoria)
CREATE USER IF NOT EXISTS 'dine_readonly_user'@'%'
  IDENTIFIED BY 'SENHA_FORTE_READONLY_AQUI';

GRANT SELECT
  ON dine_explorer_2026.*
  TO 'dine_readonly_user'@'%';

-- Usuário de backup (permissões mínimas para dump)
CREATE USER IF NOT EXISTS 'dine_backup_user'@'localhost'
  IDENTIFIED BY 'SENHA_FORTE_BACKUP_AQUI';

GRANT SELECT, LOCK TABLES, SHOW VIEW, TRIGGER, EVENT
  ON dine_explorer_2026.*
  TO 'dine_backup_user'@'localhost';

FLUSH PRIVILEGES;
