import { getCollectionByReceiptId } from "@/lib/actions";
import { ReceiptView } from "@/components/receipt-view";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function VerifyPage({ params }: PageProps) {
  // Await params if it is passed as a Promise (standard for recent Next.js architectures)
  const resolvedParams = await params;
  const receiptId = resolvedParams.id;

  // Fetch from the real database via your Server Action
  const data = await getCollectionByReceiptId(receiptId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      {/* KCCA BRANDING */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/kcca-logo.png"
            alt="KCCA Logo"
            width={80}
            height={80}
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">KCCA Verification</h1>
        <p className="text-[#0C7240] font-bold text-xs uppercase tracking-widest mt-1">Official Revenue Portal</p>
      </div>

      {/* IF NO DATA FOUND (Fake or wrong receipt) */}
      {!data ? (
        <div className="bg-white p-8 rounded-2xl border-2 border-red-100 shadow-xl max-w-md w-full text-center">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invalid Receipt</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Warning: This receipt record was not found in the KCCA database. 
            The ID <strong className="font-mono break-all">{receiptId}</strong> may be incorrect or fraudulent.
          </p>
        </div>
      ) : (
        /* IF DATA IS FOUND (Valid receipt) */
        <div className="space-y-6 w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-emerald-900 font-bold">Verified Authentic</p>
              <p className="text-emerald-700 text-xs">This payment is registered in the official database.</p>
            </div>
          </div>
          
          {/* Render the unified receipt markup */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
             <ReceiptView data={data} readOnly={true} />
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Kampala Capital City Authority
        </p>
        <p className="text-[9px] text-slate-400 mt-1 italic">For security, always verify the URL is kcca.go.ug</p>
      </div>
    </div>
  );
}