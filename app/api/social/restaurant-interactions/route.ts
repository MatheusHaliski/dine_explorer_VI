import { NextRequest, NextResponse } from "next/server";

import { COLLECTIONS, SUB, SOCIAL, SOCIAL_SUB } from "@/app/lib/collections";
import { normalizeEmailKey, type RestaurantInteraction } from "@/app/lib/social/socialModel";
import { db } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

type Body = { viewer?: string; restaurantIds?: string[] };

// POST /api/social/restaurant-interactions { viewer, restaurantIds[] }
// Devolve, em lote, { [restaurantId]: { liked, saved, likesCount } } para renderizar os cards.
export async function POST(request: NextRequest): Promise<Response> {
  let body: Body = {};
  try { body = (await request.json()) as Body; } catch { body = {}; }

  const viewer = normalizeEmailKey(body.viewer);
  const ids = Array.isArray(body.restaurantIds)
    ? Array.from(new Set(body.restaurantIds.filter((x): x is string => typeof x === "string" && !!x))).slice(0, 60)
    : [];

  if (ids.length === 0) return NextResponse.json({ interactions: {} });

  try {
    const firestore = db();
    const entries = await Promise.all(
      ids.map(async (id) => {
        const restaurantRef = firestore.collection(COLLECTIONS.RESTAURANTS).doc(id);
        const [restSnap, likeSnap, saveSnap] = await Promise.all([
          restaurantRef.get(),
          viewer ? restaurantRef.collection(SUB.LIKES).doc(viewer).get() : Promise.resolve(null),
          viewer
            ? firestore.collection(SOCIAL.USERS).doc(viewer).collection(SOCIAL_SUB.SAVED_RESTAURANTS).doc(id).get()
            : Promise.resolve(null),
        ]);
        const interaction: RestaurantInteraction = {
          liked: likeSnap ? likeSnap.exists : false,
          saved: saveSnap ? saveSnap.exists : false,
          likesCount: Number(restSnap.data()?.likesCount ?? 0),
        };
        return [id, interaction] as const;
      })
    );
    return NextResponse.json({ interactions: Object.fromEntries(entries) });
  } catch (error) {
    console.error("[Restaurant Interactions] failed:", error);
    return NextResponse.json({ error: "Unable to load interactions." }, { status: 500 });
  }
}
