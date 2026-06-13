import { NextRequest, NextResponse } from "next/server";

import { SOCIAL, SOCIAL_SUB } from "@/app/lib/collections";
import { db, ensureUserDoc, resolveActorEmail, FieldValue } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return toggle(request, ctx, true);
}
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return toggle(request, ctx, false);
}

async function toggle(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
  on: boolean
): Promise<Response> {
  const { id } = await ctx.params;
  let body: { actorEmail?: string } = {};
  try { body = await request.json(); } catch { body = {}; }
  const actor = resolveActorEmail(request, body.actorEmail);
  if (!actor) return NextResponse.json({ error: "Sign in to like." }, { status: 401 });

  try {
    await ensureUserDoc(actor);
    const schemeRef = db().collection(SOCIAL.PUBLIC_SCHEMES).doc(id);
    const likeRef = schemeRef.collection(SOCIAL_SUB.LIKES).doc(actor);
    const exists = (await likeRef.get()).exists;

    if (on && !exists) {
      await likeRef.set({ email: actor, createdAt: Date.now() });
      await schemeRef.set({ likesCount: FieldValue.increment(1) }, { merge: true });
    } else if (!on && exists) {
      await likeRef.delete();
      await schemeRef.set({ likesCount: FieldValue.increment(-1) }, { merge: true });
    }

    const fresh = await schemeRef.get();
    return NextResponse.json({ liked: on, likesCount: Number(fresh.data()?.likesCount ?? 0) });
  } catch (error) {
    console.error("[Social Scheme Like] failed:", error);
    return NextResponse.json({ error: "Unable to update like." }, { status: 500 });
  }
}
