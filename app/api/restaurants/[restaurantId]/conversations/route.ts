import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { ConversationRecord } from "@/app/lib/hubModels";
import { getSlaDueAt, inferIntent } from "@/app/lib/triage";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";
import { safeLimit } from "@/app/lib/queryBudget";
import { withRetry } from "@/app/lib/firestoreRetry";
import { COLLECTIONS, SUB } from "@/app/lib/collections";

// [DB-TUNING] Paginação real por cursor, métricas, retry e contadores derivados.
export async function GET(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }): Promise<Response> {
  try {
    const { restaurantId } = await params;
    const status = request.nextUrl.searchParams.get("status");
    const cursor = request.nextUrl.searchParams.get("cursor")?.trim() || null;
    const pageSize = safeLimit(Number(request.nextUrl.searchParams.get("pageSize") ?? "20"));
    const db = getAdminFirestore();
    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).collection(SUB.CONVERSATIONS).select("status", "priority", "lastMessage", "updatedAt", "clientUid", "channel");
    if (status) query = query.where("status", "==", status);
    query = query.orderBy("updatedAt", "desc");
    if (cursor) {
      const cursorDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).collection(SUB.CONVERSATIONS).doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }
    query = query.limit(pageSize);

    const snapshot = await withFirestoreQueryMetrics({ feature_name: "conversations_list", collection: SUB.CONVERSATIONS, operation_type: "getDocs" }, async () => {
      const result = await query.get();
      return { result, docsReturned: result.size };
    });
    const conversations = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ConversationRecord, "id">) }));
    const nextCursor = snapshot.docs.length === pageSize ? (snapshot.docs.at(-1)?.id ?? null) : null;
    const response = NextResponse.json({ conversations, nextCursor });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("[Conversations API] unable to load", error);
    return NextResponse.json({ error: "Unable to load conversations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }): Promise<Response> {
  try {
    const { restaurantId } = await params;
    const payload = (await request.json()) as { clientUid: string; message: string; channel?: ConversationRecord["channel"]; priority?: ConversationRecord["priority"] };
    if (!payload.clientUid || !payload.message) return NextResponse.json({ error: "clientUid and message are required." }, { status: 400 });
    const now = Timestamp.now();
    const nowMs = now.toMillis();
    const intent = inferIntent(payload.message);
    const conversation: Omit<ConversationRecord, "id"> = { restaurantId, clientUid: payload.clientUid, intent, status: "new", priority: payload.priority ?? "normal", assignedToUid: null, channel: payload.channel ?? "in_app", lastMessage: payload.message, createdAt: now, updatedAt: now, dueAt: getSlaDueAt(intent, nowMs) };

    const docRef = await withRetry(() => getAdminFirestore().collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).collection(SUB.CONVERSATIONS).add(conversation));
    await getAdminFirestore().collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).set({ conversationsCount: FieldValue.increment(1), lastActivityAt: nowMs }, { merge: true });
    return NextResponse.json({ ok: true, id: docRef.id, conversation });
  } catch (error) {
    console.error("[Conversations API] unable to create", error);
    return NextResponse.json({ error: "Unable to create conversation." }, { status: 500 });
  }
}
