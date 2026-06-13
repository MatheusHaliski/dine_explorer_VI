import { NextRequest, NextResponse } from "next/server";

import { SOCIAL, SOCIAL_SUB } from "@/app/lib/collections";
import { normalizeEmailKey } from "@/app/lib/social/socialModel";
import { db, ensureUserDoc, resolveActorEmail } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

export interface SavedRestaurant {
  restaurantId: string;
  name: string;
  photo?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt: number;
}

// GET /api/social/saved-restaurants?viewer=email → lista de favoritos do usuário.
export async function GET(request: NextRequest): Promise<Response> {
  const viewer = normalizeEmailKey(request.nextUrl.searchParams.get("viewer") || "");
  if (!viewer) return NextResponse.json({ restaurants: [] });
  try {
    const snap = await db()
      .collection(SOCIAL.USERS)
      .doc(viewer)
      .collection(SOCIAL_SUB.SAVED_RESTAURANTS)
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    const restaurants = snap.docs.map((d) => ({ restaurantId: d.id, ...d.data() }) as SavedRestaurant);
    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error("[Saved Restaurants] list failed:", error);
    return NextResponse.json({ error: "Unable to load favorites." }, { status: 500 });
  }
}

type MutateBody = {
  actorEmail?: string;
  restaurantId?: string;
  restaurant?: Partial<SavedRestaurant>;
};

// POST → adiciona aos favoritos.
export async function POST(request: NextRequest): Promise<Response> {
  let body: MutateBody = {};
  try { body = (await request.json()) as MutateBody; } catch { body = {}; }
  const actor = resolveActorEmail(request, body.actorEmail);
  const restaurantId = (body.restaurantId ?? "").trim();
  if (!actor) return NextResponse.json({ error: "Sign in to save." }, { status: 401 });
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurant." }, { status: 400 });

  try {
    await ensureUserDoc(actor);
    const r = body.restaurant ?? {};
    await db()
      .collection(SOCIAL.USERS)
      .doc(actor)
      .collection(SOCIAL_SUB.SAVED_RESTAURANTS)
      .doc(restaurantId)
      .set({
        name: r.name ?? "",
        photo: r.photo ?? "",
        city: r.city ?? "",
        state: r.state ?? "",
        country: r.country ?? "",
        createdAt: Date.now(),
      }, { merge: true });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("[Saved Restaurants] add failed:", error);
    return NextResponse.json({ error: "Unable to save favorite." }, { status: 500 });
  }
}

// DELETE → remove dos favoritos.
export async function DELETE(request: NextRequest): Promise<Response> {
  let body: MutateBody = {};
  try { body = (await request.json()) as MutateBody; } catch { body = {}; }
  const actor = resolveActorEmail(request, body.actorEmail);
  const restaurantId = (body.restaurantId ?? "").trim();
  if (!actor) return NextResponse.json({ error: "Sign in." }, { status: 401 });
  if (!restaurantId) return NextResponse.json({ error: "Missing restaurant." }, { status: 400 });

  try {
    await db()
      .collection(SOCIAL.USERS)
      .doc(actor)
      .collection(SOCIAL_SUB.SAVED_RESTAURANTS)
      .doc(restaurantId)
      .delete();
    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("[Saved Restaurants] remove failed:", error);
    return NextResponse.json({ error: "Unable to remove favorite." }, { status: 500 });
  }
}
