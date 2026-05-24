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

// ─── BioDine™ — Cyber-Physical Wearable Layer ────────────────────────────────

export type WearableSignalType =
    | "heart_rate"        // BPM — spike = excitement, drop = boredom
    | "gsr"               // galvanic skin response — emotional arousal
    | "motion_cadence"    // chew/eating pace — fast = loving it
    | "skin_temp"         // peripheral temp correlates with comfort
    | "hrv";              // heart rate variability — stress indicator

export type WearableSignal = {
    type: WearableSignalType;
    value: number;
    unit: string;
    capturedAt: number;
};

/** A diner's full biometric session at one table visit */
export type WearableSessionRecord = {
    id?: string;
    customerUid: string;
    restaurantId: string;
    tableLabel: string;         // e.g. "Mesa 12"
    wearableDeviceId: string;   // BLE MAC or ring serial
    status: "active" | "ended";
    startedAt: number;
    endedAt?: number;
    /** Running average happiness score 0–100 computed by BioDine AI */
    happinessScore: number;
    /** productId of the dish currently being served (updated by kitchen) */
    currentDishId?: string;
};

/** AI-inferred emotional response mapped to a specific dish */
export type DishResponseRecord = {
    id?: string;
    sessionId: string;
    customerUid: string;
    restaurantId: string;
    dishId: string;
    dishName: string;
    /** 0–100: how strongly the diner's biometrics reacted positively */
    excitementScore: number;
    /** 0–100: how much comfort/relaxation the diner showed */
    comfortScore: number;
    /** composite score used for flavor profile learning */
    overallScore: number;
    signals: WearableSignal[];   // raw signals during this dish window
    analysedAt: number;
};

/** Accumulated biological taste profile — evolves across all restaurant visits */
export type FlavorProfileRecord = {
    id?: string;
    customerUid: string;
    /** Cuisine/category affinities, e.g. { "umami": 87, "spicy": 42, "sweet": 71 } */
    categoryAffinities: Record<string, number>;
    /** Top dishes by composite biometric score across all restaurants */
    topDishes: Array<{ dishId: string; dishName: string; restaurantId: string; score: number }>;
    /** Dishes that triggered discomfort (GSR spike + HR drop) */
    avoidList: Array<{ dishId: string; dishName: string; reason: string }>;
    totalSessions: number;
    lastUpdatedAt: number;
};

/** Real-time per-table snapshot used by the Dining Pulse dashboard */
export type TablePulseRecord = {
    tableLabel: string;
    sessionId: string;
    customerDisplayName?: string;
    happinessScore: number;   // 0–100
    trend: "rising" | "stable" | "falling";
    currentDishName?: string;
    /** AI-generated staff action prompt */
    staffAction?: string;
    lastSignalAt: number;
};
