import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import type { ConciergeRecommendationRecord, MoodCheckinRecord } from "@/app/lib/hubModels";

type DashboardConciergePageProps = { searchParams?: Promise<{ restaurantId?: string }> };

type OccasionCount = { occasion: string; count: number };
type TopCombo = { mood: string; itemName: string; count: number };

export default async function DashboardConciergePage({ searchParams }: DashboardConciergePageProps) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const restaurantId = resolvedSearchParams.restaurantId ?? "default";

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);

    const [restaurantSnap, recSnap] = await Promise.all([
        restaurantRef.get(),
        restaurantRef
            .collection(SUB.CONCIERGE_RECOMMENDATIONS)
            .orderBy("createdAt", "desc")
            .limit(200)
            .get(),
    ]);

    const restaurantData = restaurantSnap.data() ?? {};
    const totalCheckins = Number(restaurantData.conciergeCheckinsCount ?? 0);
    const totalAccepted = Number(restaurantData.conciergeAcceptanceCount ?? 0);
    const acceptanceRate =
        totalCheckins > 0 ? Math.round((totalAccepted / totalCheckins) * 100) : 0;

    const recommendations = recSnap.docs.map(
        (doc) => doc.data() as ConciergeRecommendationRecord
    );

    // Count occasions from accepted recommendations
    const occasionMap = new Map<string, number>();
    const comboMap = new Map<string, number>();

    for (const rec of recommendations) {
        // We need checkin data for mood — count item names by mood from accepted recs
        if (rec.status === "accepted") {
            for (const item of rec.recommendedItems) {
                const key = `${item.name}`;
                comboMap.set(key, (comboMap.get(key) ?? 0) + 1);
            }
        }
    }

    // Fetch recent checkins for occasion breakdown (last 100)
    const checkinSnap = await db
        .collectionGroup(SUB.MOOD_CHECKINS)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

    const checkins = checkinSnap.docs.map((doc) => doc.data() as MoodCheckinRecord);

    for (const checkin of checkins) {
        occasionMap.set(checkin.occasion, (occasionMap.get(checkin.occasion) ?? 0) + 1);
    }

    const occasionRanking: OccasionCount[] = Array.from(occasionMap.entries())
        .map(([occasion, count]) => ({ occasion, count }))
        .sort((a, b) => b.count - a.count);

    const topCombos: TopCombo[] = Array.from(comboMap.entries())
        .map(([itemName, count]) => ({ mood: "—", itemName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const kpis = [
        { label: "Total de Check-ins", value: totalCheckins },
        { label: "Recomendações Aceitas", value: totalAccepted },
        { label: "Taxa de Aceitação", value: `${acceptanceRate}%` },
    ];

    return (
        <main className="min-h-screen bg-black text-white p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Concierge</h1>
                <p className="text-sm text-zinc-400 mt-1">
                    Tendências de humor e performance das recomendações — {restaurantId}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                {kpis.map((kpi) => (
                    <article key={kpi.label} className="border border-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-400 text-sm">{kpi.label}</p>
                        <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    </article>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <section className="border border-zinc-800 rounded-lg p-4 space-y-3">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                        Ocasiões mais frequentes
                    </h2>
                    {occasionRanking.length === 0 ? (
                        <p className="text-zinc-500 text-sm">Sem dados ainda.</p>
                    ) : (
                        <ul className="space-y-2">
                            {occasionRanking.map((row) => (
                                <li key={row.occasion} className="flex justify-between text-sm">
                                    <span className="text-zinc-300 capitalize">{row.occasion}</span>
                                    <span className="text-white font-medium">{row.count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="border border-zinc-800 rounded-lg p-4 space-y-3">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                        Pratos mais recomendados (aceitos)
                    </h2>
                    {topCombos.length === 0 ? (
                        <p className="text-zinc-500 text-sm">Sem dados ainda.</p>
                    ) : (
                        <ul className="space-y-2">
                            {topCombos.map((row, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                    <span className="text-zinc-300">{row.itemName}</span>
                                    <span className="text-white font-medium">{row.count}x</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}
