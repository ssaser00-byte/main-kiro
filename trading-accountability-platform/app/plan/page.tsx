import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function getTradingPlan(userId: string) {
  const activePlan = await prisma.tradingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { activatedAt: "desc" }
  })

  return activePlan
}

export default async function TradingPlanPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const plan = await getTradingPlan(userId)

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <CardTitle>No Active Trading Plan</CardTitle>
            <CardDescription>
              You need to create a trading plan before you can start journaling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/plan/create">
              <Button size="lg">Create Trading Plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const biasPlan = plan.biasPlan as any
  const poiPlan = plan.poiPlan as any
  const entryPlan = plan.entryPlan as any
  const exitPlan = plan.exitPlan as any

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Trading Plan</h1>
          <p className="text-gray-600 mt-1">
            Version {plan.version} • Activated {new Date(plan.activatedAt!).toLocaleDateString()}
          </p>
        </div>
        <Link href="/plan/create">
          <Button variant="outline">Update Plan</Button>
        </Link>
      </div>

      {/* Bias Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span> Bias Plan
          </CardTitle>
          <CardDescription>How you determine market direction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Timeframes</h4>
            <p className="text-gray-900">{biasPlan.timeframes || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Bullish Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{biasPlan.bullishRules || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Bearish Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{biasPlan.bearishRules || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">No Bias Conditions</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{biasPlan.noBiasConditions || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Market Structure Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{biasPlan.marketStructureRules || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      {/* POI Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span> POI Plan
          </CardTitle>
          <CardDescription>How you identify Points of Interest</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Timeframe</h4>
            <p className="text-gray-900">{poiPlan.timeframe || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Valid Zones</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{poiPlan.validZones || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Invalid Zones</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{poiPlan.invalidZones || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Liquidity Requirements</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{poiPlan.liquidityRequirements || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Filters</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{poiPlan.filters || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Entry Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚀</span> Entry Plan
          </CardTitle>
          <CardDescription>Your exact entry criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Required Confirmations</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{entryPlan.confirmations || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Allowed Entry Models</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{entryPlan.allowedModels || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Forbidden Entry Models</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{entryPlan.forbiddenModels || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Allowed Sessions</h4>
            <p className="text-gray-900">{entryPlan.allowedSessions || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Order Types</h4>
            <p className="text-gray-900">{entryPlan.orderTypes || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Max Trades Per Day</h4>
            <p className="text-gray-900">{entryPlan.maxTradesPerDay || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Exit Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span> Exit Plan
          </CardTitle>
          <CardDescription>How you manage and exit trades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Stop Loss Placement</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{exitPlan.stopLossPlacement || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Take Profit Placement</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{exitPlan.takeProfitPlacement || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Partial Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{exitPlan.partialRules || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Breakeven Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{exitPlan.breakevenRules || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Close Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{exitPlan.closeRules || "Not set"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">No Intervention Rules</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{exitPlan.noInterventionRules || "Not set"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
