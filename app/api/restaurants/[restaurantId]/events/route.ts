import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { EventRecord } from "@/app/lib/hubModels";

export async function GET(_: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const snapshot = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("events").orderBy("startsAt", "asc").limit(100).get();
  return NextResponse.json({ events: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  const payload = (await request.json()) as Partial<EventRecord>;
  if (!payload.title || !payload.startsAt) return NextResponse.json({ error: "title and startsAt required" }, { status: 400 });
  const now = Date.now();
  const event: EventRecord = { restaurantId, title: payload.title, description: payload.description, startsAt: payload.startsAt, endsAt: payload.endsAt, rsvpCount: 0, reminderEnabled: payload.reminderEnabled ?? true, createdAt: now, updatedAt: now };
  const doc = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("events").add(event);
  return NextResponse.json({ ok: true, id: doc.id, event });
}
