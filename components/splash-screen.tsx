"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative animate-pulse">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kcca-logo.png-UdixvH9lIofr3nKOB7QiZEO1tu6FE0.png"
          alt="KCCA Logo"
          width={200}
          height={200}
          priority
          className="object-contain"
        />
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Market Dues Collection System</h1>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--kcca-red)] [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--kcca-yellow)] [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--kcca-green)]" />
        </div>
      </div>
    </div>
  )
}
