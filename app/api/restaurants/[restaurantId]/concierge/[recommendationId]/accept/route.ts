import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import type { ConciergeRecommendationRecord, SocialPostRecord } from "@/app/lib/hubModels";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string; recommendationId: string }> }
): Promise<Response> {
    const session = readSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { restaurantId, recommendationId } = await params;

    let publishPost = false;
    let customBody: string | undefined;
    try {
        const body = await request.json() as { publishPost?: boolean; body?: string };
        publishPost = body.publishPost === true;
        customBody = body.body;
    } catch {
        // body is optional
    }

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);
    const recRef = restaurantRef.collection(SUB.CONCIERGE_RECOMMENDATIONS).doc(recommendationId);
    const now = Date.now();

    let postId: string | null = null;

    try {
        await db.runTransaction(async (tx) => {
            const recSnap = await tx.get(recRef);
            if (!recSnap.exists) {
                throw Object.assign(new Error("not_found"), { code: 404 });
            }

            const rec = recSnap.data() as ConciergeRecommendationRecord;
            if (rec.customerUid !== session.sub) {
                throw Object.assign(new Error("forbidden"), { code: 403 });
            }
            // Precondition inside the transaction — prevents double-acceptance under concurrency.
            if (rec.status !== "pending") {
                throw Object.assign(new Error("already_resolved"), { code: 409 });
            }

            tx.update(recRef, { status: "accepted", acceptedAt: now });

            const restaurantUpdates: Record<string, unknown> = {
                conciergeAcceptanceCount: FieldValue.increment(1),
            };

            if (publishPost) {
                const postBody = customBody ?? rec.postDraft.body;
                const post: SocialPostRecord = {
                    restaurantId,
                    authorUid: session.sub,
                    type: "text",
                    category: "ugc-feature",
                    body: postBody,
                    shoppableCta: rec.postDraft.shoppableCta,
                    createdAt: now,
                    updatedAt: now,
                };
                // Pre-generate the post ref so the ID is available after the transaction.
                const postRef = restaurantRef.collection(SUB.POSTS).doc();
                postId = postRef.id;
                tx.set(postRef, post);
                restaurantUpdates.postsCount = FieldValue.increment(1);
            }

            // Single update on restaurantRef so the transaction touches it only once.
            tx.update(restaurantRef, restaurantUpdates);
        });
    } catch (err) {
        const code = (err as { code?: number }).code;
        if (code === 404) return NextResponse.json({ error: "Recommendation not found." }, { status: 404 });
        if (code === 403) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        if (code === 409) return NextResponse.json({ error: "Recommendation already resolved." }, { status: 409 });
        console.error("[Concierge Accept] transaction failed:", err);
        return NextResponse.json({ error: "Unable to accept recommendation." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, postId });
}
