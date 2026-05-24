/**
 * BioDine™ — Cyber-Physical Intelligence Layer
 *
 * Closes the physical→digital→physical loop:
 *   Wearable sensors → Claude AI analysis → Staff actuators + ambient controls
 *
 * CPS cycle:
 *   Mundo físico → Sensores (wearable) → Computação (aqui) → Atuadores → Mundo físico alterado
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
    WearableSignal,
    WearableSignalType,
    DishResponseRecord,
    FlavorProfileRecord,
    TablePulseRecord,
    WearableSessionRecord,
} from "./hubModels";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export type BiometricAnalysisInput = {
    signals: WearableSignal[];
    dishId: string;
    dishName: string;
    customerUid: string;
    restaurantId: string;
    sessionId: string;
    flavorProfile?: FlavorProfileRecord;
};

export type BiometricAnalysisOutput = {
    excitementScore: number;
    comfortScore: number;
    overallScore: number;
    staffAction: string;
    flavorInsight: string;
    profileDelta: {
        categoryAffinities: Record<string, number>;
        shouldAddToTopDishes: boolean;
        shouldAddToAvoidList: boolean;
        avoidReason?: string;
    };
};

export type DiningPulseInput = {
    sessions: WearableSessionRecord[];
    recentDishResponses: DishResponseRecord[];
    restaurantId: string;
};

export type DiningPulseOutput = {
    tablePulses: TablePulseRecord[];
    roomMoodScore: number;        // 0–100 aggregate of all tables
    ambientRecommendation: {
        lightingTone: "warm" | "neutral" | "cool";
        musicEnergy: "low" | "medium" | "high";
        rationale: string;
    };
};

// ─── Prompts ──────────────────────────────────────────────────────────────────

const BIOMETRIC_SYSTEM_PROMPT = `You are BioDine AI, a Cyber-Physical System intelligence layer for a restaurant platform.
You receive raw biometric signals from a diner's wearable device during a meal and analyze them to:
1. Infer emotional response to the current dish (excitement, comfort, discomfort)
2. Generate a precise staff action (what the waiter should do RIGHT NOW)
3. Suggest flavor profile updates based on the biometric signature

Signal types:
- heart_rate (BPM): spike above baseline = excitement/surprise; sustained high = positive engagement
- gsr (microsiemens): spike = strong arousal (positive or negative — correlate with HR)
- motion_cadence (chews/min): high = eating fast = enjoying; very low = hesitation
- skin_temp (°C): warm = comfort; cool drop = stress/discomfort
- hrv (ms): high HRV = relaxed pleasure; low HRV = stress

Scoring rules:
- excitementScore 0–100: emotional arousal positively correlated with dish
- comfortScore 0–100: physiological ease and satisfaction
- overallScore = 0.6 * excitementScore + 0.4 * comfortScore

Respond ONLY with valid JSON:
{
  "excitementScore": number,
  "comfortScore": number,
  "overallScore": number,
  "staffAction": "string (max 80 chars, imperative, specific — e.g. 'Offer a wine refill now — guest is highly engaged')",
  "flavorInsight": "string (max 120 chars — what this dish revealed about the diner's taste)",
  "profileDelta": {
    "categoryAffinities": { "category_name": delta_number },
    "shouldAddToTopDishes": boolean,
    "shouldAddToAvoidList": boolean,
    "avoidReason": "string|null"
  }
}`;

const DINING_PULSE_SYSTEM_PROMPT = `You are the BioDine AI room orchestrator for a restaurant Cyber-Physical System.
Given the current biometric snapshot of all active dining sessions, generate:
1. Per-table staff action prompts (what the team should do for each table right now)
2. Room-level ambient recommendations (lighting tone + music energy)

Table happiness scores are 0–100. Trend is rising/stable/falling.
Staff actions must be specific, short (≤80 chars), and immediately actionable.
Ambient recommendations should consider the room's aggregate mood.

Respond ONLY with valid JSON:
{
  "tablePulses": [
    {
      "tableLabel": "string",
      "sessionId": "string",
      "happinessScore": number,
      "trend": "rising"|"stable"|"falling",
      "currentDishName": "string|null",
      "staffAction": "string (≤80 chars)"
    }
  ],
  "roomMoodScore": number,
  "ambientRecommendation": {
    "lightingTone": "warm"|"neutral"|"cool",
    "musicEnergy": "low"|"medium"|"high",
    "rationale": "string (≤120 chars)"
  }
}`;

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Analyzes a diner's biometric signals during a dish window.
 * Returns dish response scores + staff action + flavor profile delta.
 * Called by the wearable signal ingestion route after each dish interval.
 */
export async function analyzeBiometricWindow(
    input: BiometricAnalysisInput
): Promise<BiometricAnalysisOutput> {
    const { signals, dishName, flavorProfile } = input;

    const signalSummary = signals
        .map((s) => `${s.type}: ${s.value} ${s.unit} @ ${new Date(s.capturedAt).toISOString()}`)
        .join("\n");

    const profileContext = flavorProfile
        ? `Diner's existing flavor profile affinities: ${JSON.stringify(flavorProfile.categoryAffinities)}\nTop dishes count: ${flavorProfile.topDishes.length}`
        : "No prior flavor profile — first session.";

    const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: BIOMETRIC_SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        // Stable per session — cache the profile context
                        text: `Diner context:\n${profileContext}`,
                        cache_control: { type: "ephemeral" } as { type: "ephemeral" },
                    },
                    {
                        type: "text",
                        text: `Current dish: ${dishName}\n\nBiometric signals (last 2 minutes):\n${signalSummary}\n\nAnalyze and respond with JSON only.`,
                    },
                ],
            },
        ],
    });

    const raw = response.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("BioDine AI returned no valid JSON");
    return JSON.parse(jsonMatch[0]) as BiometricAnalysisOutput;
}

