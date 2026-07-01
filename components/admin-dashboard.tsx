"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { getAllCollections, getDashboardStats, getAdminUsers, createUser, deleteUser } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, LayoutDashboard, Users, DollarSign, Receipt, Plus, Trash2, Download, Calendar } from "lucide-react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

function getTransactionsFromLocalStorage(): any[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem("kcca_transactions")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Failed to parse local transaction variables:", error)
    return []
  }
}

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [collections, setCollections] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ revenue: 0, collections: 0, collectors: 0 })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0]
  })

  const loadData = async () => {
    const localTx = getTransactionsFromLocalStorage()
    const [cRes, sRes, uRes] = await Promise.all([
      getAllCollections(localTx), 
      getDashboardStats(localTx), 
      getAdminUsers()
    ])
    
    setCollections(Array.isArray(cRes) ? cRes : [])
    setStats(sRes || { revenue: 0, collections: 0, collectors: 0 })
    setAdminUsers(Array.isArray(uRes) ? uRes : [])
  }

  useEffect(() => { 
    loadData() 
  }, [])

  useEffect(() => {
    window.addEventListener("storage", loadData)
    window.addEventListener("local-store-update", loadData)
    window.addEventListener("focus", loadData)

    const interval = setInterval(() => {
      loadData()
    }, 1500)

    return () => {
      window.removeEventListener("storage", loadData)
      window.removeEventListener("local-store-update", loadData)
      window.removeEventListener("focus", loadData)
      clearInterval(interval)
    }
  }, [])

  const filteredCollections = collections.filter((c) => {
    if (!c.createdAt) return false
    const itemDateStr = new Date(c.createdAt).toISOString().split("T")[0]
    return itemDateStr === selectedDate
  })

  const generateHourlyGraphData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      label: `${i.toString().padStart(2, "0")}:00`,
      amount: 0,
    }))

    filteredCollections.forEach((c) => {
      const hour = new Date(c.createdAt).getHours()
      const amt = Number(c.amount || c.totalAmount || 0)
      hours[hour].amount += amt
    })

    const maxAmount = Math.max(...hours.map((h) => h.amount), 1)
    return { hours, maxAmount }
  }

  const graphData = generateHourlyGraphData()

  const downloadExcelReport = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const dataSheet = workbook.addWorksheet("Transaction Records")
      
      dataSheet.columns = [
        { header: "Collector Name", key: "collector", width: 25 },
        { header: "Quantity", key: "quantity", width: 12 },
        { header: "Taxed Item / Category", key: "category", width: 25 },
        { header: "Total Amount (UGX)", key: "amount", width: 22 },
        { header: "Date", key: "date", width: 15 },
        { header: "Time", key: "time", width: 15 }
      ]

      // Header row green styling
      dataSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } }
      dataSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0C7240" }
      }

      // Add collection rows safely mapped to the actual items
      filteredCollections.forEach((c) => {
        const dt = new Date(c.createdAt)
        dataSheet.addRow({
          collector: c.collectorName || "System Collector",
          quantity: c.quantity || 1,
          category: c.category || c.categoryId || c.itemName || "Unspecified Item",
          amount: Number(c.amount || c.totalAmount || 0),
          date: dt.toLocaleDateString(),
          time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      })

      // Apply currency formatting to the amount column
      dataSheet.getColumn("amount").numFmt = "#,##0"

      // Write buffer and trigger direct save
      const buffer = await workbook.xlsx.writeBuffer()
      const excelBlob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(excelBlob, `KCCA_Detailed_Report_${selectedDate}.xlsx`)
    } catch (error) {
      console.error("Excel generation failed:", error)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (value.trim()) {
      const generatedEmail = value.toLowerCase().replace(/\s+/g, "") + "@kcca.go.ug"
      setEmail(generatedEmail)
    } else {
      setEmail("")
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createUser({ fullName: name, email, password, role: "collector" })
    setName("")
    setEmail("")
    setPassword("")
    loadData()
  }

  const handleDelete = async (id: string) => {
    await deleteUser(id)
    loadData()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0C7240] text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-full">
              <Image 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kcca-logo.png-UdixvH9lIofr3nKOB7QiZEO1tu6FE0.png" 
                alt="KCCA Logo" 
                width={40} 
                height={40} 
                className="rounded-full" 
              />
            </div>
            <div>
              <h1 className="font-bold text-xl">KCCA Admin Portal</h1>
              <p className="text-xs opacity-90">Authorized Personnel Only</p>
            </div>
          </div>
          <div className="flex items-center gap-6 border-l border-white/20 pl-6">
            <div className="text-right">
              <p className="font-bold">KAGIMUMICHEAL</p>
              <p className="text-xs opacity-90">ADMINISTRATOR</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout}><LogOut /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <StatCard title="TOTAL REVENUE" value={`UGX ${stats.revenue.toLocaleString()}`} icon={<DollarSign />} />
          <StatCard title="ALL COLLECTIONS" value={stats.collections} icon={<Receipt />} />
          <StatCard title="COLLECTORS" value={adminUsers.filter(u => u.role === 'collector').length} icon={<Users />} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Viewing Target Day</p>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="text-sm font-bold text-slate-800 focus:outline-none cursor-pointer border-b border-dashed border-slate-300 hover:border-slate-600"
              />
            </div>
          </div>
          <Button 
            onClick={downloadExcelReport} 
            disabled={filteredCollections.length === 0}
            className="bg-[#0C7240] hover:bg-[#095730] font-medium"
          >
            <Download className="mr-2 h-4 w-4" /> Download Excel Report ({filteredCollections.length})
          </Button>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Daily Collection Velocity</h3>
            <p className="text-xs text-slate-500">Hourly breakdown for {new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>
          <div className="h-32 w-full flex items-end gap-1 pt-6 border-b border-slate-200 relative">
            {graphData.hours.map((h, i) => {
              const heightPercent = `${(h.amount / graphData.maxAmount) * 100}%`
              return (
                <div key={i} className="flex-1 group flex flex-col items-center h-full justify-end relative">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                    UGX {h.amount.toLocaleString()}
                  </div>
                  <div 
                    style={{ height: heightPercent }} 
                    className="w-full bg-[#0C7240]/20 group-hover:bg-[#0C7240]/50 rounded-t transition-all min-h-[2px]"
                  />
                  <div 
                    style={{ bottom: heightPercent }} 
                    className="absolute h-2 w-2 rounded-full bg-[#0C7240] border border-white transform translate-y-1/2 scale-70 group-hover:scale-110 transition-transform"
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 pt-2">
            <span>12:00 AM</span>
            <span>06:00 AM</span>
            <span>12:00 PM</span>
            <span>06:00 PM</span>
            <span>11:00 PM</span>
          </div>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="bg-white p-1 rounded-lg border w-fit">
            <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="management"><Users className="mr-2 h-4 w-4" /> Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="p-0 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 text-left">Receipt Reference</th>
                    <th className="p-4 text-left">Amount Paid</th>
                    <th className="p-4 text-left">Authorized Collector</th>
                    <th className="p-4 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {filteredCollections.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm text-slate-400 font-medium">
                        No transactions found for this calendar day.
                      </td>
                    </tr>
                  ) : (
                    filteredCollections.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono text-sm text-slate-700">{c.receiptId}</td>
                        <td className="p-4 font-bold text-[#0C7240]">UGX {Number(c.amount || c.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-4 text-slate-800 font-medium">{c.collectorName || "System Collector"}</td>
                        <td className="p-4 text-slate-500 text-sm">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="grid grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader><CardTitle className="text-sm">Register Collector</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
                  <Input 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={handleNameChange} 
                    autoComplete="off"
                  />
                  <Input 
                    placeholder="Email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    autoComplete="off"
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    autoComplete="new-password"
                  />
                  <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Collector</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader><CardTitle className="text-sm">Field Staff Directory</CardTitle></CardHeader>
              <CardContent>
                {adminUsers.filter(u => u.role === 'collector').map(u => (
                  <div key={u.id} className="flex justify-between items-center py-2 border-b">
                    <span>{u.fullName}</span>
                    <Button variant="ghost" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card className="p-6 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400">{title}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center">{icon}</div>
    </Card>
  )
}