"use client";

import { useState } from "react";
import { use } from "react";
import MoodCheckinWizard from "@/components/concierge/MoodCheckinWizard";
import RecommendationCard from "@/components/concierge/RecommendationCard";
import type { ConciergeRecommendationRecord } from "@/app/lib/hubModels";

type PageProps = { params: Promise<{ restaurantId: string }> };

export default function ConciergePage({ params }: PageProps) {
    const { restaurantId } = use(params);
    const [recommendation, setRecommendation] = useState<
        (ConciergeRecommendationRecord & { id: string }) | null
    >(null);
    const [resolved, setResolved] = useState(false);

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold">Concierge</h1>
                    <p className="text-zinc-400 text-sm">
                        Conte como você está e a gente sugere a experiência perfeita.
                    </p>
                </div>

                {!recommendation && (
                    <MoodCheckinWizard
                        restaurantId={restaurantId}
                        onResult={(rec) =>
                            setRecommendation(rec as ConciergeRecommendationRecord & { id: string })
                        }
                    />
                )}

                {recommendation && !resolved && (
                    <RecommendationCard
                        restaurantId={restaurantId}
                        recommendation={recommendation}
                        onResolved={() => setResolved(true)}
                    />
                )}

                {resolved && (
                    <div className="text-center space-y-4">
                        <p className="text-zinc-300">Aproveite a experiência!</p>
                        <button
                            onClick={() => {
                                setRecommendation(null);
                                setResolved(false);
                            }}
                            className="text-orange-400 text-sm underline"
                        >
                            Fazer novo check-in
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
