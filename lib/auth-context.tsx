"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  username: string
  role: "admin" | "collector"
  name: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Password for authentication
const AUTH_PASSWORD = "kcca2024"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("kcca_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check password
    if (password !== AUTH_PASSWORD) {
      return { success: false, error: "Invalid password" }
    }

    const usernameLower = username.toLowerCase()
    let role: "admin" | "collector" | null = null
    let name = ""

    if (usernameLower.endsWith(".admin")) {
      role = "admin"
      name = username.slice(0, -6)
    } else if (usernameLower.endsWith(".collector")) {
      role = "collector"
      name = username.slice(0, -10)
    }

    if (!role || !name) {
      return { success: false, error: "Username must end with .admin or .collector" }
    }

    // FIX: Generate a consistent ID based on the username
    // This ensures 'Kirabo' always has the same ID, so history survives logout.
    const staticId = `user-${usernameLower.replace(/[^a-z0-9]/g, "-")}`

    const userData: User = {
      id: staticId, // No more random UUIDs!
      username: username,
      role: role,
      name: name.charAt(0).toUpperCase() + name.slice(1),
    }

    setUser(userData)
    localStorage.setItem("kcca_user", JSON.stringify(userData))
    return { success: true }
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