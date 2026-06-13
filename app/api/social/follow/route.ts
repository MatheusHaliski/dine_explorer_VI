import { NextRequest, NextResponse } from "next/server";

import { SOCIAL } from "@/app/lib/collections";
import { normalizeEmailKey } from "@/app/lib/social/socialModel";
import {
  db,
  ensureUserDoc,
  followId,
  incrementUserCounter,
  resolveActorEmail,
} from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

type Body = { actorEmail?: string; targetEmail?: string };

// POST → seguir; DELETE → deixar de seguir.
export async function POST(request: NextRequest): Promise<Response> {
  return mutate(request, "follow");
}

export async function DELETE(request: NextRequest): Promise<Response> {
  return mutate(request, "unfollow");
}

async function mutate(request: NextRequest, action: "follow" | "unfollow"): Promise<Response> {
  let body: Body = {};
  try { body = (await request.json()) as Body; } catch { body = {}; }

  const actor = resolveActorEmail(request, body.actorEmail);
  const target = normalizeEmailKey(body.targetEmail);

  if (!actor) return NextResponse.json({ error: "Sign in to follow." }, { status: 401 });
  if (!target) return NextResponse.json({ error: "Missing target user." }, { status: 400 });
  if (actor === target) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });

  try {
    await ensureUserDoc(actor);
    await ensureUserDoc(target);

    const ref = db().collection(SOCIAL.FOLLOWS).doc(followId(actor, target));
    const exists = (await ref.get()).exists;

    if (action === "follow") {
      if (!exists) {
        await ref.set({ follower: actor, following: target, createdAt: Date.now() });
        await Promise.all([
          incrementUserCounter(actor, "followingCount", 1),
          incrementUserCounter(target, "followersCount", 1),
        ]);
      }
      return NextResponse.json({ following: true });
    }

    if (exists) {
      await ref.delete();
      await Promise.all([
        incrementUserCounter(actor, "followingCount", -1),
        incrementUserCounter(target, "followersCount", -1),
      ]);
    }
    return NextResponse.json({ following: false });
  } catch (error) {
    console.error("[Social Follow] failed:", error);
    return NextResponse.json({ error: "Unable to update follow state." }, { status: 500 });
  }
}
