import type { RerankRequest } from "..";

export async function rerankWithGemini(req: RerankRequest) {
    // TODO: call Gemini 1.5/Flash via REST; return same shape
    // Keep schema: [{userId, score, rationale, icebreakers:string[]}]
    // For MVP you can mimic AI by lightly shuffling top baseline candidates & add short rationales.
    const base = req.candidates.slice(0, 10).map(c => ({
        userId: c.userId,
        score: 70 + Math.floor(Math.random() * 30),
        rationale: "Gemini placeholder: skills align with theme.",
        icebreakers: [
            `What part of ${req.eventTheme ?? "the hackathon"} excites you most?`,
            "Pick a quick task we can ship in 2 hours.",
            "What’s one tool you want to try this weekend?"
        ]
    }));
    return base;
}
