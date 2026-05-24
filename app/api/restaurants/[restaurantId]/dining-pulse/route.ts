/**
 * BioDine™ Dining Pulse API
 *
 * GET — Returns the real-time biometric snapshot of all active tables,
 *       plus AI-generated ambient recommendations (lighting + music).
 *
 * CPS role: "Computation → Actuators" — this endpoint feeds the dashboard
 * (staff tablet), ambient light controller, and music system with the
 * AI-computed state of the physical dining room.
 *
 * Polled by the Dining Pulse dashboard every 15s.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { generateDiningPulse } from "@/app/lib/biodineAI";
import type { WearableSessionRecord, DishResponseRecord } from "@/app/lib/hubModels";

type RouteParams = { params: Promise<{ restaurantId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { restaurantId } = await params;
        const db = getAdminFirestore();
        const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);

        const [sessionsSnap, dishResponsesSnap] = await Promise.all([
            restaurantRef
                .collection(SUB.WEARABLE_SESSIONS)
                .where("status", "==", "active")
                .orderBy("startedAt", "desc")
                .limit(50)
                .get(),
            restaurantRef
                .collection(SUB.DISH_RESPONSES)
                .orderBy("analysedAt", "desc")
                .limit(100)
                .get(),
        ]);

        const sessions = sessionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as WearableSessionRecord),
        }));

        const dishResponses = dishResponsesSnap.docs.map((doc) =>
            doc.data() as DishResponseRecord
        );

        if (sessions.length === 0) {
            return NextResponse.json(
                {
                    tablePulses: [],
                    roomMoodScore: 0,
                    ambientRecommendation: {
                        lightingTone: "neutral",
                        musicEnergy: "medium",
                        rationale: "No active sessions",
                    },
                },
                { status: 200 }
            );
        }

        const pulse = await generateDiningPulse({ sessions, recentDishResponses: dishResponses, restaurantId });

        return NextResponse.json(pulse, { status: 200 });
    } catch (err) {
        console.error("[BioDine] dining-pulse GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
