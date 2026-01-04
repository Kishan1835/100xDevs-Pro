import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Stub: accept a fake URL; later replace with S3/UploadThing */
export async function POST(req: NextRequest) {
    const { email, docUrl } = await req.json(); // docUrl from client upload
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await db.verification.upsert({
        where: { userId: user.id },
        create: { userId: user.id, status: "pending", docUrl },
        update: { docUrl, status: "pending" }
    });

    return NextResponse.json({ ok: true, status: "pending" });
}
