import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
    await db.user.deleteMany();
    await db.event.deleteMany();

    const event = await db.event.create({
        data: {
            title: "AI & FinTech Sprint",
            theme: "fintech",
            startsAt: new Date(Date.now() + 86400000),
            endsAt: new Date(Date.now() + 3 * 86400000),
        },
    });

    const mkUser = (i: number, skills: string[], stacks: string[], college: string) =>
        db.user.create({
            data: {
                email: `u${i}@demo.dev`,
                name: `User ${i}`,
                profile: { create: { bio: "I love building.", skills, stacks, college, timezone: "Asia/Kolkata" } },
                verif: { create: { status: i % 3 === 0 ? "approved" : "pending" } },
                apps: { create: { eventId: event.id, mode: i % 2 ? "single" : "double" } }
            }
        });

    await Promise.all([
        mkUser(1, ["react", "node", "ml"], ["mern"], "SRM"),
        mkUser(2, ["python", "ml"], ["fastapi"], "Anna University"),
        mkUser(3, ["react", "nextjs", "ui"], ["mern"], "Easwari"),
        mkUser(4, ["solidity", "defi"], ["web3"], "IITM"),
        mkUser(5, ["flutter", "firebase"], ["flutter"], "Easwari"),
        mkUser(6, ["java", "spring"], ["spring"], "SSN"),
    ]);

    console.log("Seeded.");
}

main().finally(() => db.$disconnect());
