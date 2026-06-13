import { NextRequest, NextResponse } from "next/server";

import { SOCIAL, SOCIAL_SUB } from "@/app/lib/collections";
import { normalizeEmailKey, type PublicSchemeDoc } from "@/app/lib/social/socialModel";
import { db, incrementUserCounter, resolveActorEmail } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

// GET /api/social/schemes/{id}?viewer=email → esquema + estado do espectador.
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await ctx.params;
  const viewer = normalizeEmailKey(request.nextUrl.searchParams.get("viewer") || "");
  try {
    const ref = db().collection(SOCIAL.PUBLIC_SCHEMES).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Scheme not found." }, { status: 404 });
    const scheme = snap.data() as PublicSchemeDoc;

    let liked = false;
    let saved = false;
    if (viewer) {
      const [l, s] = await Promise.all([
        ref.collection(SOCIAL_SUB.LIKES).doc(viewer).get(),
        ref.collection(SOCIAL_SUB.SAVES).doc(viewer).get(),
      ]);
      liked = l.exists;
      saved = s.exists;
    }
    return NextResponse.json({ scheme, liked, saved });
  } catch (error) {
    console.error("[Social Scheme] fetch failed:", error);
    return NextResponse.json({ error: "Unable to load scheme." }, { status: 500 });
  }
}

// DELETE /api/social/schemes/{id} → despublica (apenas o autor).
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await ctx.params;
  let body: { actorEmail?: string } = {};
  try { body = await request.json(); } catch { body = {}; }
  const actor = resolveActorEmail(request, body.actorEmail);
  if (!actor) return NextResponse.json({ error: "Sign in." }, { status: 401 });

  try {
    const ref = db().collection(SOCIAL.PUBLIC_SCHEMES).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ ok: true });
    const data = snap.data() as PublicSchemeDoc;
    if (normalizeEmailKey(data.authorEmail) !== actor) {
      return NextResponse.json({ error: "Not your scheme." }, { status: 403 });
    }
    await ref.delete();
    await incrementUserCounter(actor, "publicSchemesCount", -1);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Social Scheme] delete failed:", error);
    return NextResponse.json({ error: "Unable to delete scheme." }, { status: 500 });
  }
}
