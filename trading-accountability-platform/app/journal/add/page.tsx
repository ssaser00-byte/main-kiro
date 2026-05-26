"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddTradePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    symbol: "",
    entryPrice: "",
    exitPrice: "",
    stopLoss: "",
    takeProfit: "",
    lotSize: "",
    riskPercent: "",
    riskAmount: "",
    entryTime: "",
    exitTime: "",
    session: "",
    setupType: "",
    entryModel: "",
    resultAmount: "",
    traderNotes: "",
    planFollowed: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Calculate results
      const entry = parseFloat(formData.entryPrice)
      const exit = formData.exitPrice ? parseFloat(formData.exitPrice) : null
      const sl = formData.stopLoss ? parseFloat(formData.stopLoss) : null
      const lots = parseFloat(formData.lotSize)

      let isWin = null
      let resultR = null
      let resultPercent = null

      if (exit && sl) {
        const direction = entry < exit ? "long" : "short"
        isWin = direction === "long" ? exit > entry : exit < entry
        
        // Calculate R (assuming standard pip calculation)
        const pipDiff = direction === "long" ? (exit - entry) : (entry - exit)
        const riskPips = direction === "long" ? (entry - sl) : (sl - entry)
        
        if (riskPips !== 0) {
          resultR = pipDiff / riskPips
        }

        // Calculate percentage if risk percent is provided
        if (formData.riskPercent) {
          const riskPct = parseFloat(formData.riskPercent)
          resultPercent = resultR ? resultR * riskPct : null
        }
      }

      const tradeData = {
        symbol: formData.symbol,
        entryPrice: entry,
        exitPrice: exit,
        stopLoss: sl,
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
        lotSize: lots,
        riskPercent: formData.riskPercent ? parseFloat(formData.riskPercent) : null,
        riskAmount: formData.riskAmount ? parseFloat(formData.riskAmount) : null,
        entryTime: new Date(formData.entryTime),
        exitTime: formData.exitTime ? new Date(formData.exitTime) : null,
        session: formData.session || null,
        setupType: formData.setupType || null,
        entryModel: formData.entryModel || null,
        resultAmount: formData.resultAmount ? parseFloat(formData.resultAmount) : null,
        resultR,
        resultPercent,
        isWin,
        traderNotes: formData.traderNotes || null,
        planFollowed: formData.planFollowed,
      }

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add trade")
      }

      router.push("/journal")
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Trade</h1>
        <p className="text-gray-600 mt-1">Journal your trade manually</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
            <CardDescription>Enter all information about your trade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Trade Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbol *</label>
                <Input
                  placeholder="EUR/USD"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lot Size *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.10"
                  value={formData.lotSize}
                  onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Prices */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Price *</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="1.08500"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Exit Price</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="1.09000"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stop Loss</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="1.08000"
                  value={formData.stopLoss}
                  onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Take Profit</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="1.10000"
                  value={formData.takeProfit}
                  onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                />
              </div>
            </div>

            {/* Risk Management */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Percent</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  value={formData.riskPercent}
                  onChange={(e) => setFormData({ ...formData, riskPercent: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Amount (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  value={formData.riskAmount}
                  onChange={(e) => setFormData({ ...formData, riskAmount: e.target.value })}
                />
              </div>
            </div>

            {/* Timing */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Time *</label>
                <Input
                  type="datetime-local"
                  value={formData.entryTime}
                  onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Exit Time</label>
                <Input
                  type="datetime-local"
                  value={formData.exitTime}
                  onChange={(e) => setFormData({ ...formData, exitTime: e.target.value })}
                />
              </div>
            </div>

            {/* Trading Context */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Session</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                >
                  <option value="">Select session</option>
                  <option value="Asian">Asian</option>
                  <option value="London">London</option>
                  <option value="New York">New York</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Setup Type</label>
                <Input
                  placeholder="A+, B, C"
                  value={formData.setupType}
                  onChange={(e) => setFormData({ ...formData, setupType: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Model</label>
                <Input
                  placeholder="Order Block, Breaker"
                  value={formData.entryModel}
                  onChange={(e) => setFormData({ ...formData, entryModel: e.target.value })}
                />
              </div>
            </div>

            {/* Result */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Result Amount (€)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="125.50"
                value={formData.resultAmount}
                onChange={(e) => setFormData({ ...formData, resultAmount: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Positive for profit, negative for loss
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trade Notes</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="What happened during this trade? What did you observe? Any emotions?"
                value={formData.traderNotes}
                onChange={(e) => setFormData({ ...formData, traderNotes: e.target.value })}
              />
            </div>

            {/* Plan Compliance */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.planFollowed}
                  onChange={(e) => setFormData({ ...formData, planFollowed: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">I followed my trading plan</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Be honest. This will help you track your discipline.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/journal")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Trade..." : "Add Trade"}
          </Button>
        </div>
      </form>
    </div>
  )
}
