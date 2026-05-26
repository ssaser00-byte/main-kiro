"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type PlanSection = "bias" | "poi" | "entry" | "exit" | "review"

interface BiasPlan {
  timeframes: string
  bullishRules: string
  bearishRules: string
  noBiasConditions: string
  marketStructureRules: string
}

interface POIPlan {
  validZones: string
  invalidZones: string
  timeframe: string
  liquidityRequirements: string
  filters: string
}

interface EntryPlan {
  confirmations: string
  allowedModels: string
  forbiddenModels: string
  allowedSessions: string
  orderTypes: string
  maxTradesPerDay: string
}

interface ExitPlan {
  stopLossPlacement: string
  takeProfitPlacement: string
  partialRules: string
  breakevenRules: string
  closeRules: string
  noInterventionRules: string
}

export default function CreatePlanPage() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState<PlanSection>("bias")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [biasPlan, setBiasPlan] = useState<BiasPlan>({
    timeframes: "",
    bullishRules: "",
    bearishRules: "",
    noBiasConditions: "",
    marketStructureRules: "",
  })

  const [poiPlan, setPoiPlan] = useState<POIPlan>({
    validZones: "",
    invalidZones: "",
    timeframe: "",
    liquidityRequirements: "",
    filters: "",
  })

  const [entryPlan, setEntryPlan] = useState<EntryPlan>({
    confirmations: "",
    allowedModels: "",
    forbiddenModels: "",
    allowedSessions: "",
    orderTypes: "",
    maxTradesPerDay: "",
  })

  const [exitPlan, setExitPlan] = useState<ExitPlan>({
    stopLossPlacement: "",
    takeProfitPlacement: "",
    partialRules: "",
    breakevenRules: "",
    closeRules: "",
    noInterventionRules: "",
  })

  const sections: PlanSection[] = ["bias", "poi", "entry", "exit", "review"]
  const currentIndex = sections.indexOf(currentSection)

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/trading-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          biasPlan,
          poiPlan,
          entryPlan,
          exitPlan,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create plan")
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {sections.map((section, index) => (
            <div key={section} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  index <= currentIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < sections.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Bias</span>
          <span>POI</span>
          <span>Entry</span>
          <span>Exit</span>
          <span>Review</span>
        </div>
      </div>

      {/* Bias Plan Section */}
      {currentSection === "bias" && (
        <Card>
          <CardHeader>
            <CardTitle>Bias Plan</CardTitle>
            <CardDescription>
              Define how you determine market direction and when to look for trades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Which timeframes do you use for bias analysis?
              </label>
              <Input
                placeholder="e.g., Daily and H4"
                value={biasPlan.timeframes}
                onChange={(e) => setBiasPlan({ ...biasPlan, timeframes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What makes you bullish? (Describe your bullish bias rules)
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Price above daily high, bullish market structure on H4, higher highs and higher lows..."
                value={biasPlan.bullishRules}
                onChange={(e) => setBiasPlan({ ...biasPlan, bullishRules: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What makes you bearish? (Describe your bearish bias rules)
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Price below daily low, bearish market structure on H4, lower highs and lower lows..."
                value={biasPlan.bearishRules}
                onChange={(e) => setBiasPlan({ ...biasPlan, bearishRules: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                When is there NO clear bias? (Conditions to avoid trading)
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Consolidation, choppy market structure, major news upcoming..."
                value={biasPlan.noBiasConditions}
                onChange={(e) => setBiasPlan({ ...biasPlan, noBiasConditions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What market structure rules do you follow?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Only trade with the trend, wait for break of structure..."
                value={biasPlan.marketStructureRules}
                onChange={(e) => setBiasPlan({ ...biasPlan, marketStructureRules: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* POI Plan Section */}
      {currentSection === "poi" && (
        <Card>
          <CardHeader>
            <CardTitle>POI Plan (Points of Interest)</CardTitle>
            <CardDescription>
              Define how you identify and validate your trading zones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Which timeframe do you use for POI identification?
              </label>
              <Input
                placeholder="e.g., H1 or M15"
                value={poiPlan.timeframe}
                onChange={(e) => setPoiPlan({ ...poiPlan, timeframe: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What makes a POI valid? (Valid zone criteria)
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Order block aligned with bias, liquidity swept, imbalance present..."
                value={poiPlan.validZones}
                onChange={(e) => setPoiPlan({ ...poiPlan, validZones: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What makes a POI invalid? (Conditions to avoid)
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Zone already tapped multiple times, too far from current price, no liquidity..."
                value={poiPlan.invalidZones}
                onChange={(e) => setPoiPlan({ ...poiPlan, invalidZones: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What liquidity must be present?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Equal highs/lows swept, stop hunt visible..."
                value={poiPlan.liquidityRequirements}
                onChange={(e) => setPoiPlan({ ...poiPlan, liquidityRequirements: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What filters do you use to avoid bad POIs?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Check for confluence with higher timeframe levels..."
                value={poiPlan.filters}
                onChange={(e) => setPoiPlan({ ...poiPlan, filters: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry Plan Section */}
      {currentSection === "entry" && (
        <Card>
          <CardHeader>
            <CardTitle>Entry Plan</CardTitle>
            <CardDescription>
              Define your exact entry rules and execution criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                What confirmations are REQUIRED before entry?
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Change of character on M5, price rejection from POI, volume confirmation..."
                value={entryPlan.confirmations}
                onChange={(e) => setEntryPlan({ ...entryPlan, confirmations: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Which entry models are ALLOWED?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Breaker blocks, order blocks with confirmation, mitigation..."
                value={entryPlan.allowedModels}
                onChange={(e) => setEntryPlan({ ...entryPlan, allowedModels: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Which entry models are FORBIDDEN?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., FOMO entries, revenge trades, entries without confirmation..."
                value={entryPlan.forbiddenModels}
                onChange={(e) => setEntryPlan({ ...entryPlan, forbiddenModels: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Which sessions/times are you allowed to trade?
              </label>
              <Input
                placeholder="e.g., London Session (8:00-12:00 GMT), New York Open (13:30-16:00 GMT)"
                value={entryPlan.allowedSessions}
                onChange={(e) => setEntryPlan({ ...entryPlan, allowedSessions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What order types can you use?
              </label>
              <Input
                placeholder="e.g., Market orders only, or Limit orders allowed"
                value={entryPlan.orderTypes}
                onChange={(e) => setEntryPlan({ ...entryPlan, orderTypes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maximum trades per day
              </label>
              <Input
                type="number"
                placeholder="e.g., 2"
                value={entryPlan.maxTradesPerDay}
                onChange={(e) => setEntryPlan({ ...entryPlan, maxTradesPerDay: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exit Plan Section */}
      {currentSection === "exit" && (
        <Card>
          <CardHeader>
            <CardTitle>Exit Plan</CardTitle>
            <CardDescription>
              Define how you manage and exit your trades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Where do you place your stop loss?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Below/above the POI, behind liquidity level, 1:1.5 minimum RR..."
                value={exitPlan.stopLossPlacement}
                onChange={(e) => setExitPlan({ ...exitPlan, stopLossPlacement: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Where do you place your take profit?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Next major liquidity level, 2:1 RR minimum, daily high/low..."
                value={exitPlan.takeProfitPlacement}
                onChange={(e) => setExitPlan({ ...exitPlan, takeProfitPlacement: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                When can you take partials?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., At 1:1 RR, take 50% off. Let rest run to target..."
                value={exitPlan.partialRules}
                onChange={(e) => setExitPlan({ ...exitPlan, partialRules: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                When can you move to breakeven?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., After 1:1 is hit and structure breaks in my favor..."
                value={exitPlan.breakevenRules}
                onChange={(e) => setExitPlan({ ...exitPlan, breakevenRules: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                When MUST you close the trade early?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., When bias invalidates, major news approaching, market close..."
                value={exitPlan.closeRules}
                onChange={(e) => setExitPlan({ ...exitPlan, closeRules: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                When should you NOT intervene with the trade?
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="e.g., Let the trade play out, don't close early due to fear..."
                value={exitPlan.noInterventionRules}
                onChange={(e) => setExitPlan({ ...exitPlan, noInterventionRules: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Section */}
      {currentSection === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Trading Plan</CardTitle>
            <CardDescription>
              Review everything before activating your plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Bias Plan</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Timeframes:</strong> {biasPlan.timeframes || "Not set"}</p>
                <p><strong>Bullish Rules:</strong> {biasPlan.bullishRules ? "✓ Defined" : "❌ Not set"}</p>
                <p><strong>Bearish Rules:</strong> {biasPlan.bearishRules ? "✓ Defined" : "❌ Not set"}</p>
              </div>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4 py-2 bg-emerald-50 rounded">
              <h4 className="font-semibold text-emerald-900 mb-2">🎯 POI Plan</h4>
              <div className="text-sm text-emerald-800 space-y-1">
                <p><strong>Timeframe:</strong> {poiPlan.timeframe || "Not set"}</p>
                <p><strong>Valid Zones:</strong> {poiPlan.validZones ? "✓ Defined" : "❌ Not set"}</p>
                <p><strong>Invalid Zones:</strong> {poiPlan.invalidZones ? "✓ Defined" : "❌ Not set"}</p>
              </div>
            </div>

            <div className="border-l-4 border-purple-600 pl-4 py-2 bg-purple-50 rounded">
              <h4 className="font-semibold text-purple-900 mb-2">🚀 Entry Plan</h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p><strong>Confirmations:</strong> {entryPlan.confirmations ? "✓ Defined" : "❌ Not set"}</p>
                <p><strong>Allowed Sessions:</strong> {entryPlan.allowedSessions || "Not set"}</p>
                <p><strong>Max Trades/Day:</strong> {entryPlan.maxTradesPerDay || "Not set"}</p>
              </div>
            </div>

            <div className="border-l-4 border-amber-600 pl-4 py-2 bg-amber-50 rounded">
              <h4 className="font-semibold text-amber-900 mb-2">🎯 Exit Plan</h4>
              <div className="text-sm text-amber-800 space-y-1">
                <p><strong>Stop Loss:</strong> {exitPlan.stopLossPlacement ? "✓ Defined" : "❌ Not set"}</p>
                <p><strong>Take Profit:</strong> {exitPlan.takeProfitPlacement ? "✓ Defined" : "❌ Not set"}</p>
                <p><strong>Partials:</strong> {exitPlan.partialRules ? "✓ Defined" : "❌ Not set"}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Once you activate this plan, it will become your active trading plan. 
                You can update it later, but all future trades will be evaluated against this plan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {currentIndex < sections.length - 1 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating Plan..." : "Activate Plan"}
          </Button>
        )}
      </div>
    </div>
  )
}
