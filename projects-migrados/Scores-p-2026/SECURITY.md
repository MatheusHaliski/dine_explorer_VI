# SECURITY.md — Scores-p-2026

## 1. Política de Proteção de Credenciais

- Nunca commitar `.env` ou arquivos com valores reais.
- Usar `.env.example` com nomes de variáveis sem valores.
- Rotacionar credenciais imediatamente em caso de exposição.

## 2. Regras de Banco de Dados

- Usuário `root` não usado pela aplicação.
- Usuário da aplicação: `scores_app_user` — apenas SELECT, INSERT, UPDATE, DELETE.
- Usuário de backup: `scores_backup_user` — apenas leitura para dump.
- Usuário somente-leitura: `scores_readonly_user` — relatórios e auditoria.
- TLS/SSL ativo em produção.
- Não expor `password_hash` em respostas de API.

## 3. Regras de Backup e Integridade de Pontuação

- Backup antes de qualquer alteração de dados em lote.
- Checksum SHA-256 para cada dump.
- Backups em local externo ao repositório.
- **Pontuações não podem ser alteradas sem permissão de ADMIN.**
- Toda alteração de pontuação registrada em `score_history` (log imutável).
- Restauração de backup exige confirmação manual e registro de auditoria.

## 4. Regras de Autenticação

- Senhas com hash `bcrypt` (custo mínimo 12) ou `Argon2id`.
- JWT com expiração de 8h + refresh token (7 dias).
- Refresh token armazenado server-side com possibilidade de revogação.
- Logout revoga o refresh token imediatamente.
- Endpoints de auth com rate limit (10 tentativas/minuto por IP).

## 5. Regras de Autorização

- `USER`: visualiza apenas seus próprios scores.
- `ADMIN`: gerencia scores com auditoria obrigatória em cada ação.
- `AUDITOR`: leitura de logs e relatórios, sem alteração de dados.
- Toda ação de ADMIN registrada em `security_audit_logs`.
- Proibido alterar `score_id` de outro usuário apenas trocando ID na URL.

## 6. Regras de Logs

- Logs sem senhas, tokens ou dados pessoais.
- Tentativas de acesso negado registradas.
- Alterações de pontuação registradas com `old_value`, `new_value`, `changed_by`.

## 7. Checklist de Segurança Antes de Produção

- [ ] `.env` não está no repositório
- [ ] Usuário root removido da aplicação
- [ ] Backup gerado e testado
- [ ] Alterações de pontuação auditadas
- [ ] JWT com expiração configurada
- [ ] Refresh token revogável
- [ ] Rate limit em auth ativo
- [ ] Usuário não acessa scores de outro usuário
- [ ] TLS ativo no banco
