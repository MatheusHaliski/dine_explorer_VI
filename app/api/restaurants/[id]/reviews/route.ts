import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { parseRatingValue } from "@/app/gate/restaurantpagegate";
import { COLLECTIONS, SUB } from "@/app/lib/collections";

export const runtime = "nodejs";

type ReviewPayload = { rating?: number; text?: string; userEmail?: string; userDisplayName?: string };

// [DB-TUNING] Migra escrita para subcoleção reviews e atualiza rating por transação atômica sem full scan.
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  let body: ReviewPayload = {};
  try { body = (await request.json()) as ReviewPayload; } catch { body = {}; }
  const ratingValue = parseRatingValue(body.rating ?? 0);
  const text = body.text?.trim() ?? "";
  const userEmail = body.userEmail?.trim() ?? "";
  const userDisplayName = body.userDisplayName?.trim() || userEmail || "Anonymous";
  if (!text) return NextResponse.json({ error: "Please add your commentary." }, { status: 400 });
  if (ratingValue < 0 || ratingValue > 5) return NextResponse.json({ error: "Invalid rating value." }, { status: 400 });

  try {
    const db = getAdminFirestore();
    const createdAt = Timestamp.now();
    const payload = { createdAt, grade: ratingValue, rating: ratingValue, restaurantId: id, text, userDisplayName, userEmail: userEmail || null };
    const docRef = await db.collection(COLLECTIONS.RESTAURANTS).doc(id).collection(SUB.REVIEWS).add(payload);
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(id);
    const nextAvg = await db.runTransaction(async (tx) => {
      const restDoc = await tx.get(restaurantRef);
      const data = restDoc.data() ?? {};
      const newCount = Number(data.ratingCount ?? 0) + 1;
      const newSum = Number(data.ratingSum ?? 0) + ratingValue;
      const newRating = Number((newSum / newCount).toFixed(2));
      tx.update(restaurantRef, { ratingSum: newSum, ratingCount: newCount, rating: newRating, starsgiven: newRating });
      return newRating;
    });
    return NextResponse.json({ review: { id: docRef.id, ...payload }, rating: nextAvg });
  } catch (error) {
    console.error("[Restaurant Reviews API] submit failed:", error);
    return NextResponse.json({ error: "Unable to submit commentary right now." }, { status: 500 });
  }
}
