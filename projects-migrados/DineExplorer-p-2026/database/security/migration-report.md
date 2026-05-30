# Relatório de Migração — DineExplorer-p-2026

| Campo | Valor |
|---|---|
| Projeto | DineExplorer-p-2026 |
| Banco antigo | Firestore (`newdedb`) — projeto Firebase `funcionarioslistaapp2025` |
| Banco novo | MySQL `dine_explorer_2026` |
| Data da migração | A preencher |
| Framework | Next.js 16 + React 19 + TypeScript |
| Backend | API Routes (Next.js App Router) |

## Coleções Firestore → Tabelas MySQL

| Coleção Firestore | Tabela MySQL | Status |
|---|---|---|
| `restaurants` | `restaurants` | Migration criada |
| `restaurants/{id}/reviews` | `reviews` | Migration criada |
| `restaurants/{id}/members` | `restaurant_members` | Migration criada |
| `restaurants/{id}/conversations` | `conversations` | Migration criada |
| `restaurants/{id}/posts` | `social_posts` | Migration criada |
| `restaurants/{id}/catalog` | `catalog_items` | Migration criada |
| `restaurants/{id}/orders` | `orders` + `order_items` | Migration criada |
| `restaurants/{id}/moodCheckins` | `mood_checkins` | Migration criada |
| `restaurants/{id}/conciergeRecommendations` | `concierge_recommendations` | Migration criada |
| `flavorProfiles` | A mapear | Pendente |
| `restaurants/{id}/diningSessions` | A mapear | Pendente |
| `restaurants/{id}/dishResponses` | A mapear | Pendente |
| (novo) | `security_audit_logs` | Migration criada |
| (novo) | `users` | Migration criada |

## Backups Gerados

| Arquivo | Checksum | Data |
|---|---|---|
| A preencher após execução | | |

## Usuários de Banco Criados

| Usuário | Permissões | Host |
|---|---|---|
| `dine_app_user` | SELECT, INSERT, UPDATE, DELETE | `%` |
| `dine_readonly_user` | SELECT | `%` |
| `dine_backup_user` | SELECT, LOCK TABLES, SHOW VIEW, TRIGGER, EVENT | `localhost` |

## Problemas Encontrados

- Nenhum durante planejamento. A atualizar durante execução real.

## Pendências

- [ ] Exportar dados do Firestore (`newdedb`) para JSON
- [ ] Criar scripts de importação JSON → MySQL
- [ ] Mapear coleções `diningSessions`, `dishResponses`, `flavorProfiles`
- [ ] Validar quantidade de registros migrados vs origem
- [ ] Configurar novo Firebase Project independente (separado de `funcionarioslistaapp2025`)
- [ ] Atualizar variáveis de ambiente para apontar ao novo projeto Firebase
- [ ] Testar autenticação Firebase no novo projeto
- [ ] Testar restore em banco de teste

## Status Final

**PLANEJAMENTO CONCLUÍDO — EXECUÇÃO PENDENTE**
