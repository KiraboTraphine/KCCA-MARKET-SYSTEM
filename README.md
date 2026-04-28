# KCCA Market Management System 🏛️

A professional digital solution designed for the **Kampala Capital City Authority** to modernize market dues collection, track revenue in real-time, and eliminate manual receipt fraud.

## 🌟 Key Features
- **Smart Collection Form:** Process vendor payments for various produce categories with automatic price calculation.
- **QR Verification:** High-contrast QR codes generated for every receipt, allowing inspectors to verify payments instantly via any smartphone camera.
- **Fail-Safe ID Matching:** Advanced normalization logic that handles both manual 4-digit ID entry and scanned data consistently.
- **Secure Architecture:** Built with modern web standards, ensuring data integrity and protected environment variables.

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (for type safety)
- **Database:** Neon PostgreSQL & Drizzle ORM
- **UI & Styling:** Tailwind CSS & Shadcn/UI
- **Scanning Engine:** Html5-Qrcode

## 🚀 How to Run Locally
1. Clone the repository: `git clone https://github.com/KiraboTraphine/KCCA-MARKET-SYSTEM.git`
2. Install dependencies: `pnpm install`
3. Set up your `.env.local` file with your **Neon Database URL**.
4. Run the development server: `pnpm dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
