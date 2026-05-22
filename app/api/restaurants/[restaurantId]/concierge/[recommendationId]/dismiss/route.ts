import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import { withRetry } from "@/app/lib/firestoreRetry";
import type { ConciergeRecommendationRecord } from "@/app/lib/hubModels";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string; recommendationId: string }> }
): Promise<Response> {
    const session = readSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { restaurantId, recommendationId } = await params;

    const db = getAdminFirestore();
    const recRef = db
        .collection(COLLECTIONS.RESTAURANTS)
        .doc(restaurantId)
        .collection(SUB.CONCIERGE_RECOMMENDATIONS)
        .doc(recommendationId);

    const recSnap = await recRef.get();
    if (!recSnap.exists) {
        return NextResponse.json({ error: "Recommendation not found." }, { status: 404 });
    }

    const rec = recSnap.data() as ConciergeRecommendationRecord;
    if (rec.customerUid !== session.sub) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (rec.status !== "pending") {
        return NextResponse.json({ error: "Recommendation already resolved." }, { status: 409 });
    }

    await withRetry(() => recRef.update({ status: "dismissed" }));

    return NextResponse.json({ ok: true });
}
