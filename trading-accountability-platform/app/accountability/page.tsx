import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

async function getAccountabilityData(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { entryTime: "desc" },
    include: {
      violations: true
    }
  })

  const violations = await prisma.ruleViolation.findMany({
    where: {
      trade: { userId }
    },
    include: {
      trade: {
        select: {
          symbol: true,
          entryTime: true,
          resultR: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const totalTrades = trades.length
  const planFollowedCount = trades.filter(t => t.planFollowed).length
  const disciplineScore = totalTrades > 0 ? (planFollowedCount / totalTrades) * 100 : 100

  // Violations by category
  const violationsByCategory: Record<string, number> = {}
  violations.forEach(v => {
    violationsByCategory[v.ruleCategory] = (violationsByCategory[v.ruleCategory] || 0) + 1
  })

  return {
    trades,
    violations,
    disciplineScore,
    totalTrades,
    planFollowedCount,
    violationsByCategory,
  }
}

export default async function AccountabilityPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userId = (session.user as any).id
  const data = await getAccountabilityData(userId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Accountability</h1>
        <p className="text-gray-600 mt-1">Track your discipline and rule violations</p>
      </div>

      {/* Discipline Score */}
      <Card>
        <CardHeader>
          <CardTitle>Discipline Score</CardTitle>
          <CardDescription>How consistently are you following your plan?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={data.disciplineScore >= 80 ? "#10b981" : data.disciplineScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.disciplineScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{data.disciplineScore.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">/ 100</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Total Trades</div>
                  <div className="text-2xl font-bold">{data.totalTrades}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Plan Followed</div>
                  <div className="text-2xl font-bold text-emerald-600">{data.planFollowedCount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Plan Violated</div>
                  <div className="text-2xl font-bold text-red-600">{data.totalTrades - data.planFollowedCount}</div>
                </div>
              </div>
            </div>
          </div>

          {data.disciplineScore >= 80 && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
              <p className="text-emerald-900 font-semibold">
                ✅ Excellent discipline! Keep following your plan.
              </p>
            </div>
          )}

          {data.disciplineScore >= 60 && data.disciplineScore < 80 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
              <p className="text-amber-900 font-semibold">
                ⚠️ Your discipline needs improvement. Review your violations below.
              </p>
            </div>
          )}

          {data.disciplineScore < 60 && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
              <p className="text-red-900 font-semibold">
                🛑 Serious discipline issues. Consider reviewing your trading plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violations by Category */}
      {Object.keys(data.violationsByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Common Violations</CardTitle>
            <CardDescription>Which rules are you breaking most often?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.violationsByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-semibold capitalize">{category} Rules</div>
                      <div className="text-sm text-gray-600">{count} violations</div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{count}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>Your latest rule breaks</CardDescription>
        </CardHeader>
        <CardContent>
          {data.violations.length === 0 ? (
            <div className="text-center py-8 text-emerald-600">
              <p className="font-semibold">✓ No violations recorded</p>
              <p className="text-sm text-gray-600 mt-2">Perfect discipline!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.violations.slice(0, 10).map((violation) => (
                <div key={violation.id} className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-red-900">
                        {violation.ruleCategory.toUpperCase()}: {violation.ruleDescription}
                      </div>
                      <div className="text-sm text-red-700 mt-1">
                        {violation.trade.symbol} • {new Date(violation.createdAt).toLocaleDateString()}
                      </div>
                      {violation.impactAnalysis && (
                        <div className="text-sm text-gray-600 mt-2">
                          Impact: {violation.impactAnalysis}
                        </div>
                      )}
                    </div>
                    <div className={`ml-4 px-3 py-1 rounded text-xs font-semibold ${
                      violation.severity === "CRITICAL" ? "bg-red-600 text-white" :
                      violation.severity === "MAJOR" ? "bg-amber-600 text-white" :
                      "bg-gray-600 text-white"
                    }`}>
                      {violation.severity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {data.disciplineScore < 80 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Improvement Suggestions</CardTitle>
            <CardDescription>How to improve your discipline</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-gray-700">
              <li>Review your trading plan before each session</li>
              <li>Use a pre-trade checklist to verify all rules</li>
              <li>Take a break after violating rules twice in one day</li>
              <li>Journal why you broke each rule to identify patterns</li>
              <li>Consider simplifying your plan if it's too complex</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
