"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { loginUser } from "@/lib/actions"

export interface User {
  id: number | string
  role: "master-admin" | "admin" | "collector" // Explicit roles
  name: string
  email?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("kcca_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("kcca_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await loginUser(email, password)

      if (result.success && result.user) {
        const userData: User = {
          id: result.user.id,
          role: result.user.role as any,
          name: result.user.name,
          email: email
        }
        
        setUser(userData)
        localStorage.setItem("kcca_user", JSON.stringify(userData))
        return { success: true }
      } else {
        return { success: false, error: result.error || "Login failed" }
      }
    } catch (err) {
      console.error("Auth Context Error:", err)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("kcca_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}