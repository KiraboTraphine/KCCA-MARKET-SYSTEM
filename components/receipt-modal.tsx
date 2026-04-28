"use client"

import { useRef } from "react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { type Transaction } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Printer, Download, X, CheckCircle } from "lucide-react"

interface ReceiptModalProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

export function ReceiptModal({ transaction, open, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  if (!transaction) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateInput: any) => {
    try {
      const date = dateInput ? new Date(dateInput) : new Date()
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString("en-UG", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Kampala",
        })
      }
      return date.toLocaleString("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Kampala",
      })
    } catch (e) {
      return "Processing..."
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "mobile_money": return "Mobile Money"
      case "bank": return "Bank Transfer"
      case "pay_code": return "Pay Code"
      default: return method
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // ALIGNED ID LOGIC: Priority to receiptId to match verification logic
  const displayId = transaction.receiptId || (transaction as any).id || "KCCA-0000";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white">
        <DialogHeader className="p-4 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Payment Receipt</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Added print:shadow-none and bg-white to ensure clean rendering */}
        <div ref={receiptRef} className="p-6 space-y-4 print:p-0 bg-white">
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">Payment Successful</span>
          </div>

          <div className="text-center space-y-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kcca-logo.png-UdixvH9lIofr3nKOB7QiZEO1tu6FE0.png"
              alt="KCCA Logo"
              width={60}
              height={60}
              className="mx-auto object-contain"
            />
            <div>
              <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">KCCA Market Dues</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Official Payment Receipt</p>
            </div>
          </div>

          <Separator />

          <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Receipt ID</p>
            <p className="text-xl font-mono font-black text-slate-900">
              {displayId}
            </p>
          </div>

          <div className="space-y-2.5 px-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Category</span>
              <span className="font-bold text-slate-900">{transaction.categoryName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Vendor Name</span>
              <span className="font-bold text-slate-900">{transaction.vendorName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Method</span>
              <span className="font-bold text-slate-900">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-slate-900 font-bold">{transaction.paymentReference}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Collector</span>
              <span className="font-bold text-slate-900">{transaction.collectorName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Date</span>
              <span className="font-bold text-slate-900">{formatDate(transaction.createdAt)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-600 rounded-lg text-white shadow-sm">
            <span className="font-bold text-xs">TOTAL PAID</span>
            <span className="text-xl font-black">
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          {/* FIXED QR SECTION: Centered and simplified value */}
          <div className="flex flex-col items-center gap-2 pt-2 bg-white">
            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <QRCodeSVG
                value={displayId} // Simple value ensures high readability for scanners
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Official Digital Verification</p>
          </div>

          <div className="text-center text-[10px] text-muted-foreground pt-3 space-y-1 border-t border-dashed border-slate-300">
            <p className="font-bold">Kampala Capital City Authority</p>
            <p>For a Better City - Service Excellence</p>
            <div className="flex justify-center gap-1 pt-1 opacity-50">
              <div className="h-1 w-6 rounded-full bg-[#E31E24]" />
              <div className="h-1 w-6 rounded-full bg-[#F9E000]" />
              <div className="h-1 w-6 rounded-full bg-[#008C45]" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border bg-slate-50 print:hidden">
          <Button variant="outline" className="flex-1 bg-white" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onClose}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}