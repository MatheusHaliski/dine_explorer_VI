# DineExplorer-p-2026

Plataforma de exploração e gerenciamento de restaurantes. Migrado de `funcionarioslistaapp2025` para projeto independente.

## Tecnologias

- Next.js 16 + React 19 + TypeScript
- Firebase Auth (client) + Firebase Admin SDK (server)
- Firestore (`newdedb`) → migração para MySQL `dine_explorer_2026`
- Anthropic Claude SDK (BioDine™ AI features)
- Tailwind CSS + shadcn/ui
- bcryptjs (hash de PIN)

## Instalação

```bash
cd DineExplorer-p-2026/frontend   # ou raiz se monolítico
npm install
```

## Configurar Ambiente

```bash
cp .env.example .env
# Editar .env com valores reais (nunca commitar)
```

Variáveis obrigatórias:

| Variável | Descrição |
|---|---|
| `NEXT_FIREBASE_ADMIN_PROJECT_ID` | ID do projeto Firebase (novo projeto) |
| `NEXT_FIREBASE_ADMIN_CLIENT_EMAIL` | Email do service account |
| `NEXT_FIREBASE_ADMIN_PRIVATE_KEY` | Chave privada do service account |
| `NEXT_FIREBASE_DATABASE_ID` | ID do Firestore database |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API Key do Firebase Client |
| `PIN_COOKIE_SECRET` | Secret para assinar cookies de sessão (min 32 chars) |

## Rodar em Desenvolvimento

```bash
npm run dev
# http://localhost:3000
```

## Rodar em Produção

```bash
npm run build
npm start
```

## Executar Backup do Banco

```bash
cd database/scripts
# Configurar BACKUP_DB_PASSWORD no .env
./backup-mysql.sh
```

O backup é salvo em `database/backups/` com checksum SHA-256. **Nunca versionar os arquivos de backup.**

## Restaurar Backup

```bash
cd database/scripts
./restore-mysql.sh ../backups/dine_explorer_2026_backup_YYYYMMDD_HHMMSS.sql.gz
# Digitar CONFIRMAR quando solicitado
```

Sempre testar restore em banco de teste antes de produção.

## Validar Conexão com Banco

```bash
# MySQL
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME -e "SELECT 1;"
```

## Validar Autenticação

1. Acessar `http://localhost:3000/authview`
2. Fazer login com credencial válida
3. Verificar cookie `restaurantcards_session` em DevTools
4. Acessar rota protegida e confirmar que retorna 200

## Executar Migrations

```bash
# Executar em ordem
mysql -u root -p dine_explorer_2026 < database/migrations/001_create_users.sql
mysql -u root -p dine_explorer_2026 < database/migrations/002_create_restaurants.sql
# ... continuar até 010
```

## Estrutura de Pastas

```
DineExplorer-p-2026/
├── frontend/          # Código Next.js (ou raiz se monolítico)
├── backend/           # API routes (se separado)
├── database/
│   ├── migrations/    # Scripts SQL de criação de tabelas
│   ├── backups/       # Dumps (ignorado pelo Git)
│   ├── scripts/       # backup-mysql.sh, restore-mysql.sh, verify-backup.sh
│   └── security/      # migration-report.md
├── .env.example
├── .gitignore
├── README.md
└── SECURITY.md
```
