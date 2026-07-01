"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { getTransactionHistory } from "@/lib/actions" 
import { DashboardHeader } from "./dashboard-header"
import { StatsCards } from "./stats-cards"
import { CollectionForm } from "./collection-form"
import { ReceiptModal } from "./receipt-modal"
import { VerifyReceipt } from "./verify-receipt"
import { RecentTransactions } from "./recent-transactions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Shield, History } from "lucide-react"

interface CollectorDashboardProps {
  onLogout: () => void
}

export function CollectorDashboard({ onLogout }: CollectorDashboardProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [showReceipt, setShowReceipt] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadTransactions = useCallback(async () => {
    if (user?.id) {
      try {
        const result = await getTransactionHistory(user.id)
        
        if (result && result.success && Array.isArray(result.data)) {
          setTransactions(result.data)
        } else {
          setTransactions([])
        }
      } catch (error) {
        console.error("Failed to load history from database:", error)
        setTransactions([])
      } finally {
        isLoading(false)
      }
    }
  }, [user?.id])

  useEffect(() => {
    loadTransactions()
    const interval = setInterval(loadTransactions, 60000)
    return () => clearInterval(interval)
  }, [loadTransactions])

  const handlePaymentSuccess = (transaction: any) => {
    setShowReceipt(transaction)
    loadTransactions()
  }

  const todayRevenue = (transactions || []).reduce((sum, t) => sum + Number(t.totalAmount || 0), 0)
  const todayCount = (transactions || []).length

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={onLogout} />

      <div className="relative h-32 bg-gradient-to-r from-[var(--kcca-green)] to-[var(--kcca-green)]/80 overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/market.jpg-p48pC1kbaQzMu7vycXk3qYW2Hi2FuU.png"
          alt="Kampala Market"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">Collector Dashboard</h1>
            <p className="text-white/80 text-sm">
              Welcome back, {user?.name}. Ready to collect market dues.
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="-mt-8 relative z-10">
          <StatsCards
            todayRevenue={todayRevenue}
            todayTransactions={todayCount}
          />
        </div>

        <Tabs defaultValue="collect" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted">
            <TabsTrigger value="collect" className="data-[state=active]:bg-[var(--kcca-red)] data-[state=active]:text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Collect</span>
            </TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-[var(--kcca-red)] data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[var(--kcca-red)] data-[state=active]:text-white">
              <History className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collect" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <CollectionForm onSuccess={handlePaymentSuccess} />
              <RecentTransactions transactions={transactions} maxItems={5} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="verify">
            <div className="max-w-lg mx-auto">
              <VerifyReceipt />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <RecentTransactions transactions={transactions} maxItems={100} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>

      <ReceiptModal
        transaction={showReceipt}
        open={!!showReceipt}
        onClose={() => setShowReceipt(null)}
      />
    </div>
  )
}