"use client"

import { useState } from "react"
import { verifyReceipt, type Transaction } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Search, CheckCircle, XCircle, Shield, Camera, X } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"

export function VerifyReceipt() {
  const [receiptId, setReceiptId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{ found: boolean; transaction?: Transaction } | null>(null)

  /**
   * ALIGNED LOGIC: This must match normalizeId in your data-store.ts exactly.
   * If a QR code contains "KCCA-3909", this ensures we search for "KCCA-3909".
   */
  const cleanIncomingId = (text: string) => {
    let id = text.trim().toUpperCase()
    // Strips prefixes if the QR value is "KCCA-VERIFY:KCCA-3909"
    if (id.includes(":")) {
      const parts = id.split(":")
      id = parts[parts.length - 1]
    }
    // Ensures the search string always has the KCCA- prefix
    return id.startsWith("KCCA-") ? id : `KCCA-${id}`
  }

  const startScanner = () => {
    setIsScanning(true)
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        },
        false
      )

      scanner.render(
        (decodedText) => {
          const finalId = cleanIncomingId(decodedText)
          setReceiptId(finalId)
          scanner.clear()
          setIsScanning(false)
          performVerification(finalId) // Immediate verification after scan
        },
        () => { /* Frame-by-frame silent errors */ }
      )
    }, 100)
  }

  const performVerification = async (id: string) => {
    if (!id.trim()) return

    setIsLoading(true)
    setResult(null)
    
    // Normalize before search
    const targetId = cleanIncomingId(id)
    
    // Small delay for better UX (feedback loop)
    await new Promise((resolve) => setTimeout(resolve, 600))

    try {
      const transaction = verifyReceipt(targetId)
      
      if (transaction) {
        setResult({ found: true, transaction })
      } else {
        setResult({ found: false })
      }
    } catch (error) {
      console.error("Verification error:", error)
      setResult({ found: false })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performVerification(receiptId)
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-yellow-700" />
          </div>
          <div>
            <CardTitle className="text-lg">Verify Receipt</CardTitle>
            <CardDescription>Check authenticity of market payments</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value.toUpperCase())}
              placeholder="KCCA-3909"
              className="pl-10 h-12 font-mono uppercase focus-visible:ring-red-500"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="h-12 bg-red-600 px-6 hover:bg-red-700 transition-colors"
            disabled={isLoading || !receiptId}
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify"}
          </Button>
          <Button 
            type="button"
            onClick={startScanner} 
            variant="outline" 
            className="h-12 border-green-600 text-green-600 hover:bg-green-50"
            disabled={isLoading}
          >
            <Camera className="h-5 w-5" />
          </Button>
        </form>

        {isScanning && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Scan QR Code</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsScanning(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* The scanner renders into this div */}
                <div id="qr-reader" className="overflow-hidden rounded-lg border-2 border-slate-100"></div>
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  Point your camera at the receipt QR code
                </p>
             </div>
          </div>
        )}

        {result && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {result.found ? (
              <div className="p-5 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 font-black mb-4">
                  <CheckCircle className="h-5 w-5" /> VALID RECEIPT FOUND
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-green-100 pb-1">
                    <span className="text-muted-foreground">Receipt ID:</span>
                    <span className="font-mono font-bold text-slate-900">{result.transaction?.receiptId}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-100 pb-1">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="font-bold text-slate-900">{result.transaction?.vendorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-100 pb-1">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-bold text-slate-900">{result.transaction?.categoryName}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-100 pb-1">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-black text-green-700">
                      UGX {result.transaction?.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Issued On:</span>
                    <span className="text-slate-700 font-medium">
                      {result.transaction?.createdAt 
                        ? new Date(result.transaction.createdAt).toLocaleString("en-UG", { dateStyle: 'medium' }) 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <XCircle className="h-5 w-5" /> INVALID RECEIPT
                </div>
                <p className="text-sm text-red-600">
                  No official record found for: <span className="font-mono font-bold underline">{receiptId}</span>
                </p>
                <div className="mt-2 p-2 bg-white/50 rounded text-[10px] text-red-500 italic leading-tight">
                  Verification check failed. Please ensure the ID is correct or contact the market administrator.
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}