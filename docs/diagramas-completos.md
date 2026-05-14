# Diagramas completos do sistema (BPMN, UML e Modelo Lógico-Relacional)

Este documento consolida **todos os principais diagramas possíveis e úteis** para o sistema FriendlyEats deste repositório, cobrindo:

- Processos de negócio (visão BPMN);
- Diagramas UML (casos de uso, sequência, classes, atividades, estados, componentes, implantação, pacotes, comunicação e visão temporal);
- Modelo lógico-relacional (visão tabular relacional derivada do modelo operacional em Firestore).

> Observação: o backend usa Firestore (NoSQL). A modelagem lógico-relacional abaixo representa uma visão de governança e integração analítica, sem alterar a persistência operacional atual.

---

## 1) BPMN — Processos de Negócio (todos os fluxos centrais)

## 1.1 Cadastro de usuário

```mermaid
flowchart LR
  A([Início]) --> B[Preencher nome, email e senha]
  B --> C[Validar dados obrigatórios]
  C -->|Inválido| D[Retornar erro de validação]
  D --> B
  C -->|Válido| E[Verificar existência do email]
  E -->|Já existe| F[Retornar conflito 409]
  E -->|Não existe| G[Gerar hash/salt da senha]
  G --> H[Persistir usuário em vsusercontrol]
  H --> I[Retornar sucesso 201]
  I --> J([Fim])
```

## 1.2 Login e verificação de credenciais

```mermaid
flowchart LR
  A([Início]) --> B[Receber email/senha]
  B --> C[Rate limit por IP/email]
  C -->|Excedido| D[Responder 429]
  C -->|Permitido| E[Buscar usuário por email]
  E -->|Não encontrado| F[Responder 401]
  E -->|Encontrado| G[Comparar senha com hash]
  G -->|Inválida| H[Responder 401]
  G -->|Válida| I[Gerar sessão/token]
  I --> J[Retornar autenticado]
  J --> K([Fim])
```

## 1.3 Recuperação de senha

```mermaid
flowchart LR
  A([Início]) --> B[Receber email]
  B --> C[Validar formato]
  C -->|Inválido| D[Erro de validação]
  C -->|Válido| E[Gerar token de reset + expiração]
  E --> F[Persistir token em password_reset]
  F --> G[Retornar aceite de solicitação]
  G --> H([Fim])
```

## 1.4 Consulta de catálogo/restaurantes

```mermaid
flowchart LR
  A([Início]) --> B[Selecionar filtros de busca]
  B --> C[Chamar API de restaurantes]
  C --> D[Consultar coleção restaurants]
  D --> E[Retornar lista paginada/filtrada]
  E --> F[Renderizar cards]
  F --> G([Fim])
```

## 1.5 Publicação de avaliação (review)

```mermaid
flowchart LR
  A([Início]) --> B[Usuário envia nota + texto]
  B --> C[Validar rating e conteúdo]
  C -->|Inválido| D[Erro 400]
  C -->|Válido| E[Salvar review]
  E --> F[Recalcular média do restaurante]
  F --> G[Atualizar rating/starsgiven]
  G --> H[Retornar review + rating atualizado]
  H --> I([Fim])
```

## 1.6 Operação do hub social (postagens e conversas)

```mermaid
flowchart LR
  A([Início]) --> B[Criar post ou mensagem]
  B --> C[Validar membro e permissão RBAC]
  C -->|Sem permissão| D[Responder 403]
  C -->|Permitido| E[Persistir conteúdo]
  E --> F[Aplicar triagem e classificação]
  F --> G[Atualizar inbox/analytics]
  G --> H([Fim])
```

## 1.7 Integração Shopify (sincronização e webhook)

```mermaid
flowchart LR
  A([Início]) --> B[Receber webhook ou iniciar sync manual]
  B --> C[Validar assinatura HMAC/idempotência]
  C -->|Inválido| D[Descartar evento]
  C -->|Válido| E[Persistir evento/ordem]
  E --> F[Atualizar catálogo/indicadores]
  F --> G[Confirmar processamento]
  G --> H([Fim])
```

---

## 2) UML — Todos os tipos relevantes para o sistema

## 2.1 Diagrama de Casos de Uso

