import { NextRequest, NextResponse } from "next/server";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { CustomerRecord } from "@/app/lib/hubModels";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";
import { safeLimit } from "@/app/lib/queryBudget";
import { withRetry } from "@/app/lib/firestoreRetry";
import { COLLECTIONS, SUB } from "@/app/lib/collections";

// [DB-TUNING] Paginação por cursor e métricas em consultas de customers.
export async function GET(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }): Promise<Response> {
  try {
    const { restaurantId } = await params;
    const loyaltyTier = request.nextUrl.searchParams.get("loyaltyTier");
    const cursor = request.nextUrl.searchParams.get("cursor")?.trim() || null;
    const pageSize = safeLimit(Number(request.nextUrl.searchParams.get("pageSize") ?? "20"));
    const db = getAdminFirestore();

    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).collection(SUB.CUSTOMERS);
    if (loyaltyTier) query = query.where("loyaltyTier", "==", loyaltyTier);
    query = query.orderBy("totalSpend", "desc");
    if (cursor) {
      const cursorDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).collection(SUB.CUSTOMERS).doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }
    query = query.limit(pageSize);

    const snapshot = await withFirestoreQueryMetrics({ feature_name: "customers_list", collection: SUB.CUSTOMERS, operation_type: "getDocs" }, async () => {
      const result = await query.get();
      return { result, docsReturned: result.size };
    });
    const customers = snapshot.docs.map((doc) => ({ uid: doc.id, ...(doc.data() as Omit<CustomerRecord, "uid">) }));
    const nextCursor = snapshot.docs.length === pageSize ? (snapshot.docs.at(-1)?.id ?? null) : null;
    const response = NextResponse.json({ customers, nextCursor });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("[Customers API] unable to load customers", error);
    return NextResponse.json({ error: "Unable to load customers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }): Promise<Response> {
  try {
    const { restaurantId } = await params;
    const payload = (await request.json()) as Partial<CustomerRecord> & { uid: string };
    if (!payload.uid) return NextResponse.json({ error: "uid is required." }, { status: 400 });
    const customer: CustomerRecord = { uid: payload.uid, displayName: payload.displayName, email: payload.email, phone: payload.phone, loyaltyTier: payload.loyaltyTier ?? "Bronze", totalOrders: payload.totalOrders ?? 0, totalSpend: payload.totalSpend ?? 0, tags: payload.tags ?? [], lastVisitAt: payload.lastVisitAt };
    await withRetry(() => getAdminFirestore().collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).collection(SUB.CUSTOMERS).doc(customer.uid).set(customer, { merge: true }));
    return NextResponse.json({ ok: true, customer });
  } catch (error) {
    console.error("[Customers API] unable to upsert customer", error);
    return NextResponse.json({ error: "Unable to save customer." }, { status: 500 });
  }
}
