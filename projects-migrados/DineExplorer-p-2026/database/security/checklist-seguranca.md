# Checklist de Segurança — DineExplorer-p-2026

## Status atual: PLANEJAMENTO CONCLUÍDO

### Preservação do projeto antigo
- [x] Projeto antigo (`dine_explorer_VI`) preservado — nenhum arquivo foi deletado
- [x] Nenhum banco antigo sobrescrito

### Novo projeto
- [x] Nova pasta `/projects-migrados/DineExplorer-p-2026/` criada
- [x] Estrutura organizada (frontend, backend, database/migrations, scripts, security)

### Banco de dados
- [x] Script de criação do banco MySQL gerado (`01-create-database.sql`)
- [x] Usuário root removido da aplicação — usuário `dine_app_user` criado
- [x] Permissões mínimas aplicadas (SELECT, INSERT, UPDATE, DELETE somente)
- [x] Usuário somente leitura criado (`dine_readonly_user`)
- [x] Usuário de backup criado com permissões restritas (`dine_backup_user`)
- [x] Script de usuários e permissões gerado (`02-create-users.sql`)
- [ ] Banco criado em servidor de produção (pendente execução manual)
- [ ] TLS/SSL ativo na conexão de produção (`DB_SSL=true`)

### Backup
- [x] Script de backup gerado (`backup-mysql.sh`)
- [x] Script de restore gerado (`restore-mysql.sh`)
- [x] Script de verificação gerado (`verify-backup.sh`)
- [x] `.gitignore` inclui `database/backups/*`
- [ ] Backup do banco antigo (Firestore) gerado (pendente — requer acesso ao Firebase)
- [ ] Checksum do backup gerado (pendente execução)
- [ ] Restore testado em ambiente de teste (pendente)

### Migrations
- [x] 10 migrations SQL criadas (001 a 010)
- [x] Tabela `security_audit_logs` incluída
- [x] Todos os campos com `NOT NULL`, chaves estrangeiras e índices
- [ ] Migrations executadas em banco real (pendente)
- [ ] Dados importados do Firestore (pendente)
- [ ] Quantidade de registros validada (pendente)

### Autenticação e Autorização
- [x] HMAC-SHA256 session tokens implementados (`serverSession.ts`)
- [x] Cookie `httpOnly`, `sameSite: lax`, `secure: true` em produção
- [x] TTL de sessão: 12 horas
- [x] RBAC implementado (`rbac.ts`) — roles: manager, attendant, worker
- [x] Firestore Rules aplicam isolamento por `restaurantId` e `restaurantRole`
- [x] `password_hash` não exposto em respostas de API
- [ ] Rate limit em endpoints de auth (verificar `basicRateLimit.ts`)

### Ambiente e Credenciais
- [x] `.env.example` criado com todas as variáveis (sem valores reais)
- [x] `.env` ignorado pelo `.gitignore`
- [x] Chaves Firebase (`serviceAccount*.json`) ignoradas
- [x] Backups ignorados pelo Git

### Documentação
- [x] `README.md` criado
- [x] `SECURITY.md` criado
- [x] Relatório de migração criado (`migration-report.md`)
- [x] Este checklist criado

### Pendências Críticas
- [ ] Criar novo projeto Firebase independente (separado de `funcionarioslistaapp2025`)
- [ ] Exportar dados do Firestore `newdedb` para JSON
- [ ] Criar scripts de importação Firestore JSON → MySQL
- [ ] Mapear coleções `diningSessions`, `dishResponses`, `flavorProfiles`
- [ ] Executar migrations em banco real
- [ ] Testar restore em banco de teste
- [ ] Validar contagem de registros migrados
