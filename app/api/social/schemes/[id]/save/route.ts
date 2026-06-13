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
  if (!actor) return NextResponse.json({ error: "Sign in to save." }, { status: 401 });

  try {
    await ensureUserDoc(actor);
    const schemeRef = db().collection(SOCIAL.PUBLIC_SCHEMES).doc(id);
    const saveRef = schemeRef.collection(SOCIAL_SUB.SAVES).doc(actor);
    const exists = (await saveRef.get()).exists;

    if (on && !exists) {
      await saveRef.set({ email: actor, createdAt: Date.now() });
      await schemeRef.set({ savesCount: FieldValue.increment(1) }, { merge: true });
    } else if (!on && exists) {
      await saveRef.delete();
      await schemeRef.set({ savesCount: FieldValue.increment(-1) }, { merge: true });
    }

    const fresh = await schemeRef.get();
    return NextResponse.json({ saved: on, savesCount: Number(fresh.data()?.savesCount ?? 0) });
  } catch (error) {
    console.error("[Social Scheme Save] failed:", error);
    return NextResponse.json({ error: "Unable to update save." }, { status: 500 });
  }
}
