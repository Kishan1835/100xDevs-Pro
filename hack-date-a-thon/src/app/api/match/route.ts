import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rerank } from "@/lib/ai";
import { baselineScore } from "@/lib/matching";

type Candidate = {
    userId: string;
    skills: string[];
    stacks: string[];
    college: string | null;
    timezone: string | null;
    bio: string;
    verified: boolean;
};

export async function POST(req: NextRequest) {
    const { email, eventId } = await req.json();

    const seeker = await db.user.findUnique({
        where: { email },
        include: { profile: true, verif: true, apps: { where: { eventId } } }
    });
    if (!seeker?.profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Must be applied to event
    const app = await db.application.findFirst({ where: { userId: seeker.id, eventId } });
    if (!app) return NextResponse.json({ error: "Apply to event first" }, { status: 400 });

    // Optionally enforce verification
    const allowUnverified = process.env.ALLOW_UNVERIFIED === "true";
    if (!allowUnverified && seeker.verif?.status !== "approved") {
        return NextResponse.json({ error: "Verification required" }, { status: 403 });
    }

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const others = await db.user.findMany({
        where: { id: { not: seeker.id }, apps: { some: { eventId } } },
        include: { profile: true, verif: true }
    });

    const toCandidate = (u: any) => ({
        userId: u.id,
        skills: u.profile?.skills ?? [],
        stacks: u.profile?.stacks ?? [],
        college: u.profile?.college ?? null,
        timezone: u.profile?.timezone ?? null,
        bio: u.profile?.bio ?? "",
        verified: u.verif?.status === "approved"
    });

    const seekerC = toCandidate(seeker);
    const candidates = others.map(toCandidate);

    // Pre-filter: must pass a basic baseline threshold
    const filtered = candidates.filter((c: Candidate) => baselineScore(seekerC, c, {
        theme: event.theme, verifiedOnly: true, preferSameCollege: false
    }) >= 0.1);

    const ranked = await rerank({
        seeker: seekerC,
        candidates: filtered,
        eventTheme: event.theme
    });

    return NextResponse.json({ matches: ranked, count: ranked.length });
}
