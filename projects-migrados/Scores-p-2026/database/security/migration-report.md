# Relatório de Migração — Scores-p-2026

| Campo | Valor |
|---|---|
| Projeto | Scores-p-2026 |
| Banco antigo | Vinculado ao projeto Firebase `funcionarioslistaapp2025` (tipo a confirmar) |
| Banco novo | MySQL `scores_p_2026` |
| Data da migração | A preencher |
| Framework | A identificar (código do projeto Scores não está neste repositório) |

## Tabelas Planejadas

| Tabela | Status |
|---|---|
| `users` | Migration criada |
| `scores` | Migration criada |
| `score_history` | Migration criada |
| `reports` | Migration criada |
| `security_audit_logs` | Migration criada |

## Backups Gerados

| Arquivo | Checksum | Data |
|---|---|---|
| A preencher após execução | | |

## Usuários de Banco Criados

| Usuário | Permissões | Host |
|---|---|---|
| `scores_app_user` | SELECT, INSERT, UPDATE, DELETE | `%` |
| `scores_readonly_user` | SELECT | `%` |
| `scores_backup_user` | SELECT, LOCK TABLES, SHOW VIEW, TRIGGER, EVENT | `localhost` |

## Pendências

- [ ] Importar código do projeto Scores para `/projects-migrados/Scores-p-2026/`
- [ ] Identificar banco de dados original (Firebase? MySQL? SQLite?)
- [ ] Exportar dados do banco antigo
- [ ] Criar scripts de importação para MySQL
- [ ] Mapear entidades exatas do projeto original
- [ ] Validar quantidade de registros migrados
- [ ] Configurar autenticação no novo projeto

## Status Final

**PLANEJAMENTO CONCLUÍDO — CÓDIGO FONTE PENDENTE DE IMPORTAÇÃO**
