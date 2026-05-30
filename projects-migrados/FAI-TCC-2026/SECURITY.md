# SECURITY.md — FAI-TCC-2026 (Fashion AI)

## 1. Política de Proteção de Credenciais

- Nunca commitar `.env` ou arquivos com valores reais.
- Usar `.env.example` com nomes de variáveis sem valores.
- Chaves de IA (Anthropic API key) jamais aparecem no código ou logs.
- Credenciais de storage (bucket) em variáveis de ambiente, não hardcoded.

## 2. Regras de Banco de Dados

- Usuário `root` não usado pela aplicação.
- Usuário da aplicação: `fai_app_user` — apenas SELECT, INSERT, UPDATE, DELETE.
- Usuário de backup: `fai_backup_user` — apenas leitura para dump.
- Usuário somente-leitura: `fai_readonly_user`.
- TLS/SSL ativo em produção.
- Dados de usuários separados por `user_id` em todas as tabelas.

## 3. Regras de Isolamento de Dados de Usuário

- Cada usuário visualiza apenas suas próprias peças (`wardrobe_items.user_id`).
- Outfits `visibility = 'private'` são visíveis apenas pelo próprio dono.
- Outfits `visibility = 'public'` aparecem na busca geral.
- Fotos `visibility = 'private'` nunca acessíveis por outros usuários.
- Perfil `profile_visibility` controla o que outros podem ver.
- Middleware valida `req.user.id === resource.user_id` antes de servir dados privados.

## 4. Regras de Upload de Imagens

- Validar MIME type no servidor (não apenas extensão).
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`.
- Tamanho máximo: 10 MB por imagem.
- URLs de storage não devem expor estrutura interna ou IDs de usuários.
- Imagens privadas servidas via signed URLs com expiração.
- Scan antivírus/malware recomendado antes de armazenar em produção.

## 5. Regras de Autenticação

- Senhas com hash `bcrypt` (custo mínimo 12) ou `Argon2id`.
- JWT access token (12h) + refresh token (7 dias) com revogação.
- Refresh tokens armazenados em `user_sessions` com controle de revogação.
- Rate limit em endpoints de login e criação de conta.
- Logout revoga a sessão no servidor.

## 6. Regras de Autorização

- `USER`: acessa apenas seus próprios dados.
- `ADMIN`: gerencia dados da plataforma com auditoria.
- `AUDITOR`: leitura de logs, sem alteração.
- Ações sensíveis (exclusão em lote, edição de permissão, exportação) auditadas.

## 7. Regras de Logs e Auditoria

- Registrar em `security_audit_logs`: login, logout, falha de login, criação/edição/exclusão de peças, criação de outfit, upload de foto, tentativa de acesso negado, exportação de dados.
- Logs sem senhas, tokens ou chaves.
- IPs de acesso registrados para análise de anomalias.

## 8. Checklist de Segurança Antes de Produção

- [ ] `.env` não está no repositório
- [ ] Usuário root removido da aplicação
- [ ] Backup gerado e testado
- [ ] Isolamento de dados por user_id validado
- [ ] Upload de imagem validado (MIME + tamanho)
- [ ] Imagens privadas protegidas por signed URLs
- [ ] JWT com expiração configurada
- [ ] Refresh token revogável
- [ ] Rate limit em auth ativo
- [ ] Outfits públicos vs privados diferenciados corretamente
- [ ] TLS ativo no banco
- [ ] Tabela de auditoria implementada
