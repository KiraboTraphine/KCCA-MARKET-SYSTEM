"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { SplashScreen } from "@/components/splash-screen"
import { LoginForm } from "@/components/login-form"
import { CollectorDashboard } from "@/components/collector-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"

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
            <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--kcca-red)] [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--kcca-yellow)] [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--kcca-green)]" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginForm onSuccess={handleLoginSuccess} />
  }

  // Show dashboard based on role
  if (user.role === "admin") {
    return <AdminDashboard onLogout={handleLogout} />
  }
  
  return <CollectorDashboard onLogout={handleLogout} />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
