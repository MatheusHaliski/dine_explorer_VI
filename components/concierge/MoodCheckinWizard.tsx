"use client";

import { useState } from "react";
import type { ConciergeMood, ConciergeOccasion } from "@/app/lib/hubModels";

const MOODS: { value: ConciergeMood; emoji: string; label: string }[] = [
    { value: "relaxed", emoji: "😌", label: "Relaxado" },
    { value: "celebratory", emoji: "🥳", label: "Celebrando" },
    { value: "romantic", emoji: "❤️", label: "Romântico" },
    { value: "social", emoji: "🗣️", label: "Sociável" },
    { value: "comfort", emoji: "🫂", label: "Conforto" },
];

const OCCASIONS: { value: ConciergeOccasion; label: string }[] = [
    { value: "date", label: "Encontro" },
    { value: "family", label: "Família" },
    { value: "business", label: "Negócios" },
    { value: "solo", label: "Solo" },
    { value: "friends", label: "Amigos" },
];

type Props = {
    restaurantId: string;
    onResult: (recommendation: unknown) => void;
};

export default function MoodCheckinWizard({ restaurantId, onResult }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [mood, setMood] = useState<ConciergeMood | null>(null);
    const [occasion, setOccasion] = useState<ConciergeOccasion | null>(null);
    const [partySize, setPartySize] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        if (!mood || !occasion) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/restaurants/${restaurantId}/concierge/checkin`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mood, occasion, partySize }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Erro inesperado");
            onResult(data.recommendation);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 max-w-md mx-auto">
            <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "bg-orange-500" : "bg-zinc-700"}`}
                    />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Como você está se sentindo?</h2>
                    <div className="grid grid-cols-5 gap-2">
                        {MOODS.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMood(m.value)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                                    mood === m.value
                                        ? "border-orange-500 bg-orange-500/10"
                                        : "border-zinc-700 hover:border-zinc-500"
                                }`}
                            >
                                <span className="text-2xl">{m.emoji}</span>
                                <span className="text-xs text-zinc-300">{m.label}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setStep(2)}
                        disabled={!mood}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg font-medium transition-colors"
                    >
                        Próximo
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Qual a ocasião?</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {OCCASIONS.map((o) => (
                            <button
                                key={o.value}
                                onClick={() => setOccasion(o.value)}
                                className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                                    occasion === o.value
                                        ? "border-orange-500 bg-orange-500/10 text-white"
                                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:border-zinc-500 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!occasion}
                            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg font-medium transition-colors"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Quantas pessoas?</h2>
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                            className="w-10 h-10 rounded-full border border-zinc-700 text-white text-lg hover:border-zinc-500 transition-colors"
                        >
                            −
                        </button>
                        <span className="text-4xl font-bold text-white w-12 text-center">{partySize}</span>
                        <button
                            onClick={() => setPartySize((n) => Math.min(20, n + 1))}
                            className="w-10 h-10 rounded-full border border-zinc-700 text-white text-lg hover:border-zinc-500 transition-colors"
                        >
                            +
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:border-zinc-500 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg font-medium transition-colors"
                        >
                            {loading ? "Gerando..." : "Ver sugestão"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
