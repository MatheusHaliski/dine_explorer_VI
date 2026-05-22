"use client";

import { useState } from "react";
import type { ConciergeRecommendationRecord } from "@/app/lib/hubModels";
import PostDraftPreview from "./PostDraftPreview";

type Props = {
    restaurantId: string;
    recommendation: ConciergeRecommendationRecord & { id: string };
    onResolved?: (status: "accepted" | "dismissed") => void;
};

export default function RecommendationCard({ restaurantId, recommendation, onResolved }: Props) {
    const [showPostDraft, setShowPostDraft] = useState(false);
    const [resolved, setResolved] = useState<"accepted" | "dismissed" | null>(null);
    const [loading, setLoading] = useState(false);

    const resolve = async (action: "accept" | "dismiss", publishPost = false, body?: string) => {
        setLoading(true);
        const url = `/api/restaurants/${restaurantId}/concierge/${recommendation.id}/${action}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: action === "accept" ? JSON.stringify({ publishPost, body }) : "{}",
        });
        setLoading(false);
        if (res.ok) {
            const status = action === "accept" ? "accepted" : "dismissed";
            setResolved(status);
            onResolved?.(status);
        }
    };

    const scoreColor =
        recommendation.matchScore >= 80
            ? "text-green-400"
            : recommendation.matchScore >= 60
            ? "text-yellow-400"
            : "text-zinc-400";

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Sugestão do Concierge</h3>
                <span className={`text-sm font-bold ${scoreColor}`}>
                    {recommendation.matchScore}% match
                </span>
            </div>

            <ul className="space-y-3">
                {recommendation.recommendedItems.map((item) => (
                    <li key={item.productId} className="flex gap-3">
                        {item.photo && (
                            <img
                                src={item.photo}
                                alt={item.name}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                        )}
                        <div>
                            <p className="text-white text-sm font-medium">{item.name}</p>
                            <p className="text-zinc-400 text-xs">{item.reason}</p>
                        </div>
                    </li>
                ))}
            </ul>

            {resolved ? (
                <p className="text-center text-sm text-zinc-400">
                    {resolved === "accepted" ? "Boa refeição! 🍽️" : "Entendido, da próxima fica melhor!"}
                </p>
            ) : showPostDraft ? (
                <PostDraftPreview
                    draft={recommendation.postDraft}
                    onPublish={(body) => resolve("accept", true, body)}
                    onSkip={() => resolve("accept", false)}
                    onCancel={() => setShowPostDraft(false)}
                    loading={loading}
                />
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={() => resolve("dismiss")}
                        disabled={loading}
                        className="flex-1 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:border-zinc-500 transition-colors disabled:opacity-40"
                    >
                        Não é pra mim
                    </button>
                    <button
                        onClick={() => setShowPostDraft(true)}
                        disabled={loading}
                        className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                    >
                        Vou nessa!
                    </button>
                </div>
            )}
        </div>
    );
}
