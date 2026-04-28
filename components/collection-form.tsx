"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { saveTransaction } from "@/lib/actions"
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
      style: "currency", currency: "UGX", minimumFractionDigits: 0,
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
      let finalReference = paymentReference;
      const receiptId = generateReceiptId(); 

      if (paymentMethod === "mobile_money") {
        const pin = prompt(`KCCA Payment: Enter PIN to authorize ${formatCurrency(totalAmount)}`);
        if (!pin || pin.length < 4) throw new Error("Transaction cancelled: Invalid PIN.");
        finalReference = "MM-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      }

      if (paymentMethod === "bank") {
        finalReference = "BK-" + Math.random().toString(36).substring(2, 9).toUpperCase();
        await new Promise((resolve) => setTimeout(resolve, 1500)); 
      }

      const transactionData = {
        receiptId,
        vendorName: vendorName.trim(),
        supplierPhone: supplierPhone.trim(),
        amount: Math.round(totalAmount),
        quantity,
        paymentMethod,
        paymentReference: finalReference || "PENDING",
        collectorId: user.id,
        collectorName: user.name,
        categoryName: selectedCategoryData?.name || "",
        createdAt: new Date().toISOString(),
      }

      // Save locally for the Verify tab
      createTransaction(transactionData)

      // Save to Neon
      try {
        await saveTransaction(transactionData)
      } catch (dbErr) {
        console.error("DB Sync failed:", dbErr)
      }

      // Reset Form
      setSelectedCategory("")
      setQuantity(1)
      setVendorName("")
      setSupplierPhone("")
      setPaymentMethod("mobile_money")

      onSuccess(transactionData)
      
    } catch (err: any) {
      setError(err.message || "Failed to process payment.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Collect Market Dues</CardTitle>
            <CardDescription>Process payment for market suppliers</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} - {formatCurrency(category.pricePerUnit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              className="h-12" 
            />
          </div>

          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Total Amount</span>
              <span className="text-2xl font-black text-green-700">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supplier Name</Label>
            <Input 
              value={vendorName} 
              onChange={(e) => setVendorName(e.target.value)} 
              className="h-12" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={supplierPhone} 
              onChange={(e) => setSupplierPhone(e.target.value)} 
              className="h-12" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="pay_code">Pay Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Payment...</span>
              </div>
            ) : `Authorize Payment`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}