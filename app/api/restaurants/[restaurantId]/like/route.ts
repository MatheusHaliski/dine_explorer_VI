import { NextRequest, NextResponse } from "next/server";

import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { db, ensureUserDoc, resolveActorEmail, FieldValue } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest, ctx: { params: Promise<{ restaurantId: string }> }) {
  return toggle(request, ctx, true);
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ restaurantId: string }> }) {
  return toggle(request, ctx, false);
}

async function toggle(
  request: NextRequest,
  ctx: { params: Promise<{ restaurantId: string }> },
  on: boolean
): Promise<Response> {
  const { restaurantId } = await ctx.params;
  if (!restaurantId) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

  let body: { actorEmail?: string } = {};
  try { body = await request.json(); } catch { body = {}; }
  const actor = resolveActorEmail(request, body.actorEmail);
  if (!actor) return NextResponse.json({ error: "Sign in to like." }, { status: 401 });

  try {
    await ensureUserDoc(actor);
    const restaurantRef = db().collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);
    const likeRef = restaurantRef.collection(SUB.LIKES).doc(actor);
    const exists = (await likeRef.get()).exists;

    if (on && !exists) {
      await likeRef.set({ email: actor, createdAt: Date.now() });
      await restaurantRef.set({ likesCount: FieldValue.increment(1) }, { merge: true });
    } else if (!on && exists) {
      await likeRef.delete();
      await restaurantRef.set({ likesCount: FieldValue.increment(-1) }, { merge: true });
    }

    const fresh = await restaurantRef.get();
    return NextResponse.json({ liked: on, likesCount: Number(fresh.data()?.likesCount ?? 0) });
  } catch (error) {
    console.error("[Restaurant Like] failed:", error);
    return NextResponse.json({ error: "Unable to update like." }, { status: 500 });
  }
}