```mermaid
flowchart LR
  U1([Visitante])
  U2([Usuário autenticado])
  U3([Atendente])
  U4([Gestor])
  U5([Sistema Shopify])

  subgraph Sistema FriendlyEats
    C1((Cadastrar conta))
    C2((Autenticar))
    C3((Recuperar senha))
    C4((Consultar restaurantes))
    C5((Ver detalhes do restaurante))
    C6((Publicar review))
    C7((Gerenciar membros e clientes))
    C8((Operar inbox social))
    C9((Analisar dashboard))
    C10((Processar webhooks Shopify))
    C11((Executar sincronização Shopify))
  end

  U1 --> C1
  U1 --> C2
  U1 --> C4
  U2 --> C3
  U2 --> C5
  U2 --> C6
  U3 --> C8
  U3 --> C7
  U4 --> C7
  U4 --> C9
  U5 --> C10
  U4 --> C11
```

## 2.2 Diagrama de Classes

```mermaid
classDiagram
  class Restaurant {
    +id: string
    +name: string
    +category: string
    +rating: number
    +starsgiven: number
    +country: string
    +state: string
    +city: string
  }

  class Review {
    +id: string
    +restaurantId: string
    +rating: number
    +text: string
    +userEmail: string
    +createdAt: string
  }

  class UserControl {
    +id: string
    +name: string
    +email: string
    +passwordHash: string
    +passwordSalt: string
    +createdAt: string
  }

  class PasswordReset {
    +id: string
    +email: string
    +token: string
    +expiresAt: string
    +used: boolean
  }

  class Member {
    +id: string
    +restaurantId: string
    +email: string
    +role: string
  }

  class Conversation {
    +id: string
    +restaurantId: string
    +customerId: string
    +status: string
    +slaDueAt: string
  }

  class Post {
    +id: string
    +restaurantId: string
    +channel: string
    +content: string
    +createdAt: string
  }

  Restaurant "1" --> "0..*" Review : possui
  Restaurant "1" --> "0..*" Member : possui
  Restaurant "1" --> "0..*" Post : publica
  UserControl "1" --> "0..*" Review : escreve
  UserControl "1" --> "0..*" PasswordReset : solicita
  Conversation "0..*" --> "1" Member : atendidaPor
```

## 2.3 Diagrama de Sequência — Envio de review

```mermaid
sequenceDiagram
  actor User
  participant UI as Frontend
  participant API as /api/restaurants/{id}/reviews
  participant DB as Firestore

  User->>UI: Envia texto e nota
  UI->>API: POST payload
  API->>API: Validação de dados
  API->>DB: Inserir review
  DB-->>API: reviewId
  API->>DB: Buscar reviews do restaurante
  DB-->>API: lista de reviews
  API->>API: Recalcular média
  API->>DB: Atualizar restaurante
  API-->>UI: Review + rating
```

## 2.4 Diagrama de Atividades — Recuperar senha

```mermaid
flowchart TD
  A([Start]) --> B[Informar email]
  B --> C{Email válido?}
  C -- Não --> D[Exibir erro]
  D --> B
  C -- Sim --> E[Gerar token]
  E --> F[Salvar reset]
  F --> G[Retornar confirmação]
  G --> H([End])
```

## 2.5 Diagrama de Estados — Conversa do inbox

```mermaid
stateDiagram-v2
  [*] --> Novo
  Novo --> EmTriagem: classificar intenção
  EmTriagem --> EmAtendimento: atribuir membro
  EmAtendimento --> AguardandoCliente: solicitar info
  AguardandoCliente --> EmAtendimento: cliente responde
  EmAtendimento --> Resolvido: solução entregue
  Resolvido --> Fechado: confirmação final
  Fechado --> [*]
```

## 2.6 Diagrama de Componentes

```mermaid
flowchart LR
  FE[Next.js Frontend]
  API[API Routes Next.js]
  AUTH[Auth Session + Security libs]
  SOCIAL[Hub Social + RBAC + Triage]
  SHOP[Shopify Integration]
  DB[(Firestore)]

  FE --> API
  API --> AUTH
  API --> SOCIAL
  API --> SHOP
  AUTH --> DB
  SOCIAL --> DB
  SHOP --> DB
```

## 2.7 Diagrama de Implantação (Deployment)

```mermaid
flowchart LR
  User[Browser do usuário] --> Vercel[Vercel/Node Runtime]
  Vercel --> NextApp[Aplicação Next.js]
  NextApp --> Firebase[Firebase Auth + Firestore]
  Shopify[Shopify SaaS] --> NextApp
```

