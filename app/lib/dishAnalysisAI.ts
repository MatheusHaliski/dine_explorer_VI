import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type DishSignalSample = {
    heartRate?: number;
    stressLevel?: number;
    skinConductance?: number;
    timestamp: number;
};

export type DishAnalysisOutput = {
    overallScore: number;
    sentiment: "positive" | "neutral" | "negative";
    summary: string;
};

const SYSTEM_PROMPT = `You are a biometric sentiment analysis AI for a restaurant dining experience platform.
Given a dish name and a window of wearable biometric samples from a diner, compute an overall happiness score.
heartRate is beats per minute. stressLevel is 0-100 (0=calm, 100=stressed). skinConductance is microsiemens (higher = more aroused).
Always respond with valid JSON matching this exact shape:
{
  "overallScore": number (0-100, where 0=very unhappy, 100=very happy),
  "sentiment": "positive" | "neutral" | "negative",
  "summary": "string (1 sentence, objective, no diner PII)"
}
Rules: overallScore > 70 is positive, 40-70 is neutral, < 40 is negative. Base the score on signal trends.`;

export async function analyzeDishResponse(params: {
    dishName: string;
    signals: DishSignalSample[];
}): Promise<DishAnalysisOutput> {
    const { dishName, signals } = params;

    const signalText = JSON.stringify(signals, null, 2);

    const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Dish: ${dishName}\nBiometric window (${signals.length} samples):\n${signalText}\n\nRespond with JSON only.`,
                    },
                ],
            },
        ],
    });

    const raw = response.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned no valid JSON");

    return JSON.parse(jsonMatch[0]) as DishAnalysisOutput;
}
