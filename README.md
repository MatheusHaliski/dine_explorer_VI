# Dine Explorer AI

> **BioDine™ — O Loop Ciberfísico do Sabor**
>
> Wearable-enhanced dining intelligence where the physical dining experience feeds back into the digital layer in real time.

## O que é o BioDine™?

O Dine Explorer AI é um **Sistema Ciberfísico (CPS)** completo para restaurantes.
O conceito central: wearables no pulso do cliente fecham o loop **físico → digital → físico** durante a experiência gastronômica.

```
Mundo físico         Sensores            Computação         Atuadores            Mundo físico
(cliente come)  →  (wearable: HRV,   →  (Claude AI:    →  (painel da equipe, →  (serviço mais
                    GSR, cadência,       análise de         iluminação, música,   personalizado,
                    temperatura)         emoção por          notif. do cliente)    melhor timing)
                                         prato)
```

### Sinais coletados pelo wearable
| Sinal | Tipo | O que revela |
|---|---|---|
| `heart_rate` | BPM | Excitação/engajamento com o prato |
| `gsr` | µSiemens (resposta galvânica) | Intensidade emocional |
| `motion_cadence` | Mastigações/min | Velocidade = prazer; lentidão = hesitação |
| `skin_temp` | °C | Conforto térmico e fisiológico |
| `hrv` | ms (variabilidade) | Relaxamento vs. estresse |

---

## Arquitetura CPS

### Camada de Percepção — Sensores
- **Wearable SDK** (anel ou pulseira BLE/NFC) envia batches de sinais a cada 30s
- NFC tap na mesa inicia a sessão biométrica automaticamente

### Camada de Comunicação
- BLE → WiFi do restaurante → Cloud (Next.js API Routes → Firestore)
- Protocolo: HTTPS/JSON para simplicidade; caminho de upgrade para MQTT

### Camada de Computação — Claude AI
- **Análise rápida** (`computeHappinessFromSignals`) — heurística sem chamada AI, latência ~0ms
- **Análise completa** (`analyzeBiometricWindow`) — Claude Haiku, acionada por mudança de prato
- **Orquestração de salão** (`generateDiningPulse`) — Claude Haiku, gera recomendações por mesa

### Camada de Atuação
| Atuador | Canal | Ação |
|---|---|---|
| Tablet da equipe | Dashboard Dining Pulse | Prompt de ação por mesa |
| Controlador de iluminação | API REST | `lightingTone`: warm / neutral / cool |
| Sistema de música | API REST | `musicEnergy`: low / medium / high |
| App do cliente | Push notification | "Seu corpo amou o risoto — salvar?" |

---

## Rotas da API

### BioDine™ Wearable
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/wearable/session` | Inicia sessão biométrica (check-in NFC/BLE) |
| `GET` | `/api/wearable/session` | Retorna sessão ativa do cliente |
| `POST` | `/api/wearable/signal` | Ingere batch de sinais do wearable |
| `GET` | `/api/restaurants/[id]/dining-pulse` | Snapshot em tempo real de todas as mesas |

### Concierge (atualizado com BioDine™)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/restaurants/[id]/concierge/checkin` | Check-in de humor |
| `POST` | `/api/restaurants/[id]/concierge/[recId]/accept` | Aceitar recomendação |
| `POST` | `/api/restaurants/[id]/concierge/[recId]/dismiss` | Recusar recomendação |

---

## Modelos de Dados Firestore

### Coleções BioDine™
```
restaurants/{restaurantId}/
  wearableSessions/{sessionId}   — WearableSessionRecord
  dishResponses/{responseId}     — DishResponseRecord

flavorProfiles/{customerUid}     — FlavorProfileRecord (cross-restaurant)
```

### FlavorProfile — Perfil Biológico de Sabor
Acumula automaticamente através de **todas** as visitas em **todos** os restaurantes da rede:
- `categoryAffinities` — afinidade por categoria (0–100), ex.: `{ "umami": 87, "spicy": 42 }`
- `topDishes` — pratos com maior score biométrico histórico
- `avoidList` — pratos que causaram desconforto detectável

---

## Dashboard Dining Pulse

Rota: `/dashboard/dining-pulse?restaurantId=xxx`

- Mapa de mesas com score de felicidade biométrica (0–100) por cor
- Tendência por mesa: `↑ rising` / `→ stable` / `↓ falling`
- Prompt de ação gerado por IA para cada mesa (ex.: "Ofereça a sobremesa — cliente está muito engajado")
- Recomendação de ambiente para o salão inteiro (iluminação + música)

---

## Módulos de IA

| Módulo | Arquivo | Função |
|---|---|---|
| BioDine AI | `app/lib/biodineAI.ts` | Análise biométrica + orquestração de salão |
| Concierge AI | `app/lib/conciergeAI.ts` | Recomendações de prato (agora com FlavorProfile) |

---

## Social Media Hub

- Ver `docs/social-media-hub-strategy.md` para estratégia de produto.
- Dashboard pages: `/dashboard/inbox` · `/dashboard/people` · `/dashboard/analytics`
- Shopify: webhooks, sync e criação de pedidos
- RBAC + Firestore rules scaffold

## Checklist para o time

- [ ] Configurar SDK do wearable parceiro (ex.: Oura Ring API, Garmin Health SDK, ou hardware próprio)
- [ ] Registrar webhook de mudança de prato no sistema de POS (point of sale) → trigger `dishWindowClosed`
- [ ] Conectar controlador de iluminação (ex.: Philips Hue Bridge) ao endpoint `dining-pulse`
- [ ] Configurar push notifications no app do cliente para "flavor insights"
- [ ] Definir política de privacidade para dados biométricos (LGPD)
- [ ] Treinar equipe de salão para interpretar os prompts do Dining Pulse
