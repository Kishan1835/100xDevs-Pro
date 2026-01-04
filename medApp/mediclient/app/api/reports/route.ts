import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      include: {
        healthMetrics: true,
        aiInsights: true,
      },
      orderBy: { uploadDate: "desc" },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileUrl, fileSize, reportType, userId } = body

    const report = await prisma.report.create({
      data: {
        fileName,
        fileUrl,
        fileSize,
        reportType,
        userId,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
