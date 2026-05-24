import Anthropic from "@anthropic-ai/sdk";
import type {
    ConciergeMood,
    ConciergeOccasion,
    ConciergeRecommendedItem,
    FlavorProfileRecord,
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

const SYSTEM_PROMPT = `You are a culinary concierge AI for Dine Explorer AI, a BioDine™-powered restaurant platform.
Given a customer's mood, occasion, party size, order history, and optionally their BioDine™ biometric flavor profile,
select exactly 3 items from the provided catalog that best match their moment AND their biological taste preferences.

When a flavor profile is provided:
- Prioritize dishes aligned with high-affinity categories (score > 65)
- NEVER recommend dishes in the avoidList
- Boost matchScore when top biometric dishes match catalog items
- Mention the biometric insight in the recommendation reason when relevant

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
Rules: matchScore reflects how well the selection fits mood + occasion + biometric profile. body should feel personal, not promotional.`;

export async function generateConciergeRecommendation(params: {
    mood: ConciergeMood;
    occasion: ConciergeOccasion;
    partySize: number;
    catalog: CatalogItem[];
    orderHistory: OrderHistoryItem[];
    /** BioDine™ biometric flavor profile — enriches recommendations with biological taste data */
    flavorProfile?: FlavorProfileRecord;
}): Promise<ConciergeAIOutput> {
    const { mood, occasion, partySize, catalog, orderHistory, flavorProfile } = params;

    const catalogText = JSON.stringify(catalog, null, 2);

    const flavorContext = flavorProfile
        ? `\nBioDine™ Flavor Profile (biometric data from ${flavorProfile.totalSessions} visits):
Category affinities: ${JSON.stringify(flavorProfile.categoryAffinities)}
Biometric top dishes: ${flavorProfile.topDishes.slice(0, 5).map((d) => d.dishName).join(", ") || "none yet"}
Avoid list: ${flavorProfile.avoidList.map((d) => `${d.dishName} (${d.reason})`).join(", ") || "none"}`
        : "\nNo BioDine™ profile yet — use mood and history only.";

    const userContext = `Mood: ${mood}
Occasion: ${occasion}
Party size: ${partySize}
Order history (past items): ${orderHistory.length > 0 ? JSON.stringify(orderHistory) : "No history yet"}${flavorContext}`;

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
