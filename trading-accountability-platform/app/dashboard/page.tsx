import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatR, formatPercent } from "@/lib/utils"

async function getDashboardData(userId: string) {
  // Get active trading plan
  const activePlan = await prisma.tradingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { activatedAt: "desc" }
  })

  // Get trades statistics
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { entryTime: "desc" },
    take: 100 // Last 100 trades
  })

  const totalTrades = trades.length
  const completedTrades = trades.filter(t => t.exitTime !== null)
  const wins = completedTrades.filter(t => t.isWin === true).length
  const losses = completedTrades.filter(t => t.isWin === false).length
  const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0
  
  const avgR = completedTrades.length > 0
    ? completedTrades.reduce((sum, t) => sum + (t.resultR || 0), 0) / completedTrades.length
    : 0

  const planFollowedTrades = trades.filter(t => t.planFollowed === true).length
  const planFollowRate = totalTrades > 0 ? (planFollowedTrades / totalTrades) * 100 : 0

  // Get recent violations
  const recentViolations = await prisma.ruleViolation.findMany({
    where: {
      trade: { userId }
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      trade: {
        select: {
          symbol: true,
          entryTime: true
        }
      }
    }
  })

  return {
    activePlan,
    stats: {
      totalTrades,
      winRate,
      avgR,
      planFollowRate,
      wins,
      losses,
    },
    recentTrades: trades.slice(0, 5),
    recentViolations,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const data = await getDashboardData(userId)

  // Check if user needs to create a trading plan
  if (!data.activePlan) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome! Let's start with your Trading Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Before you can journal your trades and track accountability, you need to define 
              your trading plan. This is the foundation of everything.
            </p>
            <Link href="/plan/create">
              <Button size="lg">Create Trading Plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.stats.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.stats.wins}W - {data.stats.losses}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg R</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.stats.avgR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatR(data.stats.avgR)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Per trade average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.stats.totalTrades}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Last 100 trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Plan Following</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.stats.planFollowRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {data.stats.planFollowRate.toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Discipline score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No trades yet</p>
                <Link href="/journal/add">
                  <Button className="mt-4">Add Your First Trade</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentTrades.map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(trade.entryTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {trade.resultR && (
                        <p className={`font-semibold ${trade.isWin ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatR(trade.resultR)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/journal">
                  <Button variant="ghost" className="w-full mt-2">View All Trades</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accountability</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentViolations.length === 0 ? (
              <div className="text-center py-8 text-emerald-600">
                <p className="font-semibold">✓ No recent violations</p>
                <p className="text-sm text-gray-600 mt-2">Keep up the great discipline!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentViolations.map((violation) => (
                  <div key={violation.id} className="border-l-4 border-amber-400 pl-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {violation.ruleCategory.toUpperCase()}: {violation.ruleDescription}
                    </p>
                    <p className="text-xs text-gray-500">
                      {violation.trade.symbol} - {new Date(violation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Link href="/accountability">
                  <Button variant="ghost" className="w-full mt-2">View Full Report</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
