# API Endpoint Backend Web Services Architecture

This document explains how backend web services are organized in this project and how a request flows through the stack from **browser → controller → service → repository → database**.

---

## 1) High-level multilayer architecture

Even though this codebase does not always create separate `controller/`, `service/`, and `repository/` folders, the responsibilities are present and can be mapped to layers:

1. **Browser / UI layer**
   - React client components call internal APIs using `fetch("/api/..." )`.
   - Examples include authentication, signup, PIN verification, restaurant catalog and review submission flows.

2. **Controller layer (API Routes)**
   - Implemented with Next.js Route Handlers in `app/api/**/route.ts`.
   - These handlers parse request input, validate payloads, enforce auth/rate limits, map errors to HTTP statuses, and return `NextResponse.json(...)`.

3. **Service layer (business logic utilities)**
   - Business/security operations are implemented as reusable functions in route files and shared libs, such as password hashing/verification, session token creation/verification, PIN token signing, and rate limiting.
   - Shared server utilities are mainly in `app/lib/**`.

4. **Repository / data-access layer**
   - Firestore read/write operations (`collection`, `where`, `limit`, `add`, `update`, `getAll`) form the repository behavior.
   - Access is centralized through `getAdminFirestore()` so route handlers always obtain a configured admin Firestore client.

5. **Database / external services layer**
   - **Primary database:** Firebase Firestore collections such as `restaurants`, `review`, `VSusercontrol`, and `VSpasswordresets`.
   - **External integration:** Resend email API is used for password reset emails.

---

## 2) API endpoints in this project

### Authentication & account APIs

- `POST /api/auth/verify`
  - Verifies email/password credentials.
  - Applies IP and email-based rate limiting.
  - Reads user account in Firestore (`VSusercontrol`) and validates PBKDF2 password hashes.

- `GET /api/auth/session`
  - Reads an existing signed session cookie and refreshes it.

- `DELETE /api/auth/session`
  - Clears session cookie.

- `POST /api/signup`
  - Validates signup payload.
  - Checks duplicates in `VSusercontrol` by email and name.
  - Hashes password and creates a user document.

- `POST /api/auth/reset`
  - Validates email.
  - Confirms user exists in `VSusercontrol`.
  - Creates reset token in `VSpasswordresets`.
  - Sends password-reset email through Resend.

- `POST /api/authview`
  - Alternate credential-check endpoint for email/password authentication.

### PIN gate API

- `POST /api/pin`
  - Verifies Firebase ID token, restricts allowed Google account, checks PIN with bcrypt, enforces rate limit, and sets signed cookie.

- `GET /api/pin`
  - Verifies signed PIN cookie token.

- `DELETE /api/pin`
  - Clears PIN cookie.

### Restaurant APIs

- `GET /api/restaurants`
  - Returns paginated restaurant documents (`limit`, `cursor`).

- `GET /api/restaurants/catalog`
  - Returns reduced catalog fields for listing cards.

- `POST /api/restaurants/byIds`
  - Accepts list of IDs and returns matching restaurant details.

- `POST /api/restaurants/[id]/reviews`
  - Validates review payload, writes review, recalculates average rating, and updates restaurant aggregate rating.

---

## 3) End-to-end processing flow (browser → DB)

## A. Restaurant catalog read flow

1. Browser page calls `fetch("/api/restaurants/catalog")`.
2. Route handler acts as controller:
   - creates Firestore admin client,
   - selects safe/needed fields,
   - handles errors and returns JSON.
3. Repository behavior executes Firestore query on `restaurants`.
4. Response is returned to the browser as a JSON catalog list.

## B. Review submission flow

1. Browser sends `POST /api/restaurants/{id}/reviews` with text/rating/user metadata.
2. Controller validates `id`, commentary text, and rating range.
3. Service logic normalizes rating and builds review payload.
4. Repository operations:
   - insert document in `review`,
   - query all reviews for restaurant,
   - compute new average,
   - update aggregate `rating`/`starsgiven` in `restaurants`.
5. Controller returns created review and updated rating.

## C. Sign-in verification flow

1. Browser sends email/password to `POST /api/auth/verify`.
2. Controller resolves client IP and checks rate-limit buckets.
3. Service logic hashes candidate password with stored salt/iterations and compares digest.
4. Repository query reads matching account from `VSusercontrol`.
5. Controller returns `ok: true` or 4xx/5xx error JSON.

## D. Password reset flow

1. Browser sends email to `POST /api/auth/reset`.
2. Controller validates email and checks account existence.
3. Service logic generates reset token/expiry.
4. Repository write stores reset token in `VSpasswordresets`.
5. Integration service calls Resend email API with reset link.
6. Controller returns completion response.

---

## 4) Practical mapping of code to layers

- **Browser/UI callers**
  - `app/authview/AuthViewClient.tsx`
  - `app/signupview/SignupForm.tsx`
  - `app/restaurantcardspage/RestaurantCardsInner.tsx`
  - `app/restaurantinfopage/[id]/RestaurantInfoFront.tsx`
  - `app/forgetpasswordview/page.tsx`

- **Controllers (route handlers)**
  - `app/api/**/route.ts`

- **Shared service/security modules**
  - `app/lib/serverSession.ts`
  - `app/lib/security/basicRateLimit.ts`
  - `app/lib/firebaseAdmin.ts`

- **Repository/data access (inside handlers/libs)**
  - Firestore queries and writes via `getAdminFirestore()` in route handlers.

---

## 5) Architecture characteristics

- **Strengths**
  - Clear HTTP boundary using Next.js route handlers.
  - Good use of server-side Firestore admin client for protected operations.
  - Security controls present (PBKDF2 hashing, timing-safe compares, rate limiting, signed cookies).
  - Aggregation updates (reviews → restaurant rating) handled server-side.

- **Current trade-off**
  - Service and repository logic are mostly co-located in route files instead of separate modules. This is acceptable for small/medium systems but can grow harder to maintain as the API surface increases.

- **Recommended evolution (optional)**
  - Extract each domain into explicit modules, for example:
    - `app/server/controllers/*`
    - `app/server/services/*`
    - `app/server/repositories/*`
  - Keep route files thin (request/response only), place business/data logic in services/repositories for better testability and reuse.

---

## 6) Summary

The project follows a practical multi-layer architecture where:

- **Browser** pages call internal `/api` endpoints.
- **Controllers** (route handlers) validate/authenticate/shape HTTP responses.
- **Service logic** handles security and business rules.
- **Repository logic** executes Firestore queries/writes.
- **Database/integrations** persist data and send emails.

So the full request lifecycle is effectively:

`Client (browser) → Next.js API route controller → service/security logic → Firestore repository operations → Firestore/Resend`.
