import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatR, formatCurrency } from "@/lib/utils"

async function getTrades(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { entryTime: "desc" },
    include: {
      violations: true
    }
  })

  return trades
}

export default async function JournalPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const trades = await getTrades(userId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trade Journal</h1>
          <p className="text-gray-600 mt-1">
            {trades.length} total trades
          </p>
        </div>
        <Link href="/journal/add">
          <Button>Add Trade</Button>
        </Link>
      </div>

      {trades.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trades yet</h3>
            <p className="text-gray-600 mb-6">Start journaling your trades to track your progress</p>
            <Link href="/journal/add">
              <Button>Add Your First Trade</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Session</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Setup</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Entry</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Exit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">R</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Result</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(trade.entryTime).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(trade.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                      <td className="py-3 px-4 text-sm">
                        {trade.session ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {trade.session}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {trade.setupType || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-mono">
                        {trade.entryPrice.toFixed(5)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-mono">
                        {trade.exitPrice ? trade.exitPrice.toFixed(5) : (
                          <span className="text-gray-400">Open</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {trade.resultR ? (
                          <span className={trade.resultR >= 0 ? "text-emerald-600" : "text-red-600"}>
                            {formatR(trade.resultR)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {trade.resultAmount ? (
                          <span className={trade.resultAmount >= 0 ? "text-emerald-600" : "text-red-600"}>
                            {formatCurrency(trade.resultAmount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {trade.planFollowed ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full text-xs font-semibold">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                            ✗
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {trades.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">This Month</div>
              <div className="text-2xl font-bold">
                {trades.filter(t => {
                  const tradeDate = new Date(t.entryTime)
                  const now = new Date()
                  return tradeDate.getMonth() === now.getMonth() && 
                         tradeDate.getFullYear() === now.getFullYear()
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Win Rate</div>
              <div className="text-2xl font-bold">
                {(() => {
                  const completed = trades.filter(t => t.isWin !== null)
                  const wins = completed.filter(t => t.isWin === true).length
                  return completed.length > 0 ? `${((wins / completed.length) * 100).toFixed(1)}%` : "0%"
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Avg R</div>
              <div className="text-2xl font-bold">
                {(() => {
                  const completed = trades.filter(t => t.resultR !== null)
                  const avgR = completed.length > 0
                    ? completed.reduce((sum, t) => sum + (t.resultR || 0), 0) / completed.length
                    : 0
                  return formatR(avgR)
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Plan Following</div>
              <div className="text-2xl font-bold">
                {(() => {
                  const planFollowed = trades.filter(t => t.planFollowed === true).length
                  return `${((planFollowed / trades.length) * 100).toFixed(0)}%`
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
