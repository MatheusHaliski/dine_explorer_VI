import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession, verifySessionToken } from "@/app/lib/serverSession";
import { withRetry } from "@/app/lib/firestoreRetry";
import type { DiningSessionRecord, FlavorProfileRecord, WearableSignals } from "@/app/lib/hubModels";

// Wearable companion apps may not have browser cookies, so accept the same
// HMAC-signed token via Authorization: Bearer as a fallback.
function resolveAuth(request: NextRequest) {
    const fromCookie = readSession(request);
    if (fromCookie) return fromCookie;

    const authHeader = request.headers.get("Authorization") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!bearer) return null;
    return verifySessionToken(bearer);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string }> }
): Promise<Response> {
    const auth = resolveAuth(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { restaurantId } = await params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const { sessionId, signals } = body as Record<string, unknown>;

    if (!sessionId || typeof sessionId !== "string") {
        return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }
    if (!signals || typeof signals !== "object" || Array.isArray(signals)) {
        return NextResponse.json({ error: "signals must be an object." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);
    const sessionRef = restaurantRef.collection(SUB.DINING_SESSIONS).doc(sessionId);

    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const diningSession = sessionDoc.data() as DiningSessionRecord;

    // Authorization: the authenticated caller must own this dining session.
    // Without this check, any authenticated user could forge biometric data
    // for another diner's session by guessing or replaying a sessionId.
    if (diningSession.customerUid !== auth.sub) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (diningSession.status === "closed") {
        return NextResponse.json({ error: "Session is already closed." }, { status: 409 });
    }

    const incoming = signals as Partial<WearableSignals>;
    const validatedSignals: WearableSignals = {
        timestamp: typeof incoming.timestamp === "number" ? incoming.timestamp : Date.now(),
        ...(typeof incoming.heartRate === "number" && { heartRate: incoming.heartRate }),
        ...(typeof incoming.stressLevel === "number" && { stressLevel: incoming.stressLevel }),
        ...(typeof incoming.skinConductance === "number" && { skinConductance: incoming.skinConductance }),
    };

    const now = Date.now();

    await withRetry(async () => {
        // Append signal to the session document and refresh updatedAt
        await sessionRef.update({
            updatedAt: now,
            recentSignal: validatedSignals,
        });

        // Upsert the customer's flavor profile, appending to happiness history
        // when a current dish name is known on the session.
        const profileRef = restaurantRef
            .collection(SUB.FLAVOR_PROFILES)
            .doc(auth.sub);

        const profileDoc = await profileRef.get();
        const existing = profileDoc.exists
            ? (profileDoc.data() as FlavorProfileRecord)
            : null;

        const historyEntry =
            diningSession.currentDishName && diningSession.currentHappinessScore != null
                ? [
                      {
                          dishName: diningSession.currentDishName,
                          score: diningSession.currentHappinessScore,
                          recordedAt: now,
                      },
                  ]
                : [];

        const updatedProfile: FlavorProfileRecord = {
            customerUid: auth.sub,
            restaurantId,
            preferredFlavors: existing?.preferredFlavors ?? [],
            happinessHistory: [...(existing?.happinessHistory ?? []), ...historyEntry].slice(-50),
            updatedAt: now,
        };

        await profileRef.set(updatedProfile, { merge: true });
    });

    return NextResponse.json({ ok: true });
}
