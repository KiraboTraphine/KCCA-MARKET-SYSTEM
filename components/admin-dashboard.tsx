"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { getAllTransactions } from "@/lib/actions" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import * as XLSX from "xlsx"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { 
  LogOut, 
  TrendingUp, 
  Users, 
  Receipt, 
  DollarSign,
  Search,
  Download,
  Bell
} from "lucide-react"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const loadTransactions = useCallback(async () => {
    try {
      const allTransactions = await getAllTransactions()
      setTransactions(allTransactions)
    } catch (error) {
      console.error("Admin fetch error:", error)
    }
  }, [])

  useEffect(() => {
    loadTransactions()
    const interval = setInterval(loadTransactions, 15000)
    return () => clearInterval(interval)
  }, [loadTransactions])

  const todayTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt || t.timestamp).toISOString().split('T')[0]
      return transactionDate === selectedDate
    })
  }, [transactions, selectedDate])

  // --- EXPORT LOGIC ---
  const handleExport = () => {
    const reportData = todayTransactions.map(t => ({
      "Date & Time": new Date(t.createdAt || t.timestamp).toLocaleString("en-UG"),
      "Vendor Name": t.vendorName,
      "Category": t.categoryName || t.category,
      "Amount (UGX)": t.amount,
      "Payment Method": t.paymentMethod,
      "Reference": t.paymentReference,
      "Collector": t.collectorName
    }))

    const worksheet = XLSX.utils.json_to_sheet(reportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "KCCA Collections")
    XLSX.writeFile(workbook, `KCCA_Report_${selectedDate}.xlsx`)
  }

  // --- CHART LOGIC ---
  const chartData = useMemo(() => {
    const hourlyData: { [key: string]: number } = {}
    todayTransactions.forEach(t => {
      const hour = new Date(t.createdAt || t.timestamp).toLocaleTimeString("en-UG", {
        hour: "2-digit",
        hour12: true,
      })
      hourlyData[hour] = (hourlyData[hour] || 0) + t.amount
    })
    return Object.keys(hourlyData).map(hour => ({
      time: hour,
      amount: hourlyData[hour]
    }))
  }, [todayTransactions])

  const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0)
  const uniqueCollectors = new Set(todayTransactions.map(t => t.collectorId)).size
  const uniqueVendors = new Set(todayTransactions.map(t => t.vendorName)).size

  const filteredTransactions = todayTransactions.filter(t =>
    t.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.collectorName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-[var(--kcca-green)] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kcca-logo.png-UdixvH9lIofr3nKOB7QiZEO1tu6FE0.png"
                  alt="KCCA Logo"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold">KCCA Admin Portal</h1>
                <p className="text-xs text-white/70">Market Dues Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-white/70">Administrator</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onLogout}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative h-48 bg-gradient-to-r from-[var(--kcca-green)] via-[var(--kcca-green)]/90 to-[var(--kcca-red)]/80 overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/market.jpg-p48pC1kbaQzMu7vycXk3qYW2Hi2FuU.png"
          alt="Kampala Market"
          fill
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
            <p className="text-white/80">Monitor collections and view real-time reports</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="-mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card shadow-lg border-l-4 border-l-[var(--kcca-green)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">UGX {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[var(--kcca-green)]/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-[var(--kcca-green)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg border-l-4 border-l-[var(--kcca-red)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold text-foreground">{todayTransactions.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[var(--kcca-red)]/10 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-[var(--kcca-red)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg border-l-4 border-l-[var(--kcca-yellow)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Collectors</p>
                    <p className="text-2xl font-bold text-foreground">{uniqueCollectors}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[var(--kcca-yellow)]/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[var(--kcca-yellow)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card shadow-lg border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vendors Served</p>
                    <p className="text-2xl font-bold text-foreground">{uniqueVendors}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* REVENUE LINE GRAPH */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--kcca-green)]" />
              Revenue Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Shs ${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => [`UGX ${val.toLocaleString()}`, "Revenue"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="var(--kcca-green)" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "var(--kcca-green)" }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Export */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    placeholder="Search vendor or collector..."
                  />
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleExport} variant="outline" className="border-[var(--kcca-green)] text-[var(--kcca-green)] hover:bg-[var(--kcca-green)]/10">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[var(--kcca-green)]" />
              Live Collection Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Collector</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No transactions synced from database yet.</td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{t.vendorName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.categoryName || t.category}</td>
                        <td className="px-4 py-3 font-semibold">UGX {t.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{t.collectorName}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="capitalize">
                            {t.paymentMethod.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(t.createdAt || t.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}