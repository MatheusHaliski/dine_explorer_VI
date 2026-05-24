import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";
import type { DishResponseRecord } from "@/app/lib/hubModels";

const RECENT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string }> }
): Promise<Response> {
    const session = readSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { restaurantId } = await params;

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);
    const since = Date.now() - RECENT_WINDOW_MS;

    const recentDishResponses = await withFirestoreQueryMetrics(
        { feature_name: "dining_pulse_responses", collection: SUB.DISH_RESPONSES, operation_type: "getDocs" },
        async () => {
            // Fetch newest-first so the first entry per session in the loop is the latest.
            const snap = await restaurantRef
                .collection(SUB.DISH_RESPONSES)
                .where("recordedAt", ">=", since)
                .orderBy("recordedAt", "desc")
                .limit(200)
                .get();

            const items = snap.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<DishResponseRecord, "id">),
            }));
            return { result: items, docsReturned: snap.size };
        }
    );

    // Build a per-session pulse map. Responses arrive in descending recordedAt
    // order, so the first entry encountered for each sessionId is the most recent.
    // Skipping subsequent entries prevents the map from being overwritten with
    // stale (older) data, which would cause downstream AI orchestration to operate
    // on the wrong dish context.
    const pulseMap = new Map<string, DishResponseRecord>();
    for (const response of recentDishResponses) {
        if (!pulseMap.has(response.sessionId)) {
            pulseMap.set(response.sessionId, response);
        }
    }

    const pulse = Array.from(pulseMap.values()).map((r) => ({
        sessionId: r.sessionId,
        currentDishName: r.dishName,
        currentHappinessScore: r.aiScore ?? r.smoothedScore,
        dishWindowClosed: r.dishWindowClosed,
        recordedAt: r.recordedAt,
    }));

    return NextResponse.json({ pulse, sessionCount: pulse.length });
}
