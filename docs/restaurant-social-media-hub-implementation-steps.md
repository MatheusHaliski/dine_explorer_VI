# Restaurant Social Media Hub: Hands-on Implementation Steps

## 1) Prepare Firebase and claims
1. Create custom claims per restaurant member (`restaurantId`, `restaurantRole`).
2. Deploy `firestore.rules`.
3. Create composite indexes for:
   - `conversations(status, updatedAt desc)`
   - `ugc(status, createdAt desc)`
   - `stories(expiresAt asc)`

## 2) Seed the base restaurant data
1. Write `restaurants/{restaurantId}/members/{uid}` docs for managers, attendants, workers.
2. Write `restaurants/{restaurantId}/customers/{uid}` docs with loyalty fields.
3. Validate `/dashboard/people?restaurantId=<id>`.

## 3) Launch inbox and issue queue
1. Create conversation via `POST /api/restaurants/:restaurantId/conversations`.
2. Assign staff via `PATCH /api/restaurants/:restaurantId/conversations/:conversationId`.
3. Create ticket via `POST /api/restaurants/:restaurantId/issues`.
4. List open tickets via `GET /api/restaurants/:restaurantId/issues`.

## 4) Launch public social layer
1. Publish posts via `POST /api/restaurants/:restaurantId/posts`.
2. Publish 24h story via `POST /api/restaurants/:restaurantId/stories`.
3. Submit UGC via `POST /api/restaurants/:restaurantId/ugc`.
4. Moderate UGC via `PATCH /api/restaurants/:restaurantId/ugc` (`approved`/`rejected`).
5. Create events via `POST /api/restaurants/:restaurantId/events`.

## 5) Launch internal channels
1. Create channel docs (e.g. `frontdesk`, `kitchen`) under `operationsChannels`.
2. Send messages to `/api/restaurants/:restaurantId/operations/channels/:channelId/messages`.
3. Use manager/attendant roles for operational updates and escalations.

## 6) Activate Shopify integration
1. Set Shopify credentials in server env.
2. Point webhooks to `POST /api/shopify/webhooks`.
3. Run `POST /api/shopify/sync` for initial catalog pull.
4. Use `POST /api/orders/create` from shoppable post CTA.

## 7) Track KPIs
1. First response time from conversation `createdAt` to first staff reply.
2. Resolution time from `createdAt` to `resolved`.
3. Conversation-to-order by linking `conversationId` on order docs.
4. Escalation rate by intent/status transitions.
