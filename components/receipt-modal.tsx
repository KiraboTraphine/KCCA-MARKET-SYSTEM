"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Printer, X, CheckCircle } from "lucide-react"

interface ReceiptModalProps {
  transaction: any | null 
  open: boolean
  onClose: () => void
}

export function ReceiptModal({ transaction, open, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [baseUrl, setBaseUrl] = useState("")

  // DEBUG: Check your console (F12) to see what the database is actually sending
  useEffect(() => {
    if (open && transaction) {
      console.log("KCCA Transaction Data received:", transaction);
    }
  }, [open, transaction]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin)
    }
  }, [])

  if (!transaction) return null

  // MAPPING LOGIC: Handle both Drizzle ORM and standard JS naming
  const displayAmount = transaction.totalAmount || transaction.amount || 0;
  const displaySupplier = transaction.supplierName || transaction.vendorName || "Not Recorded";
  const displayCategory = transaction.categoryName || transaction.category || "Market Dues";
  const displayCollector = transaction.collectorName || transaction.collector || "Authorized Staff";
  const displayId = transaction.receiptId || transaction.id || "KCCA-0000";

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(Number(val))
  }

  const formatDate = (dateInput: any) => {
    try {
      const date = dateInput ? new Date(dateInput) : new Date()
      return date.toLocaleString("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Kampala",
      })
    } catch (e) {
      return "Processing..."
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const verificationLink = `${baseUrl}/verify/${displayId}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white">
        <DialogHeader className="p-4 pb-0 bg-white border-none">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-[#003366]">Payment Receipt</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div ref={receiptRef} className="p-6 space-y-4 bg-white print:p-0">
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-600">Payment Successful</span>
          </div>

          <div className="text-center space-y-2">
            <Image
              src="/kcca-logo.png"
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
            <p className="text-xl font-mono font-black text-[#003366]">
              {displayId}
            </p>
          </div>

          <div className="space-y-2.5 px-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Category</span>
              <span className="font-bold text-slate-900">{displayCategory}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Vendor/Supplier</span>
              <span className="font-bold text-slate-900">{displaySupplier}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Collector</span>
              <span className="font-bold text-slate-900">{displayCollector}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Date</span>
              <span className="font-bold text-slate-900">{formatDate(transaction.createdAt)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-[#0C7240] rounded-lg text-white shadow-md">
            <span className="font-bold text-xs uppercase tracking-tighter">Total Paid</span>
            <span className="text-xl font-black">
              {formatCurrency(displayAmount)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 pt-2 bg-white">
            <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
              <QRCodeSVG
                value={verificationLink} 
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
            <div className="flex justify-center gap-1 pt-1 opacity-60">
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
            className="flex-1 bg-[#0C7240] hover:bg-[#095a32] text-white"
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