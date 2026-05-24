import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import { withRetry } from "@/app/lib/firestoreRetry";
import { analyzeDishResponse } from "@/app/lib/dishAnalysisAI";
import type { DishResponseRecord, DiningSessionRecord, WearableSignals } from "@/app/lib/hubModels";

const DISH_WINDOW_SIZE = 5;
// EMA smoothing factor (higher = more weight on new samples)
const ALPHA = 0.3;

function computeSmoothedScore(samples: number[], prevSmoothed?: number): number {
    let smoothed = prevSmoothed ?? samples[0] ?? 50;
    for (const s of samples) {
        smoothed = ALPHA * s + (1 - ALPHA) * smoothed;
    }
    return Math.round(smoothed);
}

function signalsToScore(signals: WearableSignals): number {
    // Map biometric signals to a 0-100 happiness proxy.
    // Low stress + calm heart rate → high score; high stress → low score.
    const stressFactor = typeof signals.stressLevel === "number" ? signals.stressLevel : 50;
    return Math.max(0, Math.min(100, Math.round(100 - stressFactor)));
}

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

    const { sessionId, dishName, signals } = body as Record<string, unknown>;

    if (!sessionId || typeof sessionId !== "string") {
        return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }
    if (!dishName || typeof dishName !== "string") {
        return NextResponse.json({ error: "dishName is required." }, { status: 400 });
    }
    if (!Array.isArray(signals) || signals.length === 0) {
        return NextResponse.json({ error: "signals must be a non-empty array." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);
    const sessionRef = restaurantRef.collection(SUB.DINING_SESSIONS).doc(sessionId);

    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const diningSession = sessionDoc.data() as DiningSessionRecord;
    if (diningSession.customerUid !== session.sub) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const rawScores = (signals as WearableSignals[]).map(signalsToScore);
    const smoothedScore = computeSmoothedScore(rawScores, diningSession.currentHappinessScore);

    const dishWindowClosed = signals.length >= DISH_WINDOW_SIZE;
    const now = Date.now();

    let finalScore = smoothedScore;

    if (dishWindowClosed) {
        let aiResult;
        try {
            aiResult = await analyzeDishResponse({
                dishName,
                signals: signals as WearableSignals[],
            });
        } catch (err) {
            console.error("[DishAnalysis] AI analysis failed:", err);
            return NextResponse.json({ error: "Unable to complete dish analysis." }, { status: 502 });
        }

        // Persist the AI score and update the response record atomically.
        // The response must use aiResult.overallScore, not smoothedScore, so
        // callers never observe inconsistency between what is stored and what
        // is returned immediately after a full analysis cycle.
        finalScore = aiResult.overallScore;

        await withRetry(async () => {
            const dishResponseRef = restaurantRef.collection(SUB.DISH_RESPONSES).doc();
            const record: DishResponseRecord = {
                sessionId,
                customerUid: session.sub,
                dishName,
                happinessScore: rawScores[rawScores.length - 1] ?? smoothedScore,
                smoothedScore,
                aiScore: aiResult.overallScore,
                dishWindowClosed: true,
                recordedAt: now,
            };
            await dishResponseRef.set(record);

            await sessionRef.update({
                currentDishName: dishName,
                currentHappinessScore: aiResult.overallScore,
                updatedAt: now,
            });
        });

        return NextResponse.json({
            ok: true,
            happinessScore: finalScore,
            smoothedScore,
            aiScore: aiResult.overallScore,
            sentiment: aiResult.sentiment,
            summary: aiResult.summary,
            dishWindowClosed: true,
        });
    }

    await withRetry(async () => {
        const dishResponseRef = restaurantRef.collection(SUB.DISH_RESPONSES).doc();
        const record: DishResponseRecord = {
            sessionId,
            customerUid: session.sub,
            dishName,
            happinessScore: rawScores[rawScores.length - 1] ?? smoothedScore,
            smoothedScore,
            dishWindowClosed: false,
            recordedAt: now,
        };
        await dishResponseRef.set(record);

        await sessionRef.update({
            currentDishName: dishName,
            currentHappinessScore: smoothedScore,
            updatedAt: now,
        });
    });

    return NextResponse.json({
        ok: true,
        happinessScore: finalScore,
        smoothedScore,
        dishWindowClosed: false,
    });
}
