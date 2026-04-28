"use client"

import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  onLogout: () => void
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kcca-logo.png-UdixvH9lIofr3nKOB7QiZEO1tu6FE0.png"
              alt="KCCA Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-foreground">KCCA Market Dues</h1>
              <p className="text-xs text-muted-foreground">Collection System</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[var(--kcca-green)]/10 flex items-center justify-center">
                <User className="h-4 w-4 text-[var(--kcca-green)]" />
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <Badge
                  variant="outline"
                  className={
                    user?.role === "admin"
                      ? "bg-[var(--kcca-red)]/10 text-[var(--kcca-red)] border-[var(--kcca-red)]/30 text-xs"
                      : "bg-[var(--kcca-green)]/10 text-[var(--kcca-green)] border-[var(--kcca-green)]/30 text-xs"
                  }
                >
                  {user?.role === "admin" ? "Administrator" : "Collector"}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="text-[var(--kcca-red)] border-[var(--kcca-red)] hover:bg-[var(--kcca-red)] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
