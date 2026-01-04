import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, name, bio, skills = [], stacks = [], college, timezone = "Asia/Kolkata" } = body;

    const user = await db.user.upsert({
        where: { email },
        update: {
            name, profile: {
                upsert: {
                    create: { bio, skills, stacks, college, timezone },
                    update: { bio, skills, stacks, college, timezone }
                }
            }
        },
        create: {
            email, name, profile: { create: { bio, skills, stacks, college, timezone } },
            verif: { create: { status: "pending" } }
        },
        include: { profile: true, verif: true }
    });

    return NextResponse.json(user);
}
