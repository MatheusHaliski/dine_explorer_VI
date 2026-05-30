# Scores-p-2026

Sistema de gerenciamento de pontuações. Migrado de `funcionarioslistaapp2025` para projeto independente.

## Tecnologias

- A identificar (código fonte pendente de importação)
- MySQL `scores_p_2026`
- JWT Authentication

## Instalação

```bash
cd Scores-p-2026
npm install   # ou equivalente ao framework utilizado
```

## Configurar Ambiente

```bash
cp .env.example .env
# Editar .env com valores reais (nunca commitar)
```

Variáveis obrigatórias:

| Variável | Descrição |
|---|---|
| `DB_HOST` | Host do MySQL |
| `DB_NAME` | `scores_p_2026` |
| `DB_USER` | `scores_app_user` |
| `DB_PASSWORD` | Senha do usuário da aplicação |
| `JWT_SECRET` | Secret para assinar JWT (min 32 chars) |
| `JWT_EXPIRES_IN` | Expiração do access token (ex: `8h`) |
| `REFRESH_TOKEN_SECRET` | Secret para refresh token |

## Rodar em Desenvolvimento

```bash
npm run dev   # porta 3001
```

## Executar Migrations

```bash
mysql -u root -p scores_p_2026 < database/migrations/001_create_users.sql
mysql -u root -p scores_p_2026 < database/migrations/002_create_scores.sql
mysql -u root -p scores_p_2026 < database/migrations/003_create_score_history.sql
mysql -u root -p scores_p_2026 < database/migrations/004_create_reports.sql
mysql -u root -p scores_p_2026 < database/migrations/005_create_security_audit_logs.sql
```

## Executar Backup

```bash
cd database/scripts
./backup-mysql.sh
```

## Restaurar Backup

```bash
cd database/scripts
./restore-mysql.sh ../backups/scores_p_2026_backup_YYYYMMDD.sql.gz
```

## Regras de Negócio Importantes

- Pontuações só podem ser alteradas por usuários com role `ADMIN`.
- Toda alteração de pontuação gera registro em `score_history`.
- Usuário `USER` visualiza apenas seus próprios scores.

## Estrutura de Pastas

```
Scores-p-2026/
├── frontend/
├── backend/
├── database/
│   ├── migrations/
│   ├── backups/       # Ignorado pelo Git
│   ├── scripts/
│   └── security/
├── .env.example
├── .gitignore
├── README.md
└── SECURITY.md
```
