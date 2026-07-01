"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
// Added getAdminUsers and deleteUser to the imports
import { createUser, getAdminUsers, deleteUser } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  LogOut, 
  Lock,
  Trash2,
  RefreshCw
} from "lucide-react"

interface MasterDashboardProps {
  onLogout: () => void
}

export function MasterAdminDashboard({ onLogout }: MasterDashboardProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [admins, setAdmins] = useState<any[]>([]) // State for the admin list
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true)
  const [newUser, setNewUser] = useState({ 
    fullName: "", 
    email: "", 
    password: "" 
  })

  // 1. Fetch the admin list on mount
  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    setIsLoadingAdmins(true)
    const result = await getAdminUsers()
    if (result.success) {
      setAdmins(result.data)
    }
    setIsLoadingAdmins(false)
  }

  // 2. Handle Deleting/Revoking an Admin
  const handleDelete = async (adminId: number, name: string) => {
    if (confirm(`Are you sure you want to revoke administrator access for ${name}?`)) {
      const result = await deleteUser(adminId)
      if (result.success) {
        loadAdmins() // Refresh the list
      } else {
        alert("Failed to delete user.")
      }
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await createUser({ 
        ...newUser, 
        role: "admin" 
      })

      if (result.success) {
        alert("Success: Administrator privileges granted to " + newUser.fullName)
        setNewUser({ fullName: "", email: "", password: "" })
        loadAdmins() // Refresh the list to show the new admin
      } else {
        alert(result.error || "Failed to create administrator.")
      }
    } catch (err) {
      alert("System Error: Could not reach the database.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050a15] text-slate-200 font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-[#0a1120] p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <ShieldCheck className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-wider text-white">KCCA MASTER CONSOLE</h1>
              <p className="text-[10px] text-red-500 font-mono uppercase tracking-[0.2em]">Level 3 Authority</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button 
              onClick={onLogout} 
              className="flex items-center px-4 py-2 border border-slate-700 rounded-md hover:bg-red-950 hover:text-red-500 transition-all text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" /> Deauthorize
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Status & Active Admins List */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-[#0a1120] border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-slate-400 uppercase">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#050a15] rounded border border-slate-800">
                  <span className="text-sm">Database Connection</span>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#050a15] rounded border border-slate-800">
                  <span className="text-sm text-red-500 font-bold uppercase text-[10px]">Security Clearance</span>
                  <span className="text-xs text-green-500 font-mono font-bold">VERIFIED</span>
                </div>
              </CardContent>
            </Card>

            {/* --- ADMIN MANAGEMENT LIST --- */}
            <Card className="bg-[#0a1120] border-slate-800 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-mono text-slate-400 uppercase flex items-center gap-2">
                  <Users className="h-4 w-4" /> Active Admins
                </CardTitle>
                <button onClick={loadAdmins} className="text-slate-500 hover:text-white transition-colors">
                  <RefreshCw className={`h-3 w-3 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
                </button>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {admins.length === 0 && !isLoadingAdmins ? (
                  <p className="text-xs text-slate-600 italic text-center py-4">No admins provisioned.</p>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 bg-[#050a15] rounded border border-slate-800 group hover:border-slate-600 transition-all">
                      <div className="truncate pr-2">
                        <p className="text-sm font-medium truncate">{admin.fullName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{admin.email}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(admin.id, admin.fullName)}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Revoke Access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
              <h3 className="text-red-500 font-bold flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4" /> Restricted Action
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As Master Admin, you are responsible for designating Market Administrators. 
                Admins have full oversight but cannot access this console.
              </p>
            </div>
          </div>

          {/* Right Column: User Creation */}
          <div className="lg:col-span-8">
            <Card className="bg-[#0a1120] border-slate-800 shadow-2xl">
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 rounded">
                    <UserPlus className="text-blue-500 h-5 w-5" />
                  </div>
                  <CardTitle className="text-white">Provision New Administrator</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleCreateAdmin} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase text-slate-500">Official Full Name</label>
                      <Input 
                        placeholder="Enter full name..." 
                        className="bg-[#050a15] border-slate-700 focus:border-blue-500 text-white py-6"
                        required 
                        value={newUser.fullName}
                        onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase text-slate-500">KCCA Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="admin@kcca.go.ug" 
                        className="bg-[#050a15] border-slate-700 focus:border-blue-500 text-white py-6"
                        required 
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-mono uppercase text-slate-500">Initialization Password</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-[#050a15] border-slate-700 focus:border-blue-500 text-white py-6"
                      required 
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-8 text-lg transition-all transform hover:scale-[1.01]"
                    >
                      {isSubmitting ? "ENCRYPTING & SAVING..." : "GRANT ADMINISTRATOR ACCESS"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}