// [DB-TUNING] Centraliza nomes de coleções e subcoleções para evitar strings hardcoded.
export const COLLECTIONS = {
  RESTAURANTS: "restaurants",
  REVIEW: "review",
} as const;

export const SUB = {
  CONVERSATIONS: "conversations",
  CUSTOMERS: "customers",
  POSTS: "posts",
  MEMBERS: "members",
  ORDERS: "orders",
  CATALOG: "catalog",
  IDEMPOTENCY: "idempotency",
  REVIEWS: "reviews",
  MOOD_CHECKINS: "moodCheckins",
  CONCIERGE_RECOMMENDATIONS: "conciergeRecommendations",
} as const;
