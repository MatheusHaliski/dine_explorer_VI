import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { withRetry } from "@/app/lib/firestoreRetry";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";
import { COLLECTIONS, SUB } from "@/app/lib/collections";

// [DB-TUNING] Idempotência reforçada com status/TTL, retry e métricas.
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const payload = (await request.json()) as { restaurantId: string; customerUid: string; conversationId?: string; lineItems: Array<{ variantId: string; quantity: number }>; idempotencyKey?: string };
    if (!payload.restaurantId || !payload.customerUid || !payload.lineItems?.length) return NextResponse.json({ error: "restaurantId, customerUid and lineItems are required." }, { status: 400 });

    const db = getAdminFirestore();
    const idempotencyKey = payload.idempotencyKey ?? crypto.randomUUID();
    const idempotencyDoc = db.collection(COLLECTIONS.RESTAURANTS).doc(payload.restaurantId).collection(SUB.IDEMPOTENCY).doc(idempotencyKey);
    const existing = await withFirestoreQueryMetrics({ feature_name: "orders_idempotency_lookup", collection: SUB.IDEMPOTENCY, operation_type: "getDoc" }, async () => { const result = await idempotencyDoc.get(); return { result, docsReturned: result.exists ? 1 : 0 }; });
    if (existing.exists && existing.data()?.status === "committed") return NextResponse.json({ ok: true, duplicate: true, orderId: existing.data()?.orderId });

    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);
    await idempotencyDoc.set({ createdAt: now, expiresAt, status: "pending" }, { merge: true });

    const orderRef = await withRetry(() => db.collection(COLLECTIONS.RESTAURANTS).doc(payload.restaurantId).collection(SUB.ORDERS).add({ customerUid: payload.customerUid, conversationId: payload.conversationId ?? null, lineItems: payload.lineItems, source: "social_post", status: "pending_checkout", createdAt: now, shopify: { checkoutUrl: process.env.SHOPIFY_CHECKOUT_URL ?? null } }));

    await idempotencyDoc.set({ orderId: orderRef.id, createdAt: now, expiresAt, status: "committed" }, { merge: true });
    await db.collection(COLLECTIONS.RESTAURANTS).doc(payload.restaurantId).set({ ordersCount: FieldValue.increment(1) }, { merge: true });
    return NextResponse.json({ ok: true, orderId: orderRef.id, checkoutUrl: process.env.SHOPIFY_CHECKOUT_URL ?? null, idempotencyKey });
  } catch (error) {
    console.error("[Create Order] unable to create order", error);
    return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  }
}
