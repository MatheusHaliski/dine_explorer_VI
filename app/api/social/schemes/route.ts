import { NextRequest, NextResponse } from "next/server";

import { SOCIAL, SOCIAL_SUB } from "@/app/lib/collections";
import { normalizeEmailKey, type PublicSchemeDoc } from "@/app/lib/social/socialModel";
import { db, ensureUserDoc, incrementUserCounter, resolveActorEmail } from "@/app/lib/social/socialServer";

export const runtime = "nodejs";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// GET /api/social/schemes?scope=all|following&viewer=email&author=email
// Devolve esquemas públicos + (se viewer) estado de curtida/salvo do espectador.
export async function GET(request: NextRequest): Promise<Response> {
  const sp = request.nextUrl.searchParams;
  const scope = sp.get("scope") || "all";
  const viewer = normalizeEmailKey(sp.get("viewer") || "");
  const author = normalizeEmailKey(sp.get("author") || "");

  try {
    let docs: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    if (author) {
      const snap = await db()
        .collection(SOCIAL.PUBLIC_SCHEMES)
        .where("authorEmail", "==", author)
        .limit(100)
        .get();
      docs = snap.docs;
    } else if (scope === "following" && viewer) {
      const followingSnap = await db()
        .collection(SOCIAL.FOLLOWS)
        .where("follower", "==", viewer)
        .limit(300)
        .get();
      const authors = followingSnap.docs.map((d) => String(d.data().following));
      if (authors.length === 0) return NextResponse.json({ schemes: [] });
      // 'in' aceita até 10 valores por query no Admin SDK → particiona.
      const batches = await Promise.all(
        chunk(authors, 10).map((group) =>
          db().collection(SOCIAL.PUBLIC_SCHEMES).where("authorEmail", "in", group).limit(100).get()
        )
      );
      docs = batches.flatMap((b) => b.docs);
    } else {
      const snap = await db()
        .collection(SOCIAL.PUBLIC_SCHEMES)
        .orderBy("createdAt", "desc")
        .limit(60)
        .get();
      docs = snap.docs;
    }

    let schemes = docs.map((d) => d.data() as PublicSchemeDoc);
    schemes.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    // Anexa estado do espectador (curtidas/salvos) em paralelo.
    if (viewer && schemes.length) {
      const states = await Promise.all(
        schemes.map(async (s) => {
          const [likeSnap, saveSnap] = await Promise.all([
            db().collection(SOCIAL.PUBLIC_SCHEMES).doc(s.id).collection(SOCIAL_SUB.LIKES).doc(viewer).get(),
            db().collection(SOCIAL.PUBLIC_SCHEMES).doc(s.id).collection(SOCIAL_SUB.SAVES).doc(viewer).get(),
          ]);
          return { liked: likeSnap.exists, saved: saveSnap.exists };
        })
      );
      schemes = schemes.map((s, i) => ({ ...s, ...states[i] }) as PublicSchemeDoc & { liked: boolean; saved: boolean });
    }

    return NextResponse.json({ schemes });
  } catch (error) {
    console.error("[Social Schemes] feed failed:", error);
    return NextResponse.json({ error: "Unable to load feed." }, { status: 500 });
  }
}

type PublishBody = {
  actorEmail?: string;
  scheme?: Partial<PublicSchemeDoc> & { id?: string };
};

// POST /api/social/schemes → publica (upsert) um esquema público.
export async function POST(request: NextRequest): Promise<Response> {
  let body: PublishBody = {};
  try { body = (await request.json()) as PublishBody; } catch { body = {}; }

  const actor = resolveActorEmail(request, body.actorEmail);
  const scheme = body.scheme;
  if (!actor) return NextResponse.json({ error: "Sign in to publish." }, { status: 401 });
  if (!scheme?.id || !scheme?.name) return NextResponse.json({ error: "Invalid scheme." }, { status: 400 });

  try {
    await ensureUserDoc(actor);
    const ref = db().collection(SOCIAL.PUBLIC_SCHEMES).doc(scheme.id);
    const existing = await ref.get();
    const now = Date.now();

    const doc: PublicSchemeDoc = {
      id: scheme.id,
      name: String(scheme.name),
      description: String(scheme.description ?? ""),
      occasion: scheme.occasion ?? "lunch",
      authorEmail: actor,
      authorDisplayName: String(scheme.authorDisplayName ?? actor),
      restaurantId: scheme.restaurantId ?? null,
      restaurantName: scheme.restaurantName ?? null,
      pieces: Array.isArray(scheme.pieces) ? scheme.pieces : [],
      listFormat: scheme.listFormat ?? "grid-2",
      background: scheme.background ?? null,
      titleFont: scheme.titleFont ?? null,
      // Preserva contadores em re-publicações.
      likesCount: existing.exists ? Number(existing.data()?.likesCount ?? 0) : 0,
      savesCount: existing.exists ? Number(existing.data()?.savesCount ?? 0) : 0,
      commentsCount: existing.exists ? Number(existing.data()?.commentsCount ?? 0) : 0,
      createdAt: existing.exists ? Number(existing.data()?.createdAt ?? now) : now,
      updatedAt: now,
    };

    await ref.set(doc, { merge: true });
    if (!existing.exists) await incrementUserCounter(actor, "publicSchemesCount", 1);

    return NextResponse.json({ scheme: doc });
  } catch (error) {
    console.error("[Social Schemes] publish failed:", error);
    return NextResponse.json({ error: "Unable to publish scheme." }, { status: 500 });
  }
}
