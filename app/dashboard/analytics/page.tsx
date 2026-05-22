import { COLLECTIONS } from "@/app/lib/collections";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";

// [DB-TUNING] Usa contadores derivados no documento do restaurante para evitar full scans.
type AnalyticsPageProps = { searchParams?: Promise<{ restaurantId?: string }> };

export default async function DashboardAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const restaurantId = resolvedSearchParams.restaurantId ?? "default";
  const db = getAdminFirestore();
  const restaurantSnap = await db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).get();
  const data = restaurantSnap.data() ?? {};
  const metrics = [
    { label: "Posts", value: Number(data.postsCount ?? 0) },
    { label: "Conversations", value: Number(data.conversationsCount ?? 0) },
    { label: "Orders", value: Number(data.ordersCount ?? 0) },
    { label: "Concierge Check-ins", value: Number(data.conciergeCheckinsCount ?? 0) },
    { label: "Concierge Aceitos", value: Number(data.conciergeAcceptanceCount ?? 0) },
  ];
  return <main className="min-h-screen bg-black text-white p-6 space-y-5"><h1 className="text-2xl font-semibold">Analytics</h1><p className="text-sm text-zinc-300">Engagement → Orders → Retention ({restaurantId})</p><div className="grid md:grid-cols-3 gap-3">{metrics.map((metric) => <article key={metric.label} className="border border-zinc-800 rounded p-4"><p className="text-zinc-300 text-sm">{metric.label}</p><p className="text-2xl font-semibold">{metric.value}</p></article>)}</div></main>;
}
