# Implementation Plan - MTS-ERP-SAP (Universal Hybrid Enterprise ERP-SAP)

MTS-ERP-SAP is a comprehensive, multi-tenant enterprise ERP platform designed to seamlessly handle business operations across all categories (Manufacturing, Textile, Solar & Electrical, Food & Beverage, Construction, Wholesale, Retail/POS, Services, Import/Export, and Healthcare).

## 1. System Architecture & Tech Stack
- **Frontend Framework**: React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Icons & UI Visuals**: Lucide React + Motion for animations.
- **Data Persistence & Authentication**:
  - Cloud Firestore / Local Multi-tenant Mock DB for cloud persistence.
  - Client-side IndexedDB for offline storage and queue engine.
- **Offline & PWA Capabilities**: Service Worker (`sw.js`), Web App Manifest, IndexedDB Sync Queue, Online/Offline Network Status Bar.
- **AI & TTS Engine**: @google/genai TypeScript SDK utilizing `gemini-3.8-flash-tts` for audio narration across dashboards, forms, reports, and AI executive alerts.
- **Routing Engine**: Dynamic Hostname / Subdomain / Slug Tenant Resolver (`erp.domain.com` for Master Portal, `{slug}.erp.domain.com` or `?tenant={slug}` for Client Tenants).

---

## 2. Key Modules & Functional Scope

### A. Dual Authentication & Multi-Tenant Portal
1. **Master Admin Portal (`/master` / Root Host)**:
   - Central Client Company Registration & Automatic URL Slug Generator (`company-code`, `url-slug`, `tenantId`).
   - Subscription & Module Activation Manager.
   - Global User, Audit Log, and Security Management.
   - System-wide Dashboard and Sync Monitoring.
2. **Client Tenant Login (`/{slug}` / Dynamic Tenant Domain)**:
   - Tenant-isolated authentication screen displaying custom company branding, logo, and theme.
   - Company Switcher for authorized multi-tenant users.
   - Branch, Department, and Role-Based Access Control (RBAC).

### B. Complete Enterprise ERP Departments
1. **Finance & Accounts**: Chart of Accounts, General Ledger, Trial Balance, P&L, Balance Sheet, Cash/Bank Book, Customer/Supplier Ledgers, Receivable & Payable Aging, Pakistani NTN/STRN Tax & Withholding calculations.
2. **Procurement & Purchasing**: Purchase Requisitions, RFQ, Vendor Comparisons, Purchase Orders, Goods Receipt Notes (GRN), Inspection, Supplier Invoices & Debit Notes.
3. **Inventory & Warehouse Management**: Item Master, UOMs, Warehouses, Opening Stock, Stock Transfers, Adjustments, Serial/Batch & Expiry tracking, Stock Valuation & Reorder alerts.
4. **Sales & Distribution**: Customer Master, Sales Quotations, Sales Orders, Delivery Challans, Sales Invoices, Returns, Customer Receipts, and POS Retail mode.
5. **Production & Manufacturing**: Bill of Materials (BOM), Work Centers, Production Plans, Work Orders, Material Issue, Consumption, WIP, and Finished Goods Receipt.
6. **Human Resource Management**: Employee Profiles, Attendance, Leave Management, Overtime, Payroll Sheets, Loans/Advances, and Salary Slip generation.
7. **Supply Chain, Logistics & Quality**: Vehicle tracking, Quality Inspection Forms, HSE checklists, and Maintenance logs.

### C. Dynamic Form Builder & Table Designer
- Drag-and-drop form field configurator supporting Text, Currency (PKR), Dates, Dropdowns, Formula fields, Repeating line-items, File uploads, Signatures, and Barcodes.
- Configurable data table columns with sequence freezing, column visibility toggles, filtering, and export.

### D. Universal Reporting & Approval Engine
- PDF, Excel, and CSV export capabilities.
- Multi-tier condition-based approval workflows (Department Head → Finance Manager → Authorized Approver).
- Filterable drill-down reports with summary subtotals.

### E. Hybrid Offline PWA & Sync Engine
- Automatic IndexedDB storage for offline transaction creation (Sales Invoices, Goods Receipts, Stock Audits).
- Reconnection listener that automatically validates, deduplicates, and synchronizes offline queue with cloud Firestore.

### F. Gemini TTS Audio Voice Assistant
- Voice narration button on every invoice, executive report, stock alert, and department dashboard.
- Real-time vocal text-to-speech rendering using `gemini-3.8-flash-tts`.

---

## 3. Step-by-Step Execution Plan

1. **Phase 1: Project Setup & Core Architecture**
   - Update `metadata.json` and `index.html` with MTS-ERP-SAP branding.
   - Build Tenant Resolver (`tenantContext.tsx`) supporting subdomain parsing and query fallback (`?tenant=albarka`).
   - Setup IndexedDB wrapper for PWA offline sync (`offlineStore.ts`).

2. **Phase 2: Master Admin Portal & Client URL Engine**
   - Build Master Portal with company creation wizard (calculates slug, initial Client Admin, default modules, and company code).
   - Implement Client Tenant Login with company custom branding (logo, colors, background).

3. **Phase 3: Core ERP Modules & Department Workflows**
   - Implement Finance & Accounts (CoA, General Ledger, Vouchers, Tax/NTN/STRN).
   - Implement Procurement & Purchasing (PR -> PO -> GRN -> Invoice).
   - Implement Inventory & Stock Management (Items, Warehouses, Valuation, Batch/Serial).
   - Implement Sales & Distribution (Quotation -> Order -> Challan -> Invoice -> Receipt).
   - Implement HR & Payroll (Employees, Attendance, Salary Sheets).
   - Implement Production & BOM (Manufacturing Orders, WIP, Scrap).

4. **Phase 4: Dynamic Tools & Reporting**
   - Implement Form Builder and Custom Table Layout Designer.
   - Build Reporting Engine with instant PDF preview and Excel/CSV download.
   - Build Workflow Approval Engine.

5. **Phase 5: Gemini TTS Voice Integration & AI Capabilities**
   - Server-side API endpoint for `gemini-3.8-flash-tts` voice generation.
   - Integrates TTS speech player across all dashboards, forms, and report summaries.
   - Add AI Assistant panel for accounting suggestions, anomaly alerts, and automated insights.

6. **Phase 6: Verification & Final Polish**
   - Verify PWA service worker and manifest setup.
   - Run compilation and linting to ensure error-free build.

---

## 4. User Feedback Request
Please review the proposed plan and let us know if you would like any adjustments before we proceed to build!
