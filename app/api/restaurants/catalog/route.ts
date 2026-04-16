import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { Restaurant } from "@/app/gate/restaurantpagegate";
import { withFirestoreQueryMetrics } from "@/app/lib/firestoreQueryMetrics";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor")?.trim() || null;
        const country = searchParams.get("country")?.trim() || null;
        const state = searchParams.get("state")?.trim() || null;
        const city = searchParams.get("city")?.trim() || null;

        const limitParam = Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
        const limitValue = Number.isFinite(limitParam) && limitParam > 0
            ? Math.min(limitParam, MAX_LIMIT)
            : DEFAULT_LIMIT;

        const db = getAdminFirestore();
        let query = db
            .collection("restaurants")
            .select(
                "name",
                "photo",
                "photoPath",
                "imagePath",
                "storagePath",
                "categories",
                "category",
                "rating",
                "starsgiven",
                "country",
                "state",
                "city",
                "address",
                "street"
            )
            .orderBy(FieldPath.documentId())
            .limit(limitValue);

        if (country) {
            query = query.where("country", "==", country);
        }

        if (state) {
            query = query.where("state", "==", state);
        }

        if (city) {
            query = query.where("city", "==", city);
        }

        if (cursor) {
            query = query.startAfter(cursor);
        }

        const snapshot = await withFirestoreQueryMetrics(
            {
                feature_name: "restaurants_catalog",
                collection: "restaurants",
                operation_type: "getDocs",
            },
            async () => {
                const result = await query.get();
                return { result, docsReturned: result.size };
            }
        );

        const catalog = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Partial<Restaurant>),
        }));

        const lastDoc = snapshot.docs.at(-1);
        const nextCursor = snapshot.docs.length === limitValue ? lastDoc?.id ?? null : null;

        return NextResponse.json({ catalog, nextCursor });
    } catch (error) {
        console.error("[Restaurants Catalog API] load failed:", error);
        return NextResponse.json(
            { error: "Unable to load restaurant catalog." },
            { status: 500 }
        );
    }
}
