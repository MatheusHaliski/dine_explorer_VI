# Checklist de Segurança — Scores-p-2026

## Status atual: ESTRUTURA CRIADA — CÓDIGO FONTE PENDENTE

### Preservação do projeto antigo
- [x] Projeto antigo preservado (não foi deletado)
- [x] Banco antigo não sobrescrito

### Novo projeto
- [x] Nova pasta `/projects-migrados/Scores-p-2026/` criada
- [x] Estrutura organizada

### Banco de dados
- [x] Script de criação do banco MySQL gerado
- [x] Script de usuários com permissões mínimas gerado
- [x] Usuário da aplicação: `scores_app_user`
- [x] Usuário backup: `scores_backup_user`
- [x] Usuário readonly: `scores_readonly_user`
- [ ] Banco criado em servidor real (pendente)
- [ ] TLS/SSL configurado

### Backup
- [x] Script de backup gerado
- [x] Script de restore gerado
- [x] `.gitignore` configurado
- [ ] Backup do banco antigo gerado (pendente — requer acesso)
- [ ] Restore testado

### Migrations
- [x] 5 migrations criadas (users, scores, score_history, reports, audit_logs)
- [x] `score_history` — log imutável de alterações
- [ ] Migrations executadas em banco real (pendente)
- [ ] Dados migrados (pendente)

### Autenticação
- [ ] JWT implementado com expiração (pendente — aguarda código fonte)
- [ ] Refresh token com revogação (pendente)
- [ ] bcrypt/Argon2 para senhas (pendente)
- [ ] Rate limit em auth (pendente)

### Ambiente
- [x] `.env.example` criado
- [x] `.env` ignorado
- [x] Backups ignorados

### Documentação
- [x] `README.md` criado
- [x] `SECURITY.md` criado
- [x] Relatório de migração criado
- [x] Checklist criado

### Pendências Críticas
- [ ] Importar código fonte do projeto Scores
- [ ] Identificar banco de dados original
- [ ] Exportar dados do banco antigo
- [ ] Criar scripts de importação
- [ ] Validar que scores não são alteráveis sem ADMIN
- [ ] Validar isolamento por user_id
