# Mapa de Migração — funcionarioslistaapp2025 → Projetos Independentes

Data do planejamento: 2026-05-30

## Resumo

| Projeto antigo | Novo projeto | Banco antigo | Banco novo | Status |
|---|---|---|---|---|
| Dine Explorer VI | `DineExplorer-p-2026` | Firestore `newdedb` | MySQL `dine_explorer_2026` | Estrutura criada |
| Scores | `Scores-p-2026` | A confirmar | MySQL `scores_p_2026` | Estrutura criada |
| Fashion AI | `FAI-TCC-2026` | Firebase/Firestore | MySQL `fai_tcc_2026` | Estrutura criada |

## Regras Gerais Aplicadas

1. Nenhum projeto antigo foi apagado.
2. Nenhum banco antigo foi sobrescrito.
3. Nenhum comando destrutivo executado.
4. Nenhuma credencial exposta em arquivos versionados.
5. `.env`, backups e chaves privadas ignorados pelo `.gitignore`.
6. `.env.example` criado sem valores reais para todos os projetos.
7. Toda ação destrutiva futura exige backup + confirmação manual.

## Estrutura Criada

```
projects-migrados/
├── MIGRATION-MAP.md             ← Este arquivo
├── DineExplorer-p-2026/
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   ├── SECURITY.md
│   ├── frontend/
│   ├── backend/
│   └── database/
│       ├── migrations/           ← 10 migrations SQL
│       ├── backups/.gitkeep
│       ├── scripts/              ← backup, restore, verify
│       └── security/
│           ├── migration-report.md
│           └── checklist-seguranca.md
├── Scores-p-2026/
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   ├── SECURITY.md
│   ├── frontend/
│   ├── backend/
│   └── database/
│       ├── migrations/           ← 5 migrations SQL
│       ├── backups/.gitkeep
│       ├── scripts/              ← backup, restore, verify
│       └── security/
│           ├── migration-report.md
│           └── checklist-seguranca.md
└── FAI-TCC-2026/
    ├── .env.example
    ├── .gitignore
    ├── README.md
    ├── SECURITY.md
    ├── frontend/
    ├── backend/
    └── database/
        ├── migrations/           ← 10 migrations SQL
        ├── backups/.gitkeep
        ├── scripts/              ← backup, restore, verify
        └── security/
            ├── migration-report.md
            └── checklist-seguranca.md
```

## Próximos Passos (Ações Manuais Necessárias)

### Para todos os projetos
1. Criar novo projeto Firebase independente no Firebase Console.
2. Separar service accounts — cada projeto com seu próprio service account.
3. Configurar variáveis de ambiente em cada ambiente de deploy.

### DineExplorer-p-2026
1. Exportar dados do Firestore `newdedb` (usar `firebase firestore:export`).
2. Criar scripts de importação JSON → MySQL para cada coleção.
3. Executar migrations SQL em ordem (001 → 010).
4. Validar contagem de registros por tabela.
5. Testar autenticação e sessão no novo ambiente.
6. Rodar `backup-mysql.sh` e testar `restore-mysql.sh` em banco de teste.

### Scores-p-2026
1. Importar código fonte do projeto Scores.
2. Identificar banco de dados original.
3. Exportar dados.
4. Executar migrations SQL (001 → 005).
5. Implementar/revisar JWT + refresh token.
6. Validar isolamento de pontuações por user_id.

### FAI-TCC-2026
1. Importar código fonte do projeto Fashion AI.
2. Confirmar banco de dados original.
3. Exportar dados (Firebase export se Firestore).
4. Executar migrations SQL (001 → 010).
5. Configurar storage seguro para fotos (signed URLs).
6. Implementar validação de MIME type e tamanho no upload.
7. Testar isolamento: usuário A não acessa dados do usuário B.
8. Configurar Anthropic API key no novo ambiente.

## Riscos Identificados

| Risco | Projeto | Mitigação |
|---|---|---|
| Perda de dados na exportação Firestore | DineExplorer, FAI | Backup antes de qualquer ação; validar contagem de registros |
| Dados de usuários privados acessíveis publicamente | FAI-TCC-2026 | Implementar middleware `req.user.id === resource.user_id` |
| Credenciais do projeto antigo reutilizadas no novo | Todos | Criar novos service accounts no novo projeto Firebase |
| Projeto Scores sem código fonte neste repo | Scores | Importar código antes de executar migrations |
| Signed URLs expiradas bloqueando fotos | FAI-TCC-2026 | Configurar expiração adequada + refresh automático |
