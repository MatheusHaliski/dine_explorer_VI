# Relatório de Migração — FAI-TCC-2026 (Fashion AI)

| Campo | Valor |
|---|---|
| Projeto | FAI-TCC-2026 |
| Banco antigo | Firestore / Firebase `funcionarioslistaapp2025` (a confirmar) |
| Banco novo | MySQL `fai_tcc_2026` |
| Data da migração | A preencher |
| Framework | A identificar (código do projeto Fashion AI não está neste repositório) |

## Coleções Previstas → Tabelas MySQL

| Coleção / Entidade antiga | Tabela MySQL | Status |
|---|---|---|
| `users` | `users` | Migration criada |
| (novo) | `user_sessions` | Migration criada |
| `wardrobeItems` | `wardrobe_items` | Migration criada |
| `outfits` | `outfits` | Migration criada |
| (relação) | `outfit_items` | Migration criada |
| `outfitCards` | `outfit_cards` | Migration criada |
| `photos` | `photos` | Migration criada |
| `history` | `wear_history` | Migration criada |
| `brands` | `brands` | Migration criada |
| `retailBrands` | `retail_brands` | Migration criada |
| (novo) | `search_filters` | Migration criada |
| (novo) | `security_audit_logs` | Migration criada |

## Backups Gerados

| Arquivo | Checksum | Data |
|---|---|---|
| A preencher após execução | | |

## Usuários de Banco Criados

| Usuário | Permissões | Host |
|---|---|---|
| `fai_app_user` | SELECT, INSERT, UPDATE, DELETE | `%` |
| `fai_readonly_user` | SELECT | `%` |
| `fai_backup_user` | SELECT, LOCK TABLES, SHOW VIEW, TRIGGER, EVENT | `localhost` |

## Pendências

- [ ] Importar código do projeto Fashion AI para `/projects-migrados/FAI-TCC-2026/`
- [ ] Confirmar banco de dados original
- [ ] Exportar dados do banco antigo (Firebase export para JSON se Firestore)
- [ ] Criar scripts de importação para MySQL
- [ ] Validar isolamento de dados privados de cada usuário
- [ ] Configurar storage seguro para fotos (signed URLs)
- [ ] Implementar validação de MIME type no upload
- [ ] Integrar IA (Anthropic API) no novo ambiente

## Status Final

**PLANEJAMENTO CONCLUÍDO — CÓDIGO FONTE PENDENTE DE IMPORTAÇÃO**
