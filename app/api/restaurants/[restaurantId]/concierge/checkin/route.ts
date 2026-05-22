import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import { withRetry } from "@/app/lib/firestoreRetry";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";
import { generateConciergeRecommendation } from "@/app/lib/conciergeAI";
import type {
    MoodCheckinRecord,
    ConciergeRecommendationRecord,
    ConciergeMood,
    ConciergeOccasion,
} from "@/app/lib/hubModels";

const VALID_MOODS: ConciergeMood[] = ["relaxed", "celebratory", "romantic", "social", "comfort"];
const VALID_OCCASIONS: ConciergeOccasion[] = ["date", "family", "business", "solo", "friends"];

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string }> }
): Promise<Response> {
    const session = readSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { restaurantId } = await params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const { mood, occasion, partySize } = body as Record<string, unknown>;

    if (!VALID_MOODS.includes(mood as ConciergeMood)) {
        return NextResponse.json({ error: `mood must be one of: ${VALID_MOODS.join(", ")}` }, { status: 400 });
    }
    if (!VALID_OCCASIONS.includes(occasion as ConciergeOccasion)) {
        return NextResponse.json({ error: `occasion must be one of: ${VALID_OCCASIONS.join(", ")}` }, { status: 400 });
    }
    const parsedPartySize = Number(partySize);
    if (!Number.isInteger(parsedPartySize) || parsedPartySize < 1 || parsedPartySize > 20) {
        return NextResponse.json({ error: "partySize must be an integer between 1 and 20." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);

    // Fetch customer order history (last 10 orders)
    const orderHistory = await withFirestoreQueryMetrics(
        { feature_name: "concierge_order_history", collection: SUB.ORDERS, operation_type: "getDocs" },
        async () => {
            const snap = await restaurantRef
                .collection(SUB.ORDERS)
                .where("customerUid", "==", session.sub)
                .orderBy("createdAt", "desc")
                .limit(10)
                .get();
            const items = snap.docs.flatMap((doc) => {
                const data = doc.data();
                return (data.lineItems ?? []) as { name: string; quantity: number }[];
            });
            return { result: items, docsReturned: snap.size };
        }
    );

    // Fetch restaurant catalog (top 20 items)
    const catalog = await withFirestoreQueryMetrics(
        { feature_name: "concierge_catalog", collection: SUB.CATALOG, operation_type: "getDocs" },
        async () => {
            const snap = await restaurantRef.collection(SUB.CATALOG).limit(20).get();
            const items = snap.docs.map((doc) => {
                const d = doc.data();
                return {
                    productId: doc.id,
                    name: String(d.name ?? ""),
                    photo: d.photo ?? d.photoUrl ?? undefined,
                    description: d.description ?? undefined,
                    price: d.price ?? undefined,
                    category: d.category ?? undefined,
                };
            });
            return { result: items, docsReturned: snap.size };
        }
    );

    // Call Claude to generate recommendation
    let aiOutput;
    try {
        aiOutput = await generateConciergeRecommendation({
            mood: mood as ConciergeMood,
            occasion: occasion as ConciergeOccasion,
            partySize: parsedPartySize,
            catalog,
            orderHistory,
        });
    } catch (err) {
        console.error("[Concierge] AI generation failed:", err);
        return NextResponse.json({ error: "Unable to generate recommendation." }, { status: 502 });
    }

    const now = Date.now();

    // Persist checkin + recommendation atomically
    const { checkinId, recommendationId } = await withRetry(async () => {
        const checkin: MoodCheckinRecord = {
            customerUid: session.sub,
            mood: mood as ConciergeMood,
            occasion: occasion as ConciergeOccasion,
            partySize: parsedPartySize,
            createdAt: now,
        };
        const checkinRef = await restaurantRef
            .collection(SUB.CUSTOMERS)
            .doc(session.sub)
            .collection(SUB.MOOD_CHECKINS)
            .add(checkin);

        const recommendation: ConciergeRecommendationRecord = {
            customerUid: session.sub,
            checkinId: checkinRef.id,
            recommendedItems: aiOutput.recommendedItems,
            matchScore: aiOutput.matchScore,
            postDraft: aiOutput.postDraft,
            status: "pending",
            createdAt: now,
        };
        const recRef = await restaurantRef
            .collection(SUB.CONCIERGE_RECOMMENDATIONS)
            .add(recommendation);

        // Increment restaurant-level counter
        await restaurantRef.update({
            conciergeCheckinsCount: FieldValue.increment(1),
        });

        return { checkinId: checkinRef.id, recommendationId: recRef.id };
    });

    return NextResponse.json({
        ok: true,
        checkinId,
        recommendationId,
        recommendation: {
            ...aiOutput,
            id: recommendationId,
            status: "pending",
            createdAt: now,
        },
    });
}