## 2.8 Diagrama de Pacotes

```mermaid
flowchart TB
  subgraph App
    P1[app/api]
    P2[app/lib]
    P3[app/dashboard]
    P4[app/authview/signupview]
    P5[app/gate]
  end

  P1 --> P2
  P3 --> P2
  P4 --> P2
  P5 --> P2
```

## 2.9 Diagrama de Comunicação (colaboração)

```mermaid
flowchart LR
  U[Usuário] -->|1: ação| UI[Frontend]
  UI -->|2: POST| REV[Reviews API]
  REV -->|3: write| FS[(Firestore)]
  REV -->|4: aggregate| RES[Restaurant Aggregate]
  RES -->|5: update| FS
  REV -->|6: response| UI
```

## 2.10 Diagrama Temporal (Timing simplificado)

```mermaid
gantt
  title Timing simplificado - fluxo de review
  dateFormat  X
  axisFormat %L
  section Frontend
  Captura input        :a1, 0, 1
  Envia requisição     :a2, after a1, 1
  section API
  Validação            :b1, 1, 1
  Grava review         :b2, after b1, 1
  Atualiza média       :b3, after b2, 1
  section Persistência
  Write/Read Firestore :c1, 2, 2
```

---

## 3) Diagramas lógico-relacionais de banco (todos os módulos centrais)

## 3.1 ER lógico-relacional consolidado

```mermaid
erDiagram
  USERS {
    string user_id PK
    string name
    string email UK
    string password_hash
    string password_salt
    int password_iterations
    string password_algo
    datetime created_at
  }

  PASSWORD_RESETS {
    string reset_id PK
    string user_email FK
    string token
    datetime created_at
    datetime expires_at
    boolean used
  }

  RESTAURANTS {
    string restaurant_id PK
    string name
    string category
    float rating
    int stars_given
    string country
    string state
    string city
    string address
  }

  REVIEWS {
    string review_id PK
    string restaurant_id FK
    string user_email FK
    int rating
    text review_text
    datetime created_at
  }

  MEMBERS {
    string member_id PK
    string restaurant_id FK
    string email
    string role
    datetime created_at
  }

  CUSTOMERS {
    string customer_id PK
    string restaurant_id FK
    string name
    string channel
    string external_ref
    datetime created_at
  }

  CONVERSATIONS {
    string conversation_id PK
    string restaurant_id FK
    string customer_id FK
    string assigned_member_id FK
    string status
    string intent
    datetime sla_due_at
    datetime updated_at
  }

  POSTS {
    string post_id PK
    string restaurant_id FK
    string channel
    text content
    datetime created_at
  }

  CATALOG_ITEMS {
    string item_id PK
    string restaurant_id FK
    string sku
    string name
    decimal price
    boolean active
    datetime updated_at
  }

  SHOPIFY_EVENTS {
    string event_id PK
    string topic
    string shop_domain
    string payload_hash
    datetime received_at
    boolean processed
  }

  USERS ||--o{ PASSWORD_RESETS : requests
  USERS ||--o{ REVIEWS : writes
  RESTAURANTS ||--o{ REVIEWS : has
  RESTAURANTS ||--o{ MEMBERS : has
  RESTAURANTS ||--o{ CUSTOMERS : has
  RESTAURANTS ||--o{ CONVERSATIONS : has
  RESTAURANTS ||--o{ POSTS : has
  RESTAURANTS ||--o{ CATALOG_ITEMS : has
  CUSTOMERS ||--o{ CONVERSATIONS : opens
  MEMBERS ||--o{ CONVERSATIONS : handles
```

## 3.2 Dicionário lógico resumido

- **USERS**: identidade local e credenciais protegidas por hash/salt.
- **RESTAURANTS**: entidade principal de catálogo e reputação.
- **REVIEWS**: avaliações textuais e numéricas que recalculam nota média.
- **MEMBERS/CUSTOMERS/CONVERSATIONS/POSTS**: núcleo do hub social e atendimento.
- **CATALOG_ITEMS/SHOPIFY_EVENTS**: integração comercial e rastreabilidade de eventos.

---

## 4) Como usar estes diagramas

- Copie os blocos Mermaid para editores compatíveis (GitHub, Mermaid Live Editor, MkDocs etc.).
- Para documentação executiva, exporte cada diagrama em PNG/SVG.
- Para governança técnica, mantenha este arquivo versionado junto com mudanças de API e schema.
