# SECURITY.md — DineExplorer-p-2026

## 1. Política de Proteção de Credenciais

- Nunca commitar `.env`, `.env.local`, `.env.production` ou qualquer arquivo com valores reais.
- Usar `.env.example` com nomes de variáveis sem valores.
- Credenciais Firebase (service account, private key) jamais vão ao repositório.
- Chaves e arquivos `.pem`, `.key`, `.p12`, `serviceAccount*.json` estão no `.gitignore`.
- Rotacionar todas as credenciais imediatamente em caso de exposição suspeita.

## 2. Regras de Banco de Dados

- O usuário `root` não é usado pela aplicação — apenas para criação inicial do banco.
- Cada projeto tem usuário específico com permissões mínimas (SELECT, INSERT, UPDATE, DELETE).
- Usuário de backup (`dine_backup_user`) tem permissão apenas para leitura/dump.
- Usuário somente-leitura (`dine_readonly_user`) para relatórios e auditoria.
- Ativar TLS/SSL na conexão em produção (`DB_SSL=true`).
- Nunca usar `GRANT ALL PRIVILEGES` para usuários da aplicação.
- Não expor `password_hash` em respostas de API.

## 3. Regras de Backup

- Gerar backup antes de qualquer migração ou operação destrutiva.
- Backups armazenados em local seguro fora do repositório (S3, GCS, NFS com restrição de acesso).
- Checksum SHA-256 gerado para cada dump.
- Backups compactados com `gzip`.
- Restauração nunca automatizada em produção sem confirmação manual explícita.
- Testar restore em ambiente de teste antes de produção.
- Retenção mínima: 30 dias.

## 4. Regras de Autenticação

- Senhas armazenadas com hash `bcrypt` (custo mínimo 12) ou `Argon2id`.
- Nunca armazenar senha em texto puro.
- Sessão implementada com HMAC-SHA256 (token `payload.signature`).
- TTL de sessão: 12 horas. Cookie `httpOnly`, `sameSite: lax`, `secure: true` em produção.
- Firebase Auth utilizado no cliente; Admin SDK apenas server-side.
- Logout destrói o cookie de sessão no servidor.

## 5. Regras de Autorização (RBAC)

- Roles: `platform_admin`, `restaurant_user`, `customer` (nível global).
- Roles de staff: `manager`, `attendant`, `worker` (nível de restaurante).
- Usuário acessa **apenas** recursos do próprio `restaurantId` ou `uid`.
- Regras Firestore validam `request.auth.token.restaurantId` e `restaurantRole`.
- Middleware de autorização aplicado em todas as rotas privadas.
- Endpoints administrativos requerem role explícita + log de auditoria.

## 6. Regras de API e CORS

- `CORS` não usa `*` em produção com autenticação.
- Origens permitidas definidas em `ALLOWED_ORIGINS`.
- Rate limit aplicado em `/api/auth/*` (máx. 10 tentativas/minuto por IP).
- Tamanho máximo de upload configurado no middleware.
- Headers de segurança: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.

## 7. Regras de Logs

- Logs nunca contêm senhas, tokens, chaves ou dados pessoais sensíveis.
- Eventos de autenticação registrados na tabela `security_audit_logs`.
- Logs de acesso a rotas administrativas auditados.
- IDs de sessão não aparecem em logs públicos.

## 8. Regras de Deploy

- Variáveis de ambiente injetadas via secrets do ambiente de deploy (nunca hardcoded).
- Secrets gerenciados via Firebase App Hosting secrets / Cloud Secret Manager.
- Branch de produção protegida — requer PR review antes de merge.
- Dependências auditadas com `npm audit` antes de cada release.

## 9. Checklist de Segurança Antes de Produção

- [ ] `.env` não está no repositório
- [ ] `.env.example` está presente e atualizado
- [ ] Nenhuma credencial hardcoded no código
- [ ] Usuário root removido da aplicação
- [ ] Backup gerado e testado
- [ ] Migrations executadas e validadas
- [ ] Rotas privadas exigem autenticação
- [ ] Usuário não acessa dados de outro usuário
- [ ] Rate limit ativo em endpoints de auth
- [ ] CORS configurado com origens específicas
- [ ] Logs auditados (sem senhas/tokens)
- [ ] Dependências auditadas (`npm audit`)
- [ ] TLS ativo no banco de dados (`DB_SSL=true`)
