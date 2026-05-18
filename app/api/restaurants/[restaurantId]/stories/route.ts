import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { StoryRecord } from "@/app/lib/hubModels";

export async function GET(_: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const now = Date.now();
  const snapshot = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("stories")
    .where("expiresAt", ">", now).orderBy("expiresAt", "asc").limit(100).get();
  return NextResponse.json({ stories: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const payload = (await request.json()) as Partial<StoryRecord>;
  if (!payload.authorUid || !payload.mediaUrl) return NextResponse.json({ error: "authorUid and mediaUrl required" }, { status: 400 });
  const createdAt = Date.now();
  const story: StoryRecord = { restaurantId, authorUid: payload.authorUid, mediaUrl: payload.mediaUrl, title: payload.title, createdAt, expiresAt: payload.expiresAt ?? createdAt + 24 * 60 * 60 * 1000 };
  const doc = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("stories").add(story);
  return NextResponse.json({ ok: true, id: doc.id, story });
}
