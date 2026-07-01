"use client"

import { useEffect, useState } from "react"
import { type Transaction, getTransactions } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Receipt } from "lucide-react"

interface RecentTransactionsProps {
  transactions?: Transaction[]
  maxItems?: number
}

export function RecentTransactions({ transactions: propTransactions, maxItems = 100 }: RecentTransactionsProps) {
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const freshData = getTransactions()
    setLocalTransactions(freshData)
  }, [propTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-UG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "00:00"
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "mobile_money":
        return (
          <Badge variant="outline" className="bg-[var(--kcca-yellow)]/10 text-[#B8860B] border-[var(--kcca-yellow)]/30 text-xs">
            Mobile
          </Badge>
        )
      case "bank":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
            Bank
          </Badge>
        )
      case "pay_code":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">
            Code
          </Badge>
        )
      default:
        return null
    }
  }

  // 1. Slice raw items first
  const recentItems = localTransactions.slice(0, maxItems)

  // 2. Group items into an object key-mapped by Month & Year
  const groupedTransactions: { [key: string]: Transaction[] } = {}

  recentItems.forEach((transaction) => {
    const dateValue = transaction.createdAt || transaction.timestamp
    let monthLabel = "Unknown Period"
    
    if (dateValue) {
      try {
        monthLabel = new Date(dateValue).toLocaleDateString("en-UG", {
          month: "long",
          year: "numeric",
        })
      } catch (e) {
        monthLabel = "Unknown Period"
      }
    }

    if (!groupedTransactions[monthLabel]) {
      groupedTransactions[monthLabel] = []
    }
    groupedTransactions[monthLabel].push(transaction)
  })

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">Latest {maxItems} collections categorized by month</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet today</p>
            <p className="text-xs text-muted-foreground">Start collecting market dues</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y divide-border">
              {Object.keys(groupedTransactions).map((monthName) => (
                <div key={monthName} className="relative">
                  {/* Month Section Header */}
                  <div className="sticky top-0 bg-muted/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-muted-foreground border-y border-border tracking-wider uppercase z-10">
                    {monthName}
                  </div>

                  {/* Month's Transactions */}
                  <div className="divide-y divide-border">
                    {groupedTransactions[monthName].map((transaction) => {
                      const rawAmount = (transaction as any).amount ?? (transaction as any).totalAmount ?? 0
                      const safeAmount = Number(rawAmount) || 0

                      return (
                        <div
                          key={transaction.id || Math.random().toString()}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors bg-background"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">
                                {transaction.categoryName || "Market Fees"}
                              </p>
                              {getPaymentMethodBadge(transaction.paymentMethod)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground font-mono">
                                {transaction.receiptId}
                              </p>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(transaction.createdAt || transaction.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="font-semibold text-[var(--kcca-green)]">
                              {formatCurrency(safeAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {transaction.quantity}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
