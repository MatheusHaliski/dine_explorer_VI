import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { IssueRecord } from "@/app/lib/hubModels";

export async function GET(_: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const snapshot = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("issues").orderBy("updatedAt", "desc").limit(100).get();
  return NextResponse.json({ issues: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const payload = (await request.json()) as Partial<IssueRecord>;
  if (!payload.title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const now = Date.now();
  const issue: IssueRecord = { restaurantId, title: payload.title, description: payload.description, conversationId: payload.conversationId, status: "new", assignedToUid: null, priority: payload.priority ?? "normal", dueAt: payload.dueAt ?? now + 20 * 60 * 1000, createdAt: now, updatedAt: now };
  const doc = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("issues").add(issue);
  return NextResponse.json({ ok: true, id: doc.id, issue });
}
