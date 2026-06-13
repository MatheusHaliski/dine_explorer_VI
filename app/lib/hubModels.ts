import type { Timestamp } from "firebase-admin/firestore";

// Shared identity and access-control models.
export type StaffRole = "manager" | "attendant" | "worker";
export type GlobalRole = "platform_admin" | "restaurant_user" | "customer";

export type ConversationIntent =
    | "reservation"
    | "order_help"
    | "complaint"
    | "delivery"
    | "feedback"
    | "general";

export type ConversationStatus =
    | "new"
    | "assigned"
    | "pending"
    | "waiting_customer"
    | "resolved";

export type EventRecord = {
    id?: string;
    restaurantId: string;
    title: string;
    description?: string;
    startsAt: number;
    endsAt?: number;
    rsvpCount: number;
    reminderEnabled: boolean;
    createdAt: number;
    updatedAt: number;
};

export type MemberRecord = {
    uid: string;
    role: StaffRole;
    active: boolean;
    permissions: string[];
    displayName?: string;
    email?: string;
    joinedAt: number;
};

export type IssuePriority = "low" | "normal" | "high" | "urgent";
export type IssueStatus = "new" | "in_progress" | "resolved" | "closed";

export type IssueRecord = {
    id?: string;
    restaurantId: string;
    title: string;
    description?: string;
    conversationId?: string;
    status: IssueStatus;
    assignedToUid: string | null;
    priority: IssuePriority;
    dueAt: number;
    createdAt: number;
    updatedAt: number;
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

export type ChannelMessageAttachment = {
    url?: string;
    name?: string;
    type?: string;
    size?: number;
    [key: string]: unknown;
};

export type ChannelMessage = {
    id?: string;
    senderUid: string;
    senderRole: StaffRole;
    text: string;
    attachments: ChannelMessageAttachment[];
    createdAt: number;
};

export type StoryRecord = {
    id?: string;
    restaurantId: string;
    authorUid: string;
    mediaUrl: string;
    title?: string;
    createdAt: number;
    expiresAt: number;
};

export type UgcStatus = "pending" | "approved" | "rejected";

export type UgcRecord = {
    id?: string;
    restaurantId: string;
    customerUid: string;
    mediaUrl: string;
    caption?: string;
    menuItemIds: string[];
    status: UgcStatus;
    moderatedByUid?: string;
    createdAt: number;
    updatedAt: number;
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

// Legacy/simple wearable payload used by the dining-session endpoints.
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

export type WearableFlavorProfileRecord = {
    customerUid: string;
    restaurantId: string;
    preferredFlavors: string[];
    happinessHistory: Array<{
        dishName: string;
        score: number;
        recordedAt: number;
    }>;
    updatedAt: number;
};

export type DishAnalysisResponseRecord = {
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

// BioDine CPS wearable models.
export type WearableSignalType =
    | "heart_rate"
    | "gsr"
    | "motion_cadence"
    | "skin_temp"
    | "hrv";

export type WearableSignal = {
    type: WearableSignalType;
    value: number;
    unit: string;
    capturedAt: number;
};

export type WearableSessionRecord = {
    id?: string;
    customerUid: string;
    restaurantId: string;
    tableLabel: string;
    wearableDeviceId: string;
    status: "active" | "ended";
    startedAt: number;
    endedAt?: number;
    happinessScore: number;
    currentDishId?: string;
};

export type TablePulseRecord = {
    tableLabel: string;
    sessionId: string;
    happinessScore: number;
    trend: "rising" | "stable" | "falling";
    currentDishName: string | null;
    staffAction: string;
};

export type FlavorProfileTopDish = {
    dishId: string;
    dishName: string;
    restaurantId: string;
    score: number;
};

export type FlavorProfileAvoidItem = {
    dishId: string;
    dishName: string;
    reason: string;
};

export type FlavorProfileRecord = {
    customerUid: string;
    categoryAffinities: Record<string, number>;
    topDishes: FlavorProfileTopDish[];
    avoidList: FlavorProfileAvoidItem[];
    totalSessions: number;
    lastUpdatedAt: number;
};

export type DishResponseRecord = {
    id?: string;
    sessionId: string;
    customerUid: string;
    restaurantId: string;
    dishId: string;
    dishName: string;
    excitementScore: number;
    comfortScore: number;
    overallScore: number;
    signals: WearableSignal[];
    analysedAt: number;
};
