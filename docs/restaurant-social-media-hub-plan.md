# Restaurant Social Media Hub: Product & Technical Plan

This guide proposes concrete ideas and an implementation path for evolving FriendlyEats into a restaurant social media hub where clients, attendants, managers, and workers can communicate, coordinate, and drive online orders.

## 1) Product ideas to turn the project into a social media hub

### A. Public-facing social layer

#### Restaurant timeline feed
- Post updates (new menu item, event, promo, behind-the-scenes video).
- Mix media types: image, short video, text, poll.
- Add post categories (promo, event, announcement, ugc-feature).

#### Stories / daily highlights
- 24-hour expiring cards for limited-time offers.
- Track views and clicks to menu/order pages.

#### User-generated content (UGC) gallery
- Let customers upload dish photos and tag menu items.
- Managers can approve/reject UGC before publishing.

#### Review + reaction system
- Keep star ratings and short reviews, plus reactions (like/heart/fire).
- Add manager response on each review.

#### Community campaigns
- “Photo of the week” contests.
- Referral and check-in rewards.

### B. Conversion and retention features

#### Shoppable posts
- Each post can link to one or more menu items or bundles.
- CTA examples: `Order now`, `Reserve table`, `Ask attendant`.

#### Automated social DM prompts
- Rule-based auto-replies for FAQ (hours, location, allergens).
- Escalate to human attendant for complex conversations.

#### Loyalty and rewards
- Points for posting content, referrals, and repeated purchases.
- Customer tiers (Bronze/Silver/Gold) for personalized offers.

#### Local event pages
- Event post templates: live music nights, chef tables, tasting menus.
- RSVP + reminders.

### C. Internal team social workspace

#### Operations board
- Managers post internal announcements and shift notes.
- Workers can acknowledge tasks.

#### Shift and escalation chat channels
- Channel examples: frontdesk, kitchen, delivery, manager-on-duty.
- Fast handoff between attendant and manager.

#### Customer issue queue
- Central inbox with statuses: new, assigned, waiting_customer, resolved.
- SLA timers and escalation rules.

## 2) How clients connect to managers and attendants

Use a unified conversation model so all communication (chat, DM, complaint, order support) shares one structure.

### Recommended flow
1. **Client starts conversation** from restaurant profile, order page, or post CTA.
2. **Auto-triage** bot tags intent: reservation, order-help, complaint, delivery, feedback.
3. **Routing** sends simple intents to attendant queue and sensitive/escalated intents to manager queue.
4. **Assignment + SLA** allocates first available attendant or manager.
5. **Resolution + feedback** marks resolved and requests CSAT.

### Firestore collection design (example)

```text
restaurants/{restaurantId}
  conversations/{conversationId}
    participants: [{ uid, role, displayName }]
    channel: "in_app" | "instagram" | "whatsapp" | "facebook"
    intent: "reservation" | "order_help" | "complaint" | "feedback"
    status: "new" | "assigned" | "pending" | "resolved"
    assignedToUid: string | null
    priority: "low" | "normal" | "high"
    createdAt, updatedAt

    messages/{messageId}
      senderUid
      senderRole: "client" | "attendant" | "manager" | "worker" | "bot"
      text
      attachments[]
      createdAt
```

### Security rules concept
- Client can read/write only conversations where they are a participant.
- Attendants can access assigned conversations.
- Managers can access all restaurant conversations.
- Workers can access specific operational channels only.

## 3) How to list customers, attendants, managers, workers

Use RBAC (Role-Based Access Control) + scoped querying.

### Suggested user model

```text
users/{uid}
  displayName
  email
  phone
  globalRole: "platform_admin" | "restaurant_user" | "customer"

restaurants/{restaurantId}
  members/{uid}
    role: "manager" | "attendant" | "worker"
    permissions: string[]
    active: boolean
    joinedAt

restaurants/{restaurantId}
  customers/{uid}
    loyaltyTier
    totalOrders
    totalSpend
    lastVisitAt
    tags: ["vip", "allergy:gluten", "complaint-risk"]
```

### Listing screens to build

#### Customers list
- Filters: loyalty tier, order count, last visit, tags.
- Sort: total spend, recent activity.

#### Staff directory
- Tabs: managers / attendants / workers.
- Show online status and active assignments.

#### Role management page
- Promote attendant to manager.
- Disable worker access immediately.

### Query examples
- `members where role == "attendant" and active == true`
- `customers orderBy totalSpend desc limit 50`

### Best-practice notes
- Keep `users` for identity and shared profile info.
- Keep restaurant-specific role data in `restaurants/{id}/members`.
- Enforce with Firebase Auth custom claims and Firestore rules (not client-only checks).

## 4) How to integrate Shopify into this project

Use Shopify as the commerce backend and FriendlyEats as the social + engagement layer.

### Integration architecture

#### Catalog sync (Shopify -> Firebase)
- Pull products, variants, collections into `restaurants/{id}/catalog`.
- Schedule every 5–15 minutes via cron/Cloud Functions, or use webhooks.

#### Order creation (FriendlyEats -> Shopify)
- Client selects items from social post/menu.
- Backend API creates Shopify checkout/order.
- Return checkout URL or embedded checkout flow.

#### Order status sync (Shopify -> Firebase)
- Use webhooks for `orders/create`, `orders/paid`, `orders/fulfilled`, `orders/cancelled`.
- Update conversation timeline and push notifications.

#### Customer sync
- Match by email/phone.
- Store Shopify customer ID in customer document.

### Core Shopify webhooks to enable
- `products/create`, `products/update`, `products/delete`
- `inventory_levels/update`
- `orders/create`, `orders/updated`, `orders/paid`, `fulfillments/create`
- `customers/create`, `customers/update`

### API route pattern (Next.js)
- `app/api/shopify/webhooks/route.ts` for webhook receiver + HMAC verification.
- `app/api/shopify/sync/route.ts` for manual/full sync.
- `app/api/orders/create/route.ts` to initiate checkout from social posts.

### Data mapping example
- Shopify `product.id` -> Firestore `catalog/{productId}`
- Shopify `variant.id` -> nested variant record
- Shopify `order.id` -> `orders/{orderId}` linked to `conversationId` and `customerUid`

### Security checklist
- Verify webhook signature (HMAC) for every webhook request.
- Keep Shopify API secrets server-side only.
- Use idempotency keys for order creation to avoid duplicates.
- Log sync failures in `integrations/shopify/syncLogs`.

## 5) 30-60-90 day rollout plan

### First 30 days (foundation)
- Implement roles + membership model.
- Build customer and staff listing pages.
- Add basic conversation inbox with assignment.
- Launch posting system (text + image).

### 60 days (commerce + automation)
- Add Shopify catalog and order sync.
- Add shoppable posts and order CTA.
- Add bot triage + escalation to attendant/manager.

### 90 days (optimization)
- Add analytics dashboard (engagement -> orders -> retention).
- Add campaign templates and loyalty automations.
- Add SLA and performance reports per attendant/manager.

## 6) Minimum KPIs to track
- Response time (first human reply)
- Resolution time (conversation close)
- Conversation-to-order conversion rate
- Post engagement rate (views, comments, saves)
- Repeat purchase rate
- Average order value (AOV)
- Manager escalation rate

## 7) Suggested immediate next implementation tasks
1. Add `members` and `customers` subcollections under each restaurant.
2. Add a role claim strategy in Firebase Auth.
3. Build `/dashboard/people` with role tabs and filters.
4. Build `/dashboard/inbox` with assignment and status updates.
5. Create a Shopify webhook endpoint with HMAC verification.
6. Add post schema to support shoppable CTA links.
