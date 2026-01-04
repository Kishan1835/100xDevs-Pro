import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Database utility functions
export async function createUser(data: { email: string; name?: string }) {
  return await prisma.user.create({
    data,
  })
}

export async function getUserReports(userId: string) {
  return await prisma.report.findMany({
    where: { userId },
    include: {
      healthMetrics: true,
      aiInsights: true,
    },
    orderBy: { uploadDate: "desc" },
  })
}

export async function getHealthMetrics(userId: string, metricType?: string) {
  return await prisma.healthMetric.findMany({
    where: {
      userId,
      ...(metricType && { metricType }),
    },
    orderBy: { date: "asc" },
  })
}

export async function getLatestAIInsights(userId: string, limit = 5) {
  const reports = await prisma.report.findMany({
    where: { userId },
    include: {
      aiInsights: {
        orderBy: { createdAt: "desc" },
        take: limit,
      },
    },
  })

  return reports.flatMap((report) => report.aiInsights).slice(0, limit)
}
