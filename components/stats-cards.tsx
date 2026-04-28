"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Banknote, Receipt, TrendingUp, Clock } from "lucide-react"

interface StatsCardsProps {
  todayRevenue: number
  todayTransactions: number
  weeklyRevenue?: number
}

export function StatsCards({ todayRevenue, todayTransactions, weeklyRevenue = 0 }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      title: "Today&apos;s Revenue",
      value: formatCurrency(todayRevenue),
      icon: Banknote,
      color: "var(--kcca-green)",
      bgColor: "var(--kcca-green)",
    },
    {
      title: "Transactions Today",
      value: todayTransactions.toString(),
      icon: Receipt,
      color: "var(--kcca-red)",
      bgColor: "var(--kcca-red)",
    },
    {
      title: "Weekly Total",
      value: formatCurrency(weeklyRevenue),
      icon: TrendingUp,
      color: "var(--kcca-yellow)",
      bgColor: "var(--kcca-yellow)",
    },
    {
      title: "Current Time",
      value: new Date().toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit" }),
      icon: Clock,
      color: "#666",
      bgColor: "#666",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.title.replace("&apos;", "'")}
                </p>
                <p className="text-lg font-bold text-foreground mt-1 truncate">{stat.value}</p>
              </div>
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${stat.bgColor}15` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
