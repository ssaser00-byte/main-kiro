import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { biasPlan, poiPlan, entryPlan, exitPlan } = body

    // Deactivate any existing active plans
    await prisma.tradingPlan.updateMany({
      where: {
        userId,
        status: "ACTIVE"
      },
      data: {
        status: "ARCHIVED"
      }
    })

    // Get the latest version number
    const latestPlan = await prisma.tradingPlan.findFirst({
      where: { userId },
      orderBy: { version: "desc" }
    })

    const newVersion = latestPlan ? latestPlan.version + 1 : 1

    // Create new trading plan
    const tradingPlan = await prisma.tradingPlan.create({
      data: {
        userId,
        version: newVersion,
        status: "ACTIVE",
        biasPlan,
        poiPlan,
        entryPlan,
        exitPlan,
        activatedAt: new Date(),
      }
    })

    return NextResponse.json({ tradingPlan }, { status: 201 })
  } catch (error) {
    console.error("Create trading plan error:", error)
    return NextResponse.json(
      { error: "Failed to create trading plan" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    // Get active trading plan
    const activePlan = await prisma.tradingPlan.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      },
      orderBy: { activatedAt: "desc" }
    })

    if (!activePlan) {
      return NextResponse.json(
        { error: "No active trading plan found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ tradingPlan: activePlan })
  } catch (error) {
    console.error("Get trading plan error:", error)
    return NextResponse.json(
      { error: "Failed to get trading plan" },
      { status: 500 }
    )
  }
}
