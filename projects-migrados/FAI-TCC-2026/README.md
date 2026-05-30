# FAI-TCC-2026 — Fashion AI

Plataforma de guarda-roupa virtual com IA. Migrado de `funcionarioslistaapp2025` para projeto independente (TCC 2026).

## Funcionalidades Previstas

- Guarda-roupa virtual (adicionar peça por foto e formulário)
- Provador 2D
- Busca de peças, outfits, usuários e marcas com filtros
- Criar outfit manualmente ou com IA
- Gerenciar outfit cards salvos
- Histórico de vestimenta em linha do tempo com fotos
- Galeria de fotos ("Minhas fotos")
- Perfil do usuário com controle de visibilidade
- Configurações
- Temas futuros: Editor de peças, Provador 3D, AURORA CPS

## Tecnologias

- A confirmar (código fonte pendente de importação)
- MySQL `fai_tcc_2026`
- JWT Authentication + refresh token
- Anthropic Claude API (geração de outfits com IA)
- Storage de imagens (bucket configurável)

## Instalação

```bash
cd FAI-TCC-2026
npm install
```

## Configurar Ambiente

```bash
cp .env.example .env
# Editar .env com valores reais
```

Variáveis obrigatórias:

| Variável | Descrição |
|---|---|
| `DB_HOST` | Host do MySQL |
| `DB_NAME` | `fai_tcc_2026` |
| `DB_USER` | `fai_app_user` |
| `DB_PASSWORD` | Senha do usuário da aplicação |
| `JWT_SECRET` | Secret JWT (min 32 chars) |
| `STORAGE_BUCKET` | Nome do bucket de imagens |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic (IA) |

## Executar Migrations

```bash
mysql -u root -p fai_tcc_2026 < database/migrations/001_create_users.sql
mysql -u root -p fai_tcc_2026 < database/migrations/002_create_user_sessions.sql
mysql -u root -p fai_tcc_2026 < database/migrations/003_create_brands.sql
mysql -u root -p fai_tcc_2026 < database/migrations/004_create_wardrobe_items.sql
mysql -u root -p fai_tcc_2026 < database/migrations/005_create_outfits.sql
mysql -u root -p fai_tcc_2026 < database/migrations/006_create_outfit_cards.sql
mysql -u root -p fai_tcc_2026 < database/migrations/007_create_photos.sql
mysql -u root -p fai_tcc_2026 < database/migrations/008_create_wear_history.sql
mysql -u root -p fai_tcc_2026 < database/migrations/009_create_search_filters.sql
mysql -u root -p fai_tcc_2026 < database/migrations/010_create_security_audit_logs.sql
```

## Executar Backup

```bash
cd database/scripts
./backup-mysql.sh
```

## Regras de Segurança Críticas

- Cada usuário acessa **apenas** seus próprios dados (`wardrobe_items`, `outfits`, `photos`).
- Fotos com `visibility = 'private'` nunca são acessíveis por outros usuários.
- Outfits com `visibility = 'public'` aparecem na busca geral.
- Upload de imagens: validar MIME type no servidor, tamanho máximo 10 MB.
- Imagens privadas servidas via signed URLs com expiração.

## Estrutura de Pastas

```
FAI-TCC-2026/
├── frontend/
├── backend/
├── database/
│   ├── migrations/    # 10 migrations criadas
│   ├── backups/       # Ignorado pelo Git
│   ├── scripts/
│   └── security/
├── .env.example
├── .gitignore
├── README.md
└── SECURITY.md
```
