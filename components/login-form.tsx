"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)
    setIsLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full bg-[var(--kcca-green)] text-white py-3 px-6 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
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
            <h1 className="text-lg font-bold leading-tight">KCCA</h1>
            <p className="text-xs text-white/80">Market Dues System</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm hover:text-[var(--kcca-yellow)] transition-colors">Home</button>
          <button onClick={() => window.open('https://www.kcca.go.ug/about-us', '_blank')} className="text-sm hover:text-[var(--kcca-yellow)] transition-colors">About</button>
          <button onClick={() => window.open('https://www.kcca.go.ug/contact-us', '_blank')} className="text-sm hover:text-[var(--kcca-yellow)] transition-colors">Contact</button>
        </div>
      </nav>

      <div className="flex-1 flex">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/market.jpg-p48pC1kbaQzMu7vycXk3qYW2Hi2FuU.png"
            alt="Kampala Market"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/30">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-card">
            <CardHeader className="space-y-4 text-center pb-2">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg border-2 border-[var(--kcca-green)] p-1">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kcca-logo.png-UdixvH9lIofr3nKOB7QiZEO1tu6FE0.png"
                    alt="KCCA Logo"
                    width={100}
                    height={100}
                    priority
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-center gap-1">
                  <div className="h-1 w-8 rounded-full bg-[var(--kcca-red)]" />
                  <div className="h-1 w-8 rounded-full bg-[var(--kcca-yellow)]" />
                  <div className="h-1 w-8 rounded-full bg-[var(--kcca-green)]" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Market Dues System
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in with your email and password
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
                {error && (
                  <Alert variant="destructive" className="bg-[var(--kcca-red)]/10 border-[var(--kcca-red)]/30">
                    <AlertDescription className="text-[var(--kcca-red)]">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="pl-10 h-12 border-input focus:border-[var(--kcca-red)] focus:ring-[var(--kcca-red)]"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="pl-10 pr-10 h-12 border-input focus:border-[var(--kcca-red)] focus:ring-[var(--kcca-red)]"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold bg-[var(--kcca-red)] hover:bg-[var(--kcca-red)]/90 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-5 w-5" />
                      Signing in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}