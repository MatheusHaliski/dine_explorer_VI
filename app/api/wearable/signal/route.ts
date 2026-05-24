/**
 * BioDine™ Wearable Signal Ingestion API
 *
 * POST — Receives a batch of biometric signals from the wearable SDK.
 *        On each dish-window boundary, triggers full AI analysis.
 *        Between boundaries, uses the fast heuristic scorer for real-time updates.
 *
 * CPS role: "Sensor → Computation" bridge — this is where raw physical data
 * (heartbeats, skin electricity, motion) enters the digital intelligence layer.
 *
 * Expected call pattern: wearable SDK calls this every 30s with a signal batch.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import {
    analyzeBiometricWindow,
    computeHappinessFromSignals,
    mergeIntoFlavorProfile,
} from "@/app/lib/biodineAI";
import type {
    WearableSignal,
    WearableSessionRecord,
    DishResponseRecord,
    FlavorProfileRecord,
} from "@/app/lib/hubModels";

type SignalBatchPayload = {
    sessionId: string;
    restaurantId: string;
    signals: WearableSignal[];
    /** If true, the kitchen just changed the current dish — triggers full AI analysis */
    dishWindowClosed?: boolean;
    dishId?: string;
    dishName?: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as SignalBatchPayload;
        const { sessionId, restaurantId, signals, dishWindowClosed, dishId, dishName } = body;

        if (!sessionId || !restaurantId || !signals?.length) {
            return NextResponse.json(
                { error: "sessionId, restaurantId, and signals[] are required" },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const sessionRef = db
            .collection(COLLECTIONS.RESTAURANTS)
            .doc(restaurantId)
            .collection(SUB.WEARABLE_SESSIONS)
            .doc(sessionId);

        const sessionSnap = await sessionRef.get();
        if (!sessionSnap.exists) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const session = sessionSnap.data() as WearableSessionRecord;

        // Fast path — heuristic happiness update (low latency, no AI call)
        const quickScore = computeHappinessFromSignals(signals);

        // Smooth score: 70% existing + 30% new reading
        const smoothedScore = Math.round(session.happinessScore * 0.7 + quickScore * 0.3);
        await sessionRef.update({ happinessScore: smoothedScore });

        let dishResponse: DishResponseRecord | null = null;
        let staffAction: string | undefined;

        // Slow path — full AI analysis when a dish window closes
        if (dishWindowClosed && dishId && dishName) {
            const profileSnap = await db
                .collection(COLLECTIONS.FLAVOR_PROFILES)
                .doc(session.customerUid)
                .get();

            const existingProfile = profileSnap.exists
                ? (profileSnap.data() as FlavorProfileRecord)
                : null;

            const aiResult = await analyzeBiometricWindow({
                signals,
                dishId,
                dishName,
                customerUid: session.customerUid,
                restaurantId,
                sessionId,
                flavorProfile: existingProfile ?? undefined,
            });

            dishResponse = {
                sessionId,
                customerUid: session.customerUid,
                restaurantId,
                dishId,
                dishName,
                excitementScore: aiResult.excitementScore,
                comfortScore: aiResult.comfortScore,
                overallScore: aiResult.overallScore,
                signals,
                analysedAt: Date.now(),
            };

            const dishRef = await db
                .collection(COLLECTIONS.RESTAURANTS)
                .doc(restaurantId)
                .collection(SUB.DISH_RESPONSES)
                .add(dishResponse);

            dishResponse.id = dishRef.id;

            // Persist updated flavor profile
            const updatedProfile = mergeIntoFlavorProfile(
                existingProfile,
                dishResponse,
                aiResult.profileDelta
            );

            await db
                .collection(COLLECTIONS.FLAVOR_PROFILES)
                .doc(session.customerUid)
                .set(updatedProfile);

            staffAction = aiResult.staffAction;

            // Update session happiness with AI-computed score (more accurate)
            await sessionRef.update({
                happinessScore: aiResult.overallScore,
                currentDishId: dishId,
            });
        }

        return NextResponse.json(
            {
                happinessScore: smoothedScore,
                staffAction,
                dishResponseId: dishResponse?.id ?? null,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("[BioDine] signal POST error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