/**
 * Generates the full dining pulse snapshot for the restaurant dashboard.
 * Orchestrates ambient actuator signals (lighting, music) based on room biometrics.
 */
export async function generateDiningPulse(
    input: DiningPulseInput
): Promise<DiningPulseOutput> {
    const { sessions, recentDishResponses } = input;

    const responseMap = new Map<string, DishResponseRecord>();
    for (const r of recentDishResponses) {
        responseMap.set(r.sessionId, r);
    }

    const sessionSummaries = sessions.map((s) => {
        const latestResponse = responseMap.get(s.id ?? "");
        return {
            tableLabel: s.tableLabel,
            sessionId: s.id ?? "",
            happinessScore: s.happinessScore,
            currentDishName: latestResponse?.dishName ?? null,
        };
    });

    const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: DINING_PULSE_SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: `Active tables snapshot:\n${JSON.stringify(sessionSummaries, null, 2)}\n\nGenerate dining pulse JSON.`,
            },
        ],
    });

    const raw = response.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("BioDine AI pulse returned no valid JSON");
    return JSON.parse(jsonMatch[0]) as DiningPulseOutput;
}

/**
 * Merges a dish response analysis into the diner's accumulated FlavorProfile.
 * Pure function — caller persists the result.
 */
export function mergeIntoFlavorProfile(
    existing: FlavorProfileRecord | null,
    dishResponse: DishResponseRecord,
    profileDelta: BiometricAnalysisOutput["profileDelta"]
): FlavorProfileRecord {
    const base: FlavorProfileRecord = existing ?? {
        customerUid: dishResponse.customerUid,
        categoryAffinities: {},
        topDishes: [],
        avoidList: [],
        totalSessions: 0,
        lastUpdatedAt: Date.now(),
    };

    // Merge category affinity deltas (clamped 0–100)
    const affinities = { ...base.categoryAffinities };
    for (const [cat, delta] of Object.entries(profileDelta.categoryAffinities)) {
        const current = affinities[cat] ?? 50;
        affinities[cat] = Math.min(100, Math.max(0, current + delta));
    }

    // Add to top dishes if score is high enough and not already present
    let topDishes = [...base.topDishes];
    if (profileDelta.shouldAddToTopDishes) {
        const alreadyIn = topDishes.some((d) => d.dishId === dishResponse.dishId);
        if (!alreadyIn) {
            topDishes.push({
                dishId: dishResponse.dishId,
                dishName: dishResponse.dishName,
                restaurantId: dishResponse.restaurantId,
                score: dishResponse.overallScore,
            });
            topDishes = topDishes.sort((a, b) => b.score - a.score).slice(0, 20);
        }
    }

    // Add to avoid list if discomfort was detected
    let avoidList = [...base.avoidList];
    if (profileDelta.shouldAddToAvoidList) {
        const alreadyAvoided = avoidList.some((d) => d.dishId === dishResponse.dishId);
        if (!alreadyAvoided) {
            avoidList.push({
                dishId: dishResponse.dishId,
                dishName: dishResponse.dishName,
                reason: profileDelta.avoidReason ?? "Biometric discomfort detected",
            });
        }
    }

    return {
        ...base,
        categoryAffinities: affinities,
        topDishes,
        avoidList,
        totalSessions: base.totalSessions + 1,
        lastUpdatedAt: Date.now(),
    };
}

/**
 * Computes a simple happiness score from raw signals without calling AI.
 * Used for real-time updates between full AI analysis cycles (low latency path).
 */
export function computeHappinessFromSignals(signals: WearableSignal[]): number {
    const latest = (type: WearableSignalType) =>
        signals.filter((s) => s.type === type).at(-1)?.value ?? null;

    const hr = latest("heart_rate");
    const gsr = latest("gsr");
    const cadence = latest("motion_cadence");
    const hrv = latest("hrv");

    let score = 50;
    let factors = 0;

    if (hr !== null) {
        // Optimal enjoyment HR: elevated but not stressed (70–90 BPM for most adults)
        const hrScore = hr >= 65 && hr <= 95 ? 70 : hr > 95 ? 55 : 45;
        score += hrScore - 50;
        factors++;
    }
    if (gsr !== null) {
        // Moderate GSR spike (0.5–3 µS) = excitement; very high = stress
        const gsrScore = gsr >= 0.5 && gsr <= 3 ? 75 : gsr > 3 ? 40 : 50;
        score += gsrScore - 50;
        factors++;
    }
    if (cadence !== null) {
        // Fast eating cadence = enjoyment
        const cadenceScore = cadence > 60 ? 80 : cadence > 30 ? 60 : 40;
        score += cadenceScore - 50;
        factors++;
    }
    if (hrv !== null) {
        // High HRV = relaxed; low = stressed
        const hrvScore = hrv > 40 ? 72 : hrv > 20 ? 55 : 35;
        score += hrvScore - 50;
        factors++;
    }

    if (factors === 0) return 50;
    return Math.min(100, Math.max(0, Math.round(score / factors + 50 - 50 / factors)));
}

// WearableSignalType is imported from hubModels above — no local redeclaration needed.
