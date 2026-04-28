"use client"

import { type Transaction } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Receipt } from "lucide-react"

interface RecentTransactionsProps {
  transactions: Transaction[]
  maxItems?: number
}

export function RecentTransactions({ transactions, maxItems = 5 }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-UG", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const recentItems = transactions.slice(-maxItems).reverse()

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">Latest {maxItems} collections</p>
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
          <ScrollArea className="max-h-[300px]">
            <div className="divide-y divide-border">
              {recentItems.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {transaction.categoryName}
                      </p>
                      {getPaymentMethodBadge(transaction.paymentMethod)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono">
                        {transaction.receiptId}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold text-[var(--kcca-green)]">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Qty: {transaction.quantity}</p>
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
