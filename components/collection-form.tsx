"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getCategories,
  generatePayCode,
  createTransaction,
  generateReceiptId,
  type Category,
} from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShoppingCart } from "lucide-react"
import { ReceiptModal } from "@/components/receipt-modal" 

interface CollectionFormProps {
  onSuccess: (transaction: any) => void
}

export function CollectionForm({ onSuccess }: CollectionFormProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "bank" | "pay_code">("mobile_money")
  const [vendorName, setVendorName] = useState("")
  const [supplierPhone, setSupplierPhone] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  useEffect(() => {
    setCategories(getCategories())
  }, [])

  useEffect(() => {
    if (paymentMethod === "pay_code") {
      setPaymentReference(generatePayCode())
    } else {
      setPaymentReference("")
    }
  }, [paymentMethod])

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory)
  const totalAmount = selectedCategoryData ? selectedCategoryData.pricePerUnit * quantity : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency", 
      currency: "UGX", 
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedCategory || !vendorName || !supplierPhone || !user) {
      setError("Please fill in all required fields.")
      return
    }

    setIsLoading(true)

    try {
      if (paymentMethod === "mobile_money") {
        const pin = prompt(`KCCA Payment: Enter PIN to authorize ${formatCurrency(totalAmount)}`);
        if (!pin || pin.length < 4) throw new Error("Transaction cancelled: Invalid PIN.");
      }

      const transactionData = {
        receiptId: generateReceiptId(),
        vendorName: vendorName.trim(),
        supplierPhone: supplierPhone.trim(),
        totalAmount: Math.round(totalAmount), 
        quantity,
        paymentMethod,
        paymentReference: paymentReference || "BK-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        collectorId: user.id,
        collectorName: user.name,
        categoryName: selectedCategoryData?.name || "",
      }

      const savedTx = createTransaction(transactionData)
      
      setLastTransaction(savedTx)
      setShowReceipt(true)

      setSelectedCategory("")
      setQuantity(1)
      setVendorName("")
      setSupplierPhone("")
      setPaymentMethod("mobile_money")

      onSuccess(savedTx)
      
    } catch (err: any) {
      setError(err.message || "Failed to process payment.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0C7240]/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-[#0C7240]" />
            </div>
            <div>
              <CardTitle className="text-lg text-[#003366]">Collect Market Dues</CardTitle>
              <CardDescription>Process official payment for market suppliers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({formatCurrency(category.pricePerUnit)}/unit)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Side-by-Side Layout for Quantity and Dynamic Total Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Due</Label>
                <div className="h-12 flex items-center justify-between px-4 bg-muted rounded-xl border border-slate-100 font-extrabold text-base text-[#0C7240]">
                  {selectedCategoryData ? formatCurrency(totalAmount) : "UGX 0"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor/Supplier Name</Label>
              <Input
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierPhone">Supplier Phone Number</Label>
              <Input
                id="supplierPhone"
                type="tel"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value: "mobile_money" | "bank" | "pay_code") => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="pay_code">PRN / Pay Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "pay_code" && paymentReference && (
              <div className="p-3 bg-muted rounded-lg text-sm font-mono text-center border border-dashed">
                Payment Code: <span className="font-bold text-primary">{paymentReference}</span>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-14 bg-[#003366] hover:bg-[#002244] text-white font-black text-lg rounded-xl shadow-sm">
              {isLoading ? <Loader2 className="animate-spin" /> : "Authorize Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showReceipt && lastTransaction && (
        <ReceiptModal 
          open={showReceipt} 
          onClose={() => setShowReceipt(false)} 
          transaction={lastTransaction} 
        />
      )}
    </>
  )
}