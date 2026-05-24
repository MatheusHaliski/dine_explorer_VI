/**
 * BioDine™ Wearable Session API
 *
 * POST — Diner checks in via NFC/BLE at table → starts a wearable session
 * GET  — Returns active session for a customer
 *
 * CPS role: "Actuator trigger" — the NFC tap at the table is the physical event
 * that opens the digital session, linking the diner's wearable to the restaurant's
 * data layer and starting the biometric feedback loop.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import type { WearableSessionRecord } from "@/app/lib/hubModels";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerUid, restaurantId, tableLabel, wearableDeviceId } = body as {
            customerUid?: string;
            restaurantId?: string;
            tableLabel?: string;
            wearableDeviceId?: string;
        };

        if (!customerUid || !restaurantId || !tableLabel || !wearableDeviceId) {
            return NextResponse.json(
                { error: "customerUid, restaurantId, tableLabel, wearableDeviceId are required" },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const sessionsRef = db
            .collection(COLLECTIONS.RESTAURANTS)
            .doc(restaurantId)
            .collection(SUB.WEARABLE_SESSIONS);

        // Close any prior active session for this customer at this restaurant
        const existingSnap = await sessionsRef
            .where("customerUid", "==", customerUid)
            .where("status", "==", "active")
            .limit(1)
            .get();

        if (!existingSnap.empty) {
            await existingSnap.docs[0].ref.update({ status: "ended", endedAt: Date.now() });
        }

        const session: WearableSessionRecord = {
            customerUid,
            restaurantId,
            tableLabel,
            wearableDeviceId,
            status: "active",
            startedAt: Date.now(),
            happinessScore: 50, // neutral baseline
        };

        const docRef = await sessionsRef.add(session);

        return NextResponse.json({ sessionId: docRef.id, session }, { status: 201 });
    } catch (err) {
        console.error("[BioDine] session POST error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customerUid = searchParams.get("customerUid");
        const restaurantId = searchParams.get("restaurantId");

        if (!customerUid || !restaurantId) {
            return NextResponse.json(
                { error: "customerUid and restaurantId are required" },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const snap = await db
            .collection(COLLECTIONS.RESTAURANTS)
            .doc(restaurantId)
            .collection(SUB.WEARABLE_SESSIONS)
            .where("customerUid", "==", customerUid)
            .where("status", "==", "active")
            .limit(1)
            .get();

        if (snap.empty) {
            return NextResponse.json({ session: null }, { status: 200 });
        }

        const doc = snap.docs[0];
        return NextResponse.json({ sessionId: doc.id, session: doc.data() }, { status: 200 });
    } catch (err) {
        console.error("[BioDine] session GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
