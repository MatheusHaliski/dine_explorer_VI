import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { ChannelMessage, StaffRole } from "@/app/lib/hubModels";

const STAFF_ROLES: StaffRole[] = ["manager", "attendant", "worker"];

const verifyStaffIdentity = async (
  request: NextRequest,
  restaurantId: string
): Promise<{ ok: true; uid: string; role: StaffRole } | { ok: false; response: Response }> => {
  const authorization = request.headers.get("authorization") ?? "";
  const bearerPrefix = "Bearer ";

  if (!authorization.startsWith(bearerPrefix)) {
    return { ok: false, response: NextResponse.json({ error: "Missing Firebase auth token." }, { status: 401 }) };
  }

  const idToken = authorization.slice(bearerPrefix.length).trim();
  if (!idToken) {
    return { ok: false, response: NextResponse.json({ error: "Missing Firebase auth token." }, { status: 401 }) };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const role = decoded.restaurantRole as StaffRole | undefined;
    const tokenRestaurantId = decoded.restaurantId as string | undefined;

    if (!decoded.uid || !role || !STAFF_ROLES.includes(role)) {
      return { ok: false, response: NextResponse.json({ error: "Staff role required." }, { status: 403 }) };
    }

    if (tokenRestaurantId !== restaurantId) {
      return { ok: false, response: NextResponse.json({ error: "Forbidden restaurant scope." }, { status: 403 }) };
    }

    return { ok: true, uid: decoded.uid, role };
  } catch (error) {
    console.error("[Operations Messages API] token verification failed", error);
    return { ok: false, response: NextResponse.json({ error: "Invalid Firebase auth token." }, { status: 401 }) };
  }
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ restaurantId: string; channelId: string }> }) {
  const { restaurantId, channelId } = await params;
  const snapshot = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("operationsChannels").doc(channelId).collection("messages").orderBy("createdAt", "desc").limit(100).get();
  return NextResponse.json({ messages: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ restaurantId: string; channelId: string }> }) {
  const { restaurantId, channelId } = await params;
  const identity = await verifyStaffIdentity(request, restaurantId);
  if (!identity.ok) return identity.response;

  const payload = (await request.json()) as Partial<ChannelMessage>;

  if (!payload.text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  if (payload.senderUid && payload.senderUid !== identity.uid) {
    return NextResponse.json({ error: "senderUid mismatch." }, { status: 403 });
  }

  if (payload.senderRole && payload.senderRole !== identity.role) {
    return NextResponse.json({ error: "senderRole mismatch." }, { status: 403 });
  }

  const message: ChannelMessage = {
    senderUid: identity.uid,
    senderRole: identity.role,
    text: payload.text,
    attachments: payload.attachments ?? [],
    createdAt: Date.now(),
  };

  const doc = await getAdminFirestore().collection("restaurants").doc(restaurantId).collection("operationsChannels").doc(channelId).collection("messages").add(message);
  return NextResponse.json({ ok: true, id: doc.id, message });
}
