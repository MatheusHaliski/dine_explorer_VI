import { NextRequest, NextResponse } from "next/server";

import { SOCIAL, SOCIAL_SUB } from "@/app/lib/collections";
import type { SchemeComment } from "@/app/lib/social/socialModel";
import { db, ensureUserDoc, resolveActorEmail, FieldValue } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

// GET → lista comentários (mais recentes primeiro).
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await ctx.params;
  try {
    const snap = await db()
      .collection(SOCIAL.PUBLIC_SCHEMES)
      .doc(id)
      .collection(SOCIAL_SUB.COMMENTS)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SchemeComment);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[Social Scheme Comments] list failed:", error);
    return NextResponse.json({ error: "Unable to load comments." }, { status: 500 });
  }
}

type Body = { actorEmail?: string; authorDisplayName?: string; text?: string };

// POST → adiciona comentário.
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await ctx.params;
  let body: Body = {};
  try { body = (await request.json()) as Body; } catch { body = {}; }

  const actor = resolveActorEmail(request, body.actorEmail);
  const text = (body.text ?? "").trim();
  if (!actor) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  if (!text) return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });

  try {
    await ensureUserDoc(actor);
    const schemeRef = db().collection(SOCIAL.PUBLIC_SCHEMES).doc(id);
    const payload = {
      authorEmail: actor,
      authorDisplayName: (body.authorDisplayName ?? "").trim() || actor,
      text,
      createdAt: Date.now(),
    };
    const docRef = await schemeRef.collection(SOCIAL_SUB.COMMENTS).add(payload);
    await schemeRef.set({ commentsCount: FieldValue.increment(1) }, { merge: true });
    return NextResponse.json({ comment: { id: docRef.id, ...payload } });
  } catch (error) {
    console.error("[Social Scheme Comments] add failed:", error);
    return NextResponse.json({ error: "Unable to add comment." }, { status: 500 });
  }
}
