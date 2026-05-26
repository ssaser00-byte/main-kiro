import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDuration } from "@/lib/utils"
import { autoCheckTradeCompliance } from "@/lib/plan-compliance"

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

    // Get active trading plan
    const activePlan = await prisma.tradingPlan.findFirst({
      where: { userId, status: "ACTIVE" }
    })

    if (!activePlan) {
      return NextResponse.json(
        { error: "No active trading plan found. Create a plan first." },
        { status: 400 }
      )
    }

    // Calculate duration if both times provided
    let durationMinutes = null
    if (body.entryTime && body.exitTime) {
      durationMinutes = calculateDuration(
        new Date(body.entryTime),
        new Date(body.exitTime)
      )
    }

    // Get day of week
    const entryDate = new Date(body.entryTime)
    const dayOfWeek = entryDate.toLocaleDateString('en-US', { weekday: 'long' })

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        userId,
        tradingPlanId: activePlan.id,
        symbol: body.symbol,
        entryPrice: body.entryPrice,
        exitPrice: body.exitPrice,
        stopLoss: body.stopLoss,
        takeProfit: body.takeProfit,
        lotSize: body.lotSize,
        riskPercent: body.riskPercent,
        riskAmount: body.riskAmount,
        entryTime: body.entryTime,
        exitTime: body.exitTime,
        durationMinutes,
        session: body.session,
        setupType: body.setupType,
        entryModel: body.entryModel,
        dayOfWeek,
        resultAmount: body.resultAmount,
        resultPercent: body.resultPercent,
        resultR: body.resultR,
        isWin: body.isWin,
        traderNotes: body.traderNotes,
        planFollowed: body.planFollowed,
      }
    })

    // Auto-check plan compliance
    await autoCheckTradeCompliance(trade.id)

    return NextResponse.json({ trade }, { status: 201 })
  } catch (error) {
    console.error("Create trade error:", error)
    return NextResponse.json(
      { error: "Failed to create trade" },
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

    // Get all trades for the user
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { entryTime: "desc" },
      include: {
        violations: true
      }
    })

    return NextResponse.json({ trades })
  } catch (error) {
    console.error("Get trades error:", error)
    return NextResponse.json(
      { error: "Failed to get trades" },
      { status: 500 }
    )
  }
}
