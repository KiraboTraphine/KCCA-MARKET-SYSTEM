"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { SplashScreen } from "@/components/splash-screen"
import { LoginForm } from "@/components/login-form"
import { CollectorDashboard } from "@/components/collector-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { MasterAdminDashboard } from "@/components/master-admin-dashboard" // New Import

function AppContent() {
  const { user, logout, isLoading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [hasSeenSplash, setHasSeenSplash] = useState(false)

  useEffect(() => {
    // Check if user has seen splash this session
    const seenSplash = sessionStorage.getItem("kcca_splash_seen")
    if (seenSplash) {
      setShowSplash(false)
      setHasSeenSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setHasSeenSplash(true)
    sessionStorage.setItem("kcca_splash_seen", "true")
  }

  const handleLoginSuccess = () => {
    // User is now logged in, dashboard will show
  }

  const handleLogout = () => {
    logout()
  }

  // Show splash screen first (only on initial load)
  if (showSplash && !hasSeenSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#EA2E2E] [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#F6BE2C] [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#0C7240]" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Verifying Credentials...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginForm onSuccess={handleLoginSuccess} />
  }

  // --- ROLE-BASED ROUTING ---
  
  // 1. Master Admin: Only assigns Admins
  if (user.role === "master-admin") {
    return <MasterAdminDashboard onLogout={handleLogout} />
  }

  // 2. Admin: Assigns Collectors and sees Revenue
  if (user.role === "admin") {
    return <AdminDashboard onLogout={handleLogout} />
  }
  
  // 3. Collector: Handles market dues collections
  return <CollectorDashboard onLogout={handleLogout} />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}