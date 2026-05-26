import { prisma } from "./prisma"

interface Trade {
  id: string
  symbol: string
  entryTime: Date
  session: string | null
  setupType: string | null
  entryModel: string | null
  planFollowed: boolean | null
}

interface TradingPlan {
  biasPlan: any
  poiPlan: any
  entryPlan: any
  exitPlan: any
}

interface Violation {
  ruleCategory: string
  ruleDescription: string
  severity: "MINOR" | "MAJOR" | "CRITICAL"
  impactAnalysis: string
}

export async function checkPlanCompliance(
  trade: Trade,
  plan: TradingPlan
): Promise<Violation[]> {
  const violations: Violation[] = []

  // Parse plan data
  const entryPlan = plan.entryPlan as any
  const exitPlan = plan.exitPlan as any

  // Check max trades per day
  if (entryPlan.maxTradesPerDay) {
    const maxTrades = parseInt(entryPlan.maxTradesPerDay)
    if (!isNaN(maxTrades)) {
      // Count trades on same day
      const startOfDay = new Date(trade.entryTime)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(trade.entryTime)
      endOfDay.setHours(23, 59, 59, 999)

      const tradesThisDay = await prisma.trade.count({
        where: {
          userId: (await prisma.trade.findUnique({ where: { id: trade.id } }))!.userId,
          entryTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      if (tradesThisDay > maxTrades) {
        violations.push({
          ruleCategory: "entry",
          ruleDescription: `Exceeded max trades per day (${maxTrades})`,
          severity: "MAJOR",
          impactAnalysis: `Took ${tradesThisDay} trades when only ${maxTrades} allowed`
        })
      }
    }
  }

  // Check allowed sessions
  if (entryPlan.allowedSessions && trade.session) {
    const allowedSessions = entryPlan.allowedSessions.toLowerCase()
    const tradeSession = trade.session.toLowerCase()
    
    if (!allowedSessions.includes(tradeSession)) {
      violations.push({
        ruleCategory: "entry",
        ruleDescription: `Traded outside allowed sessions`,
        severity: "MAJOR",
        impactAnalysis: `Traded during ${trade.session} session which is not in your plan`
      })
    }
  }

  // Check forbidden entry models
  if (entryPlan.forbiddenModels && trade.entryModel) {
    const forbiddenModels = entryPlan.forbiddenModels.toLowerCase()
    const tradeModel = trade.entryModel.toLowerCase()
    
    if (forbiddenModels.includes(tradeModel)) {
      violations.push({
        ruleCategory: "entry",
        ruleDescription: `Used forbidden entry model`,
        severity: "CRITICAL",
        impactAnalysis: `Used ${trade.entryModel} which is forbidden in your plan`
      })
    }
  }

  // If trader marked planFollowed as false, add a general violation
  if (trade.planFollowed === false) {
    violations.push({
      ruleCategory: "general",
      ruleDescription: "Trader acknowledged not following plan",
      severity: "MAJOR",
      impactAnalysis: "Self-reported plan violation"
    })
  }

  return violations
}

export async function autoCheckTradeCompliance(tradeId: string) {
  // Get trade with plan
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      tradingPlan: true
    }
  })

  if (!trade || !trade.tradingPlan) {
    return
  }

  // Check compliance
  const violations = await checkPlanCompliance(trade, trade.tradingPlan)

  // Save violations
  for (const violation of violations) {
    await prisma.ruleViolation.create({
      data: {
        tradeId: trade.id,
        ruleCategory: violation.ruleCategory,
        ruleDescription: violation.ruleDescription,
        severity: violation.severity,
        impactAnalysis: violation.impactAnalysis
      }
    })
  }

  // Update trade planFollowed status
  if (violations.length > 0 && trade.planFollowed !== false) {
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        planFollowed: false,
        violationsJson: violations
      }
    })
  }

  return violations
}
