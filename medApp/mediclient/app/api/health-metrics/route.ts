import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const metricType = searchParams.get("metricType")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const metrics = await prisma.healthMetric.findMany({
      where: {
        userId,
        ...(metricType && { metricType }),
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching health metrics:", error)
    return NextResponse.json({ error: "Failed to fetch health metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metricType, value, unit, normalRange, isNormal, userId, reportId } = body

    const metric = await prisma.healthMetric.create({
      data: {
        metricType,
        value,
        unit,
        normalRange,
        isNormal,
        userId,
        reportId,
      },
    })

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error("Error creating health metric:", error)
    return NextResponse.json({ error: "Failed to create health metric" }, { status: 500 })
  }
}
