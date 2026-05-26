import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatR, formatPercent } from "@/lib/utils"

async function getAnalytics(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { userId, exitTime: { not: null } },
    orderBy: { entryTime: "desc" }
  })

  // Performance by symbol
  const bySymbol: Record<string, { wins: number, losses: number, totalR: number, count: number }> = {}
  trades.forEach(trade => {
    if (!bySymbol[trade.symbol]) {
      bySymbol[trade.symbol] = { wins: 0, losses: 0, totalR: 0, count: 0 }
    }
    bySymbol[trade.symbol].count++
    if (trade.isWin) bySymbol[trade.symbol].wins++
    else bySymbol[trade.symbol].losses++
    bySymbol[trade.symbol].totalR += trade.resultR || 0
  })

  // Performance by session
  const bySession: Record<string, { wins: number, losses: number, totalR: number, count: number }> = {}
  trades.forEach(trade => {
    const session = trade.session || "Unknown"
    if (!bySession[session]) {
      bySession[session] = { wins: 0, losses: 0, totalR: 0, count: 0 }
    }
    bySession[session].count++
    if (trade.isWin) bySession[session].wins++
    else bySession[session].losses++
    bySession[session].totalR += trade.resultR || 0
  })

  // Performance by plan compliance
  const planFollowedTrades = trades.filter(t => t.planFollowed)
  const planNotFollowedTrades = trades.filter(t => !t.planFollowed)

  const planFollowedStats = {
    count: planFollowedTrades.length,
    wins: planFollowedTrades.filter(t => t.isWin).length,
    avgR: planFollowedTrades.length > 0
      ? planFollowedTrades.reduce((sum, t) => sum + (t.resultR || 0), 0) / planFollowedTrades.length
      : 0
  }

  const planNotFollowedStats = {
    count: planNotFollowedTrades.length,
    wins: planNotFollowedTrades.filter(t => t.isWin).length,
    avgR: planNotFollowedTrades.length > 0
      ? planNotFollowedTrades.reduce((sum, t) => sum + (t.resultR || 0), 0) / planNotFollowedTrades.length
      : 0
  }

  // Performance by day of week
  const byDayOfWeek: Record<string, { wins: number, losses: number, totalR: number, count: number }> = {}
  trades.forEach(trade => {
    const day = trade.dayOfWeek || "Unknown"
    if (!byDayOfWeek[day]) {
      byDayOfWeek[day] = { wins: 0, losses: 0, totalR: 0, count: 0 }
    }
    byDayOfWeek[day].count++
    if (trade.isWin) byDayOfWeek[day].wins++
    else byDayOfWeek[day].losses++
    byDayOfWeek[day].totalR += trade.resultR || 0
  })

  return {
    bySymbol,
    bySession,
    byDayOfWeek,
    planFollowedStats,
    planNotFollowedStats,
    totalTrades: trades.length
  }
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const analytics = await getAnalytics(userId)

  if (analytics.totalTrades === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>No Data Yet</CardTitle>
            <CardDescription>
              Add some trades to see your analytics
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-1">Deep dive into your trading performance</p>
      </div>

      {/* Plan Compliance Impact */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Plan Following vs Not Following</CardTitle>
          <CardDescription>The impact of following your trading plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 rounded-lg p-6">
              <h3 className="font-semibold text-emerald-900 mb-4">Plan Followed</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-emerald-700">Trades</div>
                  <div className="text-2xl font-bold text-emerald-900">{analytics.planFollowedStats.count}</div>
                </div>
                <div>
                  <div className="text-sm text-emerald-700">Win Rate</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {analytics.planFollowedStats.count > 0
                      ? `${((analytics.planFollowedStats.wins / analytics.planFollowedStats.count) * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-emerald-700">Avg R</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {formatR(analytics.planFollowedStats.avgR)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-4">Plan Not Followed</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-red-700">Trades</div>
                  <div className="text-2xl font-bold text-red-900">{analytics.planNotFollowedStats.count}</div>
                </div>
                <div>
                  <div className="text-sm text-red-700">Win Rate</div>
                  <div className="text-2xl font-bold text-red-900">
                    {analytics.planNotFollowedStats.count > 0
                      ? `${((analytics.planNotFollowedStats.wins / analytics.planNotFollowedStats.count) * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-red-700">Avg R</div>
                  <div className="text-2xl font-bold text-red-900">
                    {formatR(analytics.planNotFollowedStats.avgR)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {analytics.planFollowedStats.avgR > analytics.planNotFollowedStats.avgR && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <p className="text-blue-900 font-semibold">
                💡 Insight: You perform {formatR(analytics.planFollowedStats.avgR - analytics.planNotFollowedStats.avgR)} better 
                when following your plan!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance by Symbol */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Symbol</CardTitle>
          <CardDescription>Which pairs are working for you?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.bySymbol)
              .sort(([, a], [, b]) => b.totalR - a.totalR)
              .map(([symbol, stats]) => {
                const avgR = stats.totalR / stats.count
                const winRate = (stats.wins / stats.count) * 100
                return (
                  <div key={symbol} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-semibold">{symbol}</div>
                      <div className="text-sm text-gray-600">
                        {stats.count} trades • {stats.wins}W-{stats.losses}L • {winRate.toFixed(1)}% WR
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${avgR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatR(avgR)}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Session */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Session</CardTitle>
          <CardDescription>When do you trade best?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.bySession)
              .filter(([session]) => session !== "Unknown")
              .sort(([, a], [, b]) => b.totalR - a.totalR)
              .map(([session, stats]) => {
                const avgR = stats.totalR / stats.count
                const winRate = (stats.wins / stats.count) * 100
                return (
                  <div key={session} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-semibold">{session}</div>
                      <div className="text-sm text-gray-600">
                        {stats.count} trades • {stats.wins}W-{stats.losses}L • {winRate.toFixed(1)}% WR
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${avgR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatR(avgR)}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Day of Week */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Day</CardTitle>
          <CardDescription>Which days are most profitable?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.byDayOfWeek)
              .filter(([day]) => day !== "Unknown")
              .sort(([, a], [, b]) => b.totalR - a.totalR)
              .map(([day, stats]) => {
                const avgR = stats.totalR / stats.count
                const winRate = (stats.wins / stats.count) * 100
                return (
                  <div key={day} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-semibold">{day}</div>
                      <div className="text-sm text-gray-600">
                        {stats.count} trades • {stats.wins}W-{stats.losses}L • {winRate.toFixed(1)}% WR
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${avgR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatR(avgR)}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
