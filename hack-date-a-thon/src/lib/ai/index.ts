import { constrainedRandom } from "../matching";
import type { Candidate } from "../matching";

export type RerankRequest = {
    seeker: Candidate;
    candidates: Candidate[];
    eventTheme?: string;
};

export async function rerank(req: RerankRequest) {
    const enabled = process.env.ENABLE_AI === "true";
    const provider = (process.env.AI_PROVIDER || "none").toLowerCase();

    if (!enabled || provider === "none") {
        // return constrained random with deterministic baseline
        return constrainedRandom(req.seeker, req.candidates, {
            theme: req.eventTheme, verifiedOnly: true, preferSameCollege: false, take: 7
        }).map(x => ({ ...x, rationale: "Baseline score + constrained random (no AI).", icebreakers: [] }));
    }

    if (provider === "gemini") {
        const { rerankWithGemini } = await import("./providers/gemini");
        return rerankWithGemini(req);
    }

    throw new Error("Unsupported AI_PROVIDER");
}
