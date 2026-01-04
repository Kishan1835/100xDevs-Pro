type ProfileLite = {
    userId: string;
    skills: string[];
    stacks: string[];
    college?: string | null;
    timezone?: string | null;
    bio?: string | null;
};

export type Candidate = ProfileLite & { verified: boolean };

export function jaccard(a: string[], b: string[]) {
    const A = new Set(a.map(s => s.toLowerCase()));
    const B = new Set(b.map(s => s.toLowerCase()));
    const inter = [...A].filter(x => B.has(x)).length;
    const uni = new Set([...A, ...B]).size;
    return uni ? inter / uni : 0;
}

export function baselineScore(seeker: Candidate, other: Candidate, opts: {
    theme?: string;
    preferSameCollege?: boolean;
    verifiedOnly?: boolean;
}) {
    if (opts.verifiedOnly && !other.verified) return -1;

    const skillScore = jaccard(seeker.skills, other.skills);    // 0..1
    const stackScore = jaccard(seeker.stacks, other.stacks);    // 0..1
    const collegeBoost = opts.preferSameCollege && seeker.college && other.college &&
        seeker.college.toLowerCase() === other.college.toLowerCase() ? 0.1 : 0;

    // Simple themed boost if skill hints match the event theme keywords
    const themeBoost = opts.theme && (other.skills.join(" ").includes(opts.theme) || other.bio?.includes(opts.theme))
        ? 0.1 : 0;

    // weighted sum (tweak as needed)
    let score = 0.6 * skillScore + 0.3 * stackScore + collegeBoost + themeBoost;

    // tiny timezone nudge (same zone)
    if (seeker.timezone && other.timezone && seeker.timezone === other.timezone) score += 0.05;

    return Math.min(1, score);
}

/** Constrained random: keep only candidates above thresholds, then shuffle */
export function constrainedRandom(seeker: Candidate, candidates: Candidate[], opts: {
    minSkill?: number; minStack?: number; verifiedOnly?: boolean; preferSameCollege?: boolean;
    theme?: string; take?: number;
}) {
    const minSkill = opts.minSkill ?? 0.15;
    const minStack = opts.minStack ?? 0.0;
    const filtered = candidates
        .map(c => {
            const s = baselineScore(seeker, c, {
                theme: opts.theme,
                preferSameCollege: opts.preferSameCollege,
                verifiedOnly: opts.verifiedOnly
            });
            return { c, s };
        })
        .filter(x => x.s >= Math.max(minSkill, minStack));

    // shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered
        .sort((a, b) => b.s - a.s)  // keep decent order; random already added variety
        .slice(0, opts.take ?? 7)
        .map(x => ({ userId: x.c.userId, score: Math.round(x.s * 100) }));
}
