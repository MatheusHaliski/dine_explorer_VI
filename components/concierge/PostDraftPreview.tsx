"use client";

import { useState } from "react";

type Props = {
    draft: {
        body: string;
        shoppableCta: { label: string; productIds: string[] };
    };
    onPublish: (body: string) => void;
    onSkip: () => void;
    onCancel: () => void;
    loading: boolean;
};

export default function PostDraftPreview({ draft, onPublish, onSkip, onCancel, loading }: Props) {
    const [body, setBody] = useState(draft.body);
    const remaining = 140 - body.length;

    return (
        <div className="space-y-3">
            <p className="text-sm text-zinc-400">
                Compartilhe esse momento no Social Hub — edite à vontade:
            </p>
            <div className="relative">
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, 140))}
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-orange-500"
                />
                <span
                    className={`absolute bottom-2 right-3 text-xs ${
                        remaining < 20 ? "text-red-400" : "text-zinc-500"
                    }`}
                >
                    {remaining}
                </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800 rounded-lg px-3 py-2">
                <span>🛒</span>
                <span>{draft.shoppableCta.label}</span>
                <span className="ml-auto">{draft.shoppableCta.productIds.length} produto(s)</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="py-2 px-3 border border-zinc-700 text-zinc-300 rounded-lg text-xs hover:border-zinc-500 transition-colors disabled:opacity-40"
                >
                    Voltar
                </button>
                <button
                    onClick={onSkip}
                    disabled={loading}
                    className="flex-1 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:border-zinc-500 transition-colors disabled:opacity-40"
                >
                    Aceitar sem postar
                </button>
                <button
                    onClick={() => onPublish(body)}
                    disabled={loading || body.trim().length === 0}
                    className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                >
                    {loading ? "Publicando..." : "Publicar"}
                </button>
            </div>
        </div>
    );
}
