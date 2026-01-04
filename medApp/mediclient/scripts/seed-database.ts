import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  try {
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: "test@meditrack.ai" },
      update: {},
      create: {
        email: "test@meditrack.ai",
        name: "Test User",
      },
    })

    console.log("✅ Created user:", user.email)

    // Create sample reports
    const report1 = await prisma.report.create({
      data: {
        fileName: "Blood_Test_May_2024.pdf",
        fileUrl: "/uploads/blood-test-may.pdf",
        fileSize: "2.4 MB",
        reportType: "CBC",
        userId: user.id,
        analyzed: true,
        status: "completed",
      },
    })

    const report2 = await prisma.report.create({
      data: {
        fileName: "Lipid_Profile_June_2024.pdf",
        fileUrl: "/uploads/lipid-profile-june.pdf",
        fileSize: "1.8 MB",
        reportType: "Lipid Profile",
        userId: user.id,
        analyzed: false,
        status: "completed",
      },
    })

    console.log("✅ Created reports")

    // Create sample health metrics
    const healthMetrics = [
      { metricType: "hemoglobin", value: 14.1, unit: "g/dL", normalRange: "12.0-15.5 g/dL", isNormal: true },
      { metricType: "wbc", value: 6950, unit: "cells/μL", normalRange: "4000-11000 cells/μL", isNormal: true },
      {
        metricType: "platelets",
        value: 315000,
        unit: "cells/μL",
        normalRange: "150000-450000 cells/μL",
        isNormal: true,
      },
      { metricType: "glucose", value: 80, unit: "mg/dL", normalRange: "70-100 mg/dL", isNormal: true },
      { metricType: "cholesterol", value: 155, unit: "mg/dL", normalRange: "<200 mg/dL", isNormal: true },
    ]

    for (const metric of healthMetrics) {
      await prisma.healthMetric.create({
        data: {
          ...metric,
          userId: user.id,
          reportId: report1.id,
        },
      })
    }

    console.log("✅ Created health metrics")

    // Create AI insights
    await prisma.aIInsight.create({
      data: {
        type: "pattern_detection",
        title: "Early-stage anemia indicators detected",
        description:
          "Your hemoglobin levels show a gradual decline pattern that may suggest developing anemia. This is based on trends from your last 3 reports.",
        confidence: 0.78,
        severity: "moderate",
        actionable: true,
        reportId: report1.id,
      },
    })

    console.log("✅ Created AI insights")
    console.log("🎉 Database seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
