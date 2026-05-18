import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { ChannelMessage } from "@/app/lib/hubModels";

export async function GET(_: NextRequest, { params }: { params: Promise<{ restaurantId: string; channelId: string }> }) {
  const { restaurantId, channelId } = await params;
  const snapshot = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("operationsChannels").doc(channelId).collection("messages").orderBy("createdAt", "desc").limit(100).get();
  return NextResponse.json({ messages: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string; channelId: string }> }) {
  const { restaurantId, channelId } = await params;
  const payload = (await request.json()) as Partial<ChannelMessage>;
  if (!payload.senderUid || !payload.senderRole || !payload.text) return NextResponse.json({ error: "senderUid, senderRole, text required" }, { status: 400 });
  const message: ChannelMessage = { senderUid: payload.senderUid, senderRole: payload.senderRole, text: payload.text, attachments: payload.attachments ?? [], createdAt: Date.now() };
  const doc = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("operationsChannels").doc(channelId).collection("messages").add(message);
  return NextResponse.json({ ok: true, id: doc.id, message });
}
