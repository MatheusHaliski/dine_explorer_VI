import type { Timestamp } from "firebase-admin/firestore";

// [DB-TUNING] Aceita Timestamp para padronização de datas em novos documentos.
export type StaffRole = "manager" | "attendant" | "worker";
export type GlobalRole = "platform_admin" | "restaurant_user" | "customer";

export type ConversationIntent =
    | "reservation"
    | "order_help"
    | "complaint"
    | "delivery"
    | "feedback"
    | "general";

export type ConversationStatus = "new" | "assigned" | "pending" | "waiting_customer" | "resolved";

export type MemberRecord = {
    uid: string;
    role: StaffRole;
    active: boolean;
    permissions: string[];
    displayName?: string;
    email?: string;
    joinedAt: number;
};

export type CustomerRecord = {
    uid: string;
    displayName?: string;
    email?: string;
    phone?: string;
    loyaltyTier?: "Bronze" | "Silver" | "Gold";
    totalOrders: number;
    totalSpend: number;
    tags: string[];
    lastVisitAt?: number;
    shopifyCustomerId?: string;
};

export type SocialPostRecord = {
    id?: string;
    restaurantId: string;
    authorUid: string;
    type: "text" | "image" | "video" | "poll";
    category: "promo" | "event" | "announcement" | "ugc-feature";
    body: string;
    mediaUrl?: string;
    pollOptions?: string[];
    shoppableCta?: {
        label: string;
        productIds: string[];
        href?: string;
    };
    createdAt: number | Timestamp;
    updatedAt: number | Timestamp;
};

export type ConversationRecord = {
    id?: string;
    restaurantId: string;
    clientUid: string;
    intent: ConversationIntent;
    status: ConversationStatus;
    priority: "low" | "normal" | "high";
    assignedToUid: string | null;
    channel: "in_app" | "instagram" | "whatsapp" | "facebook";
    lastMessage: string;
    createdAt: number | Timestamp;
    updatedAt: number | Timestamp;
    dueAt: number;
};

export type ConciergeOccasion =
    | "date"
    | "family"
    | "business"
    | "solo"
    | "friends";

export type ConciergeMood =
    | "relaxed"
    | "celebratory"
    | "romantic"
    | "social"
    | "comfort";

export type MoodCheckinRecord = {
    id?: string;
    customerUid: string;
    mood: ConciergeMood;
    occasion: ConciergeOccasion;
    partySize: number;
    createdAt: number;
};

export type ConciergeRecommendedItem = {
    productId: string;
    name: string;
    photo?: string;
    reason: string;
};

export type ConciergeRecommendationRecord = {
    id?: string;
    customerUid: string;
    checkinId: string;
    recommendedItems: ConciergeRecommendedItem[];
    matchScore: number;
    postDraft: {
        body: string;
        shoppableCta: {
            label: string;
            productIds: string[];
        };
    };
    status: "pending" | "accepted" | "dismissed";
    createdAt: number;
    acceptedAt?: number;
};

export type WearableSignals = {
    heartRate?: number;
    stressLevel?: number;
    skinConductance?: number;
    timestamp: number;
};

export type DiningSessionRecord = {
    id?: string;
    customerUid: string;
    restaurantId: string;
    tableNumber?: string;
    startedAt: number;
    status: "active" | "closed";
    currentHappinessScore?: number;
    currentDishName?: string;
    updatedAt: number;
};

export type FlavorProfileRecord = {
    customerUid: string;
    restaurantId: string;
    preferredFlavors: string[];
    happinessHistory: { dishName: string; score: number; recordedAt: number }[];
    updatedAt: number;
};

export type DishResponseRecord = {
    id?: string;
    sessionId: string;
    customerUid: string;
    dishName: string;
    happinessScore: number;
    smoothedScore: number;
    aiScore?: number;
    dishWindowClosed: boolean;
    recordedAt: number;
};
