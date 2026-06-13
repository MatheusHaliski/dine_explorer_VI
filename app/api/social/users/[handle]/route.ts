import { NextRequest, NextResponse } from "next/server";

import { SOCIAL } from "@/app/lib/collections";
import { normalizeEmailKey } from "@/app/lib/social/socialModel";
import { db, ensureUserDoc, followId } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

// GET /api/social/users/{handle}?viewer=email
// Devolve o perfil social + se o viewer segue este usuário + listas de followers/following.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ handle: string }> }
): Promise<Response> {
  const { handle } = await context.params;
  const targetKey = normalizeEmailKey(decodeURIComponent(handle));
  if (!targetKey) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const viewer = normalizeEmailKey(request.nextUrl.searchParams.get("viewer") || "");

  try {
    const user = await ensureUserDoc(targetKey);

    const [followersSnap, followingSnap, viewerFollowSnap] = await Promise.all([
      db().collection(SOCIAL.FOLLOWS).where("following", "==", targetKey).limit(200).get(),
      db().collection(SOCIAL.FOLLOWS).where("follower", "==", targetKey).limit(200).get(),
      viewer
        ? db().collection(SOCIAL.FOLLOWS).doc(followId(viewer, targetKey)).get()
        : Promise.resolve(null),
    ]);

    const followers = followersSnap.docs.map((d) => String(d.data().follower));
    const following = followingSnap.docs.map((d) => String(d.data().following));

    return NextResponse.json({
      user,
      followers,
      following,
      isFollowing: viewerFollowSnap ? viewerFollowSnap.exists : false,
      isSelf: viewer === targetKey,
    });
  } catch (error) {
    console.error("[Social User] fetch failed:", error);
    return NextResponse.json({ error: "Unable to load profile." }, { status: 500 });
  }
}
