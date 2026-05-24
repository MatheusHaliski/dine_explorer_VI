/**
 * BioDine™ Dining Pulse Dashboard
 *
 * Real-time CPS actuator interface for restaurant staff.
 * Shows biometric happiness scores per table, AI staff action prompts,
 * and ambient recommendations (lighting tone + music energy) derived
 * from the room's aggregate biometric state.
 *
 * This is the "actuator" layer of the CPS loop — the physical world
 * (staff behavior, lighting, music) is changed based on what the AI
 * computed from the sensors (wearables).
 */

import { COLLECTIONS, SUB } from "@/app/lib/collections";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { generateDiningPulse } from "@/app/lib/biodineAI";
import type { WearableSessionRecord, DishResponseRecord, TablePulseRecord } from "@/app/lib/hubModels";

type DiningPulsePageProps = { searchParams?: Promise<{ restaurantId?: string }> };

function happinessColor(score: number): string {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
}

function happinessBg(score: number): string {
    if (score >= 75) return "border-emerald-800 bg-emerald-950/40";
    if (score >= 50) return "border-amber-800 bg-amber-950/40";
    return "border-red-800 bg-red-950/40";
}

function trendIcon(trend: TablePulseRecord["trend"]): string {
    if (trend === "rising") return "↑";
    if (trend === "falling") return "↓";
    return "→";
}

function lightingLabel(tone: string): string {
    if (tone === "warm") return "Aquecida (cobre/laranja)";
    if (tone === "cool") return "Fria (azul/branca)";
    return "Neutra (branca natural)";
}

function musicLabel(energy: string): string {
    if (energy === "low") return "Suave / Ambiente";
    if (energy === "high") return "Animada / Energética";
    return "Moderada";
}

export default async function DiningPulsePage({ searchParams }: DiningPulsePageProps) {
    const resolvedParams = (await searchParams) ?? {};
    const restaurantId = resolvedParams.restaurantId ?? "default";

    const db = getAdminFirestore();
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId);

    const [sessionsSnap, dishResponsesSnap] = await Promise.all([
        restaurantRef
            .collection(SUB.WEARABLE_SESSIONS)
            .where("status", "==", "active")
            .orderBy("startedAt", "desc")
            .limit(50)
            .get(),
        restaurantRef
            .collection(SUB.DISH_RESPONSES)
            .orderBy("analysedAt", "desc")
            .limit(100)
            .get(),
    ]);

    const sessions = sessionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as WearableSessionRecord),
    }));

    const dishResponses = dishResponsesSnap.docs.map((doc) =>
        doc.data() as DishResponseRecord
    );

    const noData = sessions.length === 0;

    const pulse = noData
        ? {
              tablePulses: [] as TablePulseRecord[],
              roomMoodScore: 0,
              ambientRecommendation: {
                  lightingTone: "neutral" as const,
                  musicEnergy: "medium" as const,
                  rationale: "Sem sessões ativas no momento.",
              },
          }
        : await generateDiningPulse({ sessions, recentDishResponses: dishResponses, restaurantId });

    const avgScore = pulse.tablePulses.length > 0
        ? Math.round(pulse.tablePulses.reduce((s, t) => s + t.happinessScore, 0) / pulse.tablePulses.length)
        : 0;

    return (
        <main className="min-h-screen bg-black text-white p-6 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase mb-1">
                        Dine Explorer AI · BioDine™
                    </p>
                    <h1 className="text-2xl font-semibold">Dining Pulse</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Biometria em tempo real por mesa — {restaurantId}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Humor do salão</p>
                    <p className={`text-4xl font-bold mt-1 ${happinessColor(avgScore)}`}>
                        {noData ? "—" : `${avgScore}`}
                    </p>
                    <p className="text-xs text-zinc-600">/ 100</p>
                </div>
            </div>

            {/* Ambient recommendation panel */}
            <section className="border border-zinc-800 rounded-xl p-5 space-y-3">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Recomendação de Ambiente · IA
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Iluminação</p>
                        <p className="text-sm font-medium text-white">
                            {lightingLabel(pulse.ambientRecommendation.lightingTone)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Música</p>
                        <p className="text-sm font-medium text-white">
                            {musicLabel(pulse.ambientRecommendation.musicEnergy)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Humor do salão</p>
                        <p className="text-sm font-medium text-white">
                            {pulse.roomMoodScore}/100
                        </p>
                    </div>
                </div>
                <p className="text-xs text-zinc-500 italic border-t border-zinc-800 pt-3">
                    {pulse.ambientRecommendation.rationale}
                </p>
            </section>

            {/* Table grid */}
            {noData ? (
                <div className="border border-zinc-800 rounded-xl p-8 text-center space-y-2">
                    <p className="text-3xl">📡</p>
                    <p className="text-zinc-400 text-sm">
                        Nenhuma pulseira BioDine™ ativa no momento.
                    </p>
                    <p className="text-zinc-600 text-xs">
                        Clientes com wearable conectado aparecerão aqui automaticamente ao sentar.
                    </p>
                </div>
            ) : (
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                        Mesas ativas — {pulse.tablePulses.length} sensores
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pulse.tablePulses.map((table) => (
                            <article
                                key={table.sessionId}
                                className={`border rounded-xl p-4 space-y-3 ${happinessBg(table.happinessScore)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">{table.tableLabel}</span>
                                    <span className={`text-2xl font-bold ${happinessColor(table.happinessScore)}`}>
                                        {table.happinessScore}
                                        <span className="text-xs ml-1 font-normal text-zinc-400">
                                            {trendIcon(table.trend)}
                                        </span>
                                    </span>
                                </div>

                                {table.currentDishName && (
                                    <p className="text-xs text-zinc-400">
                                        Prato atual:{" "}
                                        <span className="text-zinc-200">{table.currentDishName}</span>
                                    </p>
                                )}

                                {table.staffAction && (
                                    <div className="bg-black/30 rounded-lg px-3 py-2">
                                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                                            Ação IA
                                        </p>
                                        <p className="text-xs text-white leading-relaxed">
                                            {table.staffAction}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs text-zinc-500">Wearable ativo</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* CPS legend */}
            <section className="border border-zinc-800 rounded-xl p-4">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Ciclo Ciberfísico BioDine™
                </h2>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    {[
                        { icon: "⌚", label: "Wearable (sensor)" },
                        { icon: "→", label: "" },
                        { icon: "📡", label: "BLE → Cloud" },
                        { icon: "→", label: "" },
                        { icon: "🧠", label: "Claude AI" },
                        { icon: "→", label: "" },
                        { icon: "📋", label: "Este painel (atuador)" },
                        { icon: "→", label: "" },
                        { icon: "🍽️", label: "Melhor experiência" },
                    ].map((item, i) =>
                        item.label ? (
                            <span key={i} className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </span>
                        ) : (
                            <span key={i} className="text-zinc-700 self-center">{item.icon}</span>
                        )
                    )}
                </div>
            </section>
        </main>
    );
}
