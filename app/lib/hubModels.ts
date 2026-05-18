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
    linkedConversationCta?: "ask_attendant";
    createdAt: number;
    updatedAt: number;
};

export type StoryRecord = {
    id?: string;
    restaurantId: string;
    authorUid: string;
    mediaUrl: string;
    title?: string;
    expiresAt: number;
    createdAt: number;
};

export type UgcRecord = {
    id?: string;
    restaurantId: string;
    customerUid: string;
    mediaUrl: string;
    caption?: string;
    menuItemIds: string[];
    status: "pending" | "approved" | "rejected";
    moderatedByUid?: string;
    createdAt: number;
    updatedAt: number;
};

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
    csatRating?: number;
};

export type ChannelMessage = {
    senderUid: string;
    senderRole: "client" | "attendant" | "manager" | "worker" | "bot";
    text: string;
    attachments?: string[];
    createdAt: number;
};

export type IssueRecord = {
    id?: string;
    restaurantId: string;
    conversationId?: string;
    title: string;
    description?: string;
    status: "new" | "assigned" | "waiting_customer" | "resolved";
    assignedToUid: string | null;
    priority: "low" | "normal" | "high";
    dueAt: number;
    csatRating?: number;
};

export type ChannelMessage = {
    senderUid: string;
    senderRole: "client" | "attendant" | "manager" | "worker" | "bot";
    text: string;
    attachments?: string[];
    createdAt: number;
};

export type IssueRecord = {
    id?: string;
    restaurantId: string;
    conversationId?: string;
    title: string;
    description?: string;
    status: "new" | "assigned" | "waiting_customer" | "resolved";
    assignedToUid: string | null;
    priority: "low" | "normal" | "high";
    dueAt: number;
    createdAt: number;
    updatedAt: number;
};
