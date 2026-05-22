import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { readSession } from "@/app/lib/serverSession";
import { withRetry } from "@/app/lib/firestoreRetry";
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

    const recSnap = await recRef.get();
    if (!recSnap.exists) {
        return NextResponse.json({ error: "Recommendation not found." }, { status: 404 });
    }

    const rec = recSnap.data() as ConciergeRecommendationRecord;
    if (rec.customerUid !== session.sub) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (rec.status !== "pending") {
        return NextResponse.json({ error: "Recommendation already resolved." }, { status: 409 });
    }

    const now = Date.now();

    const result = await withRetry(async () => {
        await recRef.update({ status: "accepted", acceptedAt: now });

        await restaurantRef.update({
            conciergeAcceptanceCount: FieldValue.increment(1),
        });

        let postId: string | null = null;
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
            const postRef = await restaurantRef.collection(SUB.POSTS).add(post);
            await restaurantRef.update({ postsCount: FieldValue.increment(1) });
            postId = postRef.id;
        }

        return { postId };
    });

    return NextResponse.json({ ok: true, postId: result.postId });
}
