# Checklist de Segurança — FAI-TCC-2026 (Fashion AI)

## Status atual: ESTRUTURA CRIADA — CÓDIGO FONTE PENDENTE

### Preservação do projeto antigo
- [x] Projeto antigo preservado (não foi deletado)
- [x] Banco antigo não sobrescrito

### Novo projeto
- [x] Nova pasta `/projects-migrados/FAI-TCC-2026/` criada
- [x] Estrutura completa organizada

### Banco de dados
- [x] Script de criação do banco MySQL gerado
- [x] Script de usuários com permissões mínimas gerado
- [x] Usuário da aplicação: `fai_app_user`
- [x] Usuário backup: `fai_backup_user`
- [x] Usuário readonly: `fai_readonly_user`
- [ ] Banco criado em servidor real (pendente)
- [ ] TLS/SSL configurado

### Backup
- [x] Script de backup gerado
- [x] Script de restore gerado
- [x] `.gitignore` configurado
- [ ] Backup do banco antigo / exportação Firebase gerada
- [ ] Restore testado

### Migrations
- [x] 10 migrations criadas (users, sessions, brands, wardrobe_items, outfits, outfit_items, outfit_cards, photos, wear_history, search_filters, audit_logs)
- [x] Campos `visibility` em wardrobe_items, outfits e photos
- [x] `user_id` como FK em todas as tabelas de dados do usuário
- [x] Tabela `security_audit_logs`
- [x] Tabela `user_sessions` para refresh token
- [ ] Migrations executadas em banco real (pendente)
- [ ] Dados migrados (pendente)

### Isolamento de Dados de Usuário
- [x] Campo `user_id` em todas as tabelas de dados pessoais
- [x] Campo `visibility` em wardrobe_items, outfits, photos
- [ ] Middleware valida `req.user.id === resource.user_id` (pendente — aguarda código)
- [ ] Rotas privadas protegidas com JWT middleware (pendente)
- [ ] Outfits públicos vs privados testados na busca (pendente)

### Upload de Imagens
- [ ] Validação de MIME type no servidor (pendente — aguarda código)
- [ ] Tamanho máximo 10 MB configurado (pendente)
- [ ] Signed URLs para imagens privadas (pendente)
- [ ] URLs não expõem estrutura interna (pendente)

### Autenticação
- [ ] JWT + refresh token implementados (pendente — aguarda código)
- [ ] bcrypt/Argon2 para senhas (pendente)
- [ ] Rate limit em auth (pendente)

### Ambiente
- [x] `.env.example` criado com todas as variáveis
- [x] `.env` ignorado
- [x] Backups ignorados
- [x] `ANTHROPIC_API_KEY` listada no `.env.example` sem valor real

### Documentação
- [x] `README.md` criado
- [x] `SECURITY.md` criado
- [x] Relatório de migração criado
- [x] Checklist criado

### Pendências Críticas
- [ ] Importar código fonte do projeto Fashion AI
- [ ] Confirmar banco de dados original (Firebase? outro?)
- [ ] Exportar dados do banco antigo
- [ ] Criar scripts de importação
- [ ] Implementar middleware de isolamento de dados
- [ ] Configurar signed URLs para fotos privadas
- [ ] Validar integração com Anthropic API no novo ambiente
