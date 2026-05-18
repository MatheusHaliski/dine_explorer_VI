import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { UgcRecord } from "@/app/lib/hubModels";

export async function GET(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const status = request.nextUrl.searchParams.get("status");
  let q: FirebaseFirestore.Query = getAdminFirestore().collection("restaurants").doc(restaurantId).collection("ugc");
  if (status) q = q.where("status", "==", status);
  const snapshot = await q.orderBy("createdAt", "desc").limit(100).get();
  return NextResponse.json({ ugc: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const payload = (await request.json()) as Partial<UgcRecord>;
  if (!payload.customerUid || !payload.mediaUrl) return NextResponse.json({ error: "customerUid and mediaUrl required" }, { status: 400 });
  const now = Date.now();
  const ugc: UgcRecord = { restaurantId, customerUid: payload.customerUid, mediaUrl: payload.mediaUrl, caption: payload.caption, menuItemIds: payload.menuItemIds ?? [], status: "pending", createdAt: now, updatedAt: now };
  const doc = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("ugc").add(ugc);
  return NextResponse.json({ ok: true, id: doc.id, ugc });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const { id, status, moderatedByUid } = (await request.json()) as { id: string; status: "approved" | "rejected"; moderatedByUid: string };
  if (!id || !status || !moderatedByUid) return NextResponse.json({ error: "id, status, moderatedByUid required" }, { status: 400 });
  await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("ugc").doc(id).set({ status, moderatedByUid, updatedAt: Date.now() }, { merge: true });
  return NextResponse.json({ ok: true });
}
