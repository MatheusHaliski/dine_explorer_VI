import Anthropic from "@anthropic-ai/sdk";
import type {
    ConciergeMood,
    ConciergeOccasion,
    ConciergeRecommendedItem,
} from "./hubModels";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type CatalogItem = {
    productId: string;
    name: string;
    photo?: string;
    description?: string;
    price?: number;
    category?: string;
};

export type OrderHistoryItem = {
    name: string;
    quantity: number;
};

export type ConciergeAIOutput = {
    recommendedItems: ConciergeRecommendedItem[];
    matchScore: number;
    postDraft: {
        body: string;
        shoppableCta: { label: string; productIds: string[] };
    };
};

const SYSTEM_PROMPT = `You are a culinary concierge AI for a restaurant discovery app.
Given a customer's mood, occasion, party size, and order history, select exactly 3 items
from the provided catalog that best match their moment.
Always respond with valid JSON matching this exact shape:
{
  "recommendedItems": [
    { "productId": "string", "name": "string", "photo": "string|null", "reason": "string (1 sentence)" }
  ],
  "matchScore": number (0-100),
  "postDraft": {
    "body": "string (max 140 chars, casual tone, no hashtags)",
    "shoppableCta": { "label": "string (max 30 chars)", "productIds": ["string"] }
  }
}
Rules: matchScore reflects how well the selection fits mood + occasion. body should feel personal, not promotional.`;

export async function generateConciergeRecommendation(params: {
    mood: ConciergeMood;
    occasion: ConciergeOccasion;
    partySize: number;
    catalog: CatalogItem[];
    orderHistory: OrderHistoryItem[];
}): Promise<ConciergeAIOutput> {
    const { mood, occasion, partySize, catalog, orderHistory } = params;

    const catalogText = JSON.stringify(catalog, null, 2);
    const userContext = `Mood: ${mood}
Occasion: ${occasion}
Party size: ${partySize}
Order history (past items): ${orderHistory.length > 0 ? JSON.stringify(orderHistory) : "No history yet"}`;

    const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        // Catalog is stable per request batch — cache it to save tokens
                        text: `Available catalog:\n${catalogText}`,
                        cache_control: { type: "ephemeral" } as { type: "ephemeral" },
                    },
                    {
                        type: "text",
                        text: `Customer context:\n${userContext}\n\nRespond with JSON only.`,
                    },
                ],
            },
        ],
    });

    const raw = response.content.find((b) => b.type === "text")?.text ?? "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned no valid JSON");

    return JSON.parse(jsonMatch[0]) as ConciergeAIOutput;
}
