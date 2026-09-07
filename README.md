# RupeeTrack 🇮🇳 — Indian Personal Finance & Expense Tracker

A production-grade, modular personal finance and expense tracking web application tailored specifically for the Indian financial context. Designed initially for personal tracking, and architected for seamless future scaling into a multi-tenant SaaS.

---

## 🌟 Key Features

### 1. Indian Financial Context & Precision
* **Native INR (`₹`) Numbering Formatting**: Proper Lakhs and Crores grouping (e.g., `₹1,000`, `₹10,000`, `₹1,00,000`, `₹10,00,000`, `₹1,00,00,000`).
* **Indian Taxonomy & Categories**: Rent, Society Maintenance, Groceries (D-Mart/Blinkit/Zepto), Milk & Dairy (Amul/Country Delight), Vegetables, Fuel (HPCL/BPCL/IOCL), Fastag Tolls, Auto/Cabs (Ola/Uber/Rapido), Telecom (Jio/Airtel/Vi), Broadband, Electricity (BESCOM/MSEDCL), OTT subscriptions, Maid & Cook Salaries, SIP & Mutual Funds (Zerodha/Groww), and Gold.
* **Payment Mode Tracking**: UPI (GPay/PhonePe/Paytm), Credit Cards, Debit Cards, Net Banking, NEFT, IMPS, RTGS, Auto-Debit (NACH), Cash, and Cheques.

### 2. Double-Counting Safeguards
* **Transfers Are Never Expenses**: Self-transfers (e.g. HDFC Salary → SBI Savings or Savings → Investment) adjust account balances without inflating monthly expense totals.
* **Credit Card Liability vs Expense Isolation**: Original card purchases record as expenses; subsequent credit card bill payments record as liability settlements without duplicate expense creation.

### 3. Bank Statement PDF Parser & Review Pipeline
* **Multi-Bank Architecture**: Extensible `BankStatementParser` interface supporting **HDFC Bank**, **State Bank of India (SBI)**, **ICICI Bank**, **Axis Bank**, **Kotak Mahindra**, and generic statement formats.
* **Auto-Categorization Rule Engine**: Pre-loaded with dozens of popular Indian merchants and configurable user regex rules.
* **Duplicate Detection Engine**: Exact reference number matching and fuzzy date/amount checking to prevent duplicate imports.
* **Staged Review Screen**: Review extracted transactions, inspect confidence percentages, modify categories, and batch import with one click.
* **Scanned Statement Detection**: Detects image-based PDFs and informs the user if OCR is needed.

### 4. Financial Goals & Achievement Calculator
* **Goal Tracking**: ₹1,00,000 Bank Balance Goal, Car Purchase, Superbike Purchase, House Down Payment, and custom goals.
* **Projection Engine**: Computes target date, months remaining, required monthly savings, current contribution pace, projected completion date, and real-time on-track / behind status.
* **Emergency Fund Cushion**: Dynamic 3 / 6 / 9 / 12-month essential expense multiplier calculator.

### 5. Debts, Loans & EMI Management
* **Debt Portfolio**: Car Loans, Bike Loans, Home Loans, Personal Loans with principal tracking, interest rates, and auto-debit due dates.
* **Debt-to-Income (DTI) Ratio**: Real-time evaluation of EMI burden against monthly income.

### 6. Budgets & Real-Time Alerts
* Category-level budget limits with color-coded warning thresholds (Green `<80%`, Yellow `80-99%`, Red `100%+ Exceeded`).

### 7. Financial Health Score (0–100)
* Informational scoring combining Savings Rate (25 pts), Debt Burden / DTI (25 pts), Emergency Fund Coverage (20 pts), Budget Adherence (15 pts), and Goal Progress (15 pts).

### 8. Monthly Reports & Account Reconciliation
* Month-over-Month delta comparisons (`+6.2%` expense increase/decrease).
* Top 5 spending categories.
* Monthly bank balance reconciliation: `Opening Balance + Income - Expenses +/- Net Transfers = Expected Closing Balance vs Actual`.

### 9. Privacy, Export & Hybrid Execution
* **Dual-Mode**: Connects to `VITE_API_URL` when configured, and includes an in-browser storage & parsing engine for immediate standalone functionality on GitHub Pages.
* **Export**: Instant full JSON data backup and CSV transaction exports.

---

## 🏗️ Architecture & Monorepo Structure

```text
personal-finance-tracker/
├── apps/
│   ├── web/                     # React 18/19 + Vite + TypeScript + Tailwind CSS + Recharts
│   └── api/                     # Node.js + Express + TypeScript + Prisma ORM + PDF Parsers
│
├── packages/
│   ├── shared/                  # Pure Indian currency formatters, math, rule engine, validation
│   └── types/                   # Shared TypeScript interfaces & DTOs
│
├── prisma/
│   ├── schema.prisma            # PostgreSQL / SQLite Prisma Schema
│   └── seed.ts                  # System categories & merchant rule initialization
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint, typecheck, test, build
│       └── deploy-web.yml       # Automated GitHub Pages deployment
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js**: v18+ (v22 recommended)
* **pnpm**: v9+ (`npm i -g pnpm`)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database & Seed Data
```bash
# Push Prisma schema to SQLite database (or configure DATABASE_URL in .env)
pnpm db:push

# Seed with 3 months of realistic Indian data (Salary ₹1.2L, Rent, EMIs, Groceries, Goals)
pnpm db:seed
```

### 3. Run Development Servers
```bash
# Run both Frontend (Vite) and Backend (Express API) concurrently:
pnpm dev

# Or run frontend only:
pnpm dev:web   # http://localhost:5173

# Or run API server only:
pnpm dev:api   # http://localhost:4000/api
```

---

## 🧪 Running Tests

The test suite validates Indian currency formatting, transfer non-expense rules, credit card liability settlement, merchant rule categorization, duplicate detection, and goal math:

```bash
# Run all vitest tests
pnpm test

# Run typechecks across all packages and apps
pnpm typecheck
```

---

## 🚢 Deployment

### Frontend (GitHub Pages)
The repository includes `.github/workflows/deploy-web.yml` which automatically builds and deploys `apps/web/dist` to GitHub Pages upon pushing to `main`.
* The frontend uses `HashRouter` and relative asset paths (`base: './'`), ensuring seamless routing without 404s.
* Works right out-of-the-box in standalone browser mode, and connects to the backend when `VITE_API_URL` is provided.

### Backend (Node.js API)
The backend is located in `apps/api` and is structured as a REST service compatible with serverless and container runtimes:
* **Vercel / Cloud Run / Railway / Render**: Deploy `apps/api` with `DATABASE_URL` pointed to your PostgreSQL instance (e.g. Supabase, Neon, AWS RDS).
* Configure `VITE_API_URL=https://your-api-domain.com/api` on the frontend.

---

## 🔮 Future Multi-User SaaS Roadmap

The Prisma database schema and TypeScript interfaces are already designed with:
- Multi-tenancy structures (`User`, `Workspace`, `Account`, `Transaction`, `Budget`, `Goal`)
- Scalable merchant rules system with per-user overrides
- Pluggable OCR pipeline for scanned statement PDFs
- OAuth / Supabase / Clerk authentication hooks

---

## 📄 License

MIT License. Designed with ❤️ for Indian personal finance tracking.
