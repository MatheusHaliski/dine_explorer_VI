import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth } from "@/app/lib/firebaseAdmin";
import { getFirestoreMetrics } from "@/app/lib/firestoreQueryMetrics";

// [DB-TUNING] Exporta métricas acumuladas apenas para platform_admin.
export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (decoded.globalRole !== "platform_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ metrics: getFirestoreMetrics() });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
