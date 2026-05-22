import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";
import type { ConciergeRecommendationRecord } from "@/app/lib/hubModels";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string }> }
): Promise<Response> {
    const session = readSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { restaurantId } = await params;

    const recommendations = await withFirestoreQueryMetrics(
        { feature_name: "concierge_history", collection: SUB.CONCIERGE_RECOMMENDATIONS, operation_type: "getDocs" },
        async () => {
            const snap = await getAdminFirestore()
                .collection(COLLECTIONS.RESTAURANTS)
                .doc(restaurantId)
                .collection(SUB.CONCIERGE_RECOMMENDATIONS)
                .where("customerUid", "==", session.sub)
                .orderBy("createdAt", "desc")
                .limit(20)
                .get();

            const items = snap.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<ConciergeRecommendationRecord, "id">),
            }));
            return { result: items, docsReturned: snap.size };
        }
    );

    return NextResponse.json({ ok: true, recommendations });
}
