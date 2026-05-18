import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { Restaurant } from "@/app/gate/restaurantpagegate";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
        const limitValue = Number.isFinite(limitParam) && limitParam > 0
            ? Math.min(limitParam, MAX_LIMIT)
            : DEFAULT_LIMIT;
        const cursor = searchParams.get("cursor")?.trim() || null;

        const db = getAdminFirestore();
        let query = db
            .collection("restaurants")
            .orderBy(FieldPath.documentId())
            .limit(limitValue);

        if (cursor) {
            query = query.startAfter(cursor);
        }

        const snapshot = await withFirestoreQueryMetrics(
            {
                feature_name: "restaurants_paginated",
                collection: "restaurants",
                operation_type: "getDocs",
            },
            async () => {
                const result = await query.get();
                return { result, docsReturned: result.size };
            }
        );

        const restaurants = snapshot.docs.map((doc) => ({
            ...(doc.data() as Restaurant),
            id: doc.id,
        }));
        const lastDoc = snapshot.docs.at(-1);
        const nextCursor = snapshot.docs.length === limitValue ? lastDoc?.id ?? null : null;
        return NextResponse.json({ restaurants, nextCursor });
    } catch (error) {
        console.error("[Restaurants API] load failed:", error);
        return NextResponse.json(
            { error: "Unable to load restaurants." },
            { status: 500 }
        );
    }
}
