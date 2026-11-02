# Department Forms, Definitions, Standard 10-Row Document Grids & Dynamic Report System

Implement dedicated, fully interactive department forms and definition master managers across all ERP modules. Overhaul the transactional bill, voucher, and invoice interfaces with a 10-row tabular item grid featuring Pakistani ERP standards (GST 18% Yes/Exempt, Cash vs Credit billing, previous ledger balance lookup, other expense/discount footers), replace generic single-voucher report filters with domain-accurate parameters, and embed company logo branding options across all PDF reports and document prints.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned with your requirements and confirmed during Phase 1:

- **Confirmed Decision 1 (Item Grid Scale)**: All transactional bill, invoice, and voucher forms will load with **10 pre-rendered blank/sample item rows** by default, accompanied by a dynamic **+ Add Row** button and row removal actions.
- **Confirmed Decision 2 (Logo Placement & Toggle)**: Company logo branding will be featured prominently on the **Top Header** of every PDF report, bill, voucher, and invoice print view, equipped with an in-form **Show/Hide Logo toggle** and real-time logo URL/upload controls.
- **Confirmed Decision 3 (GST & Tax Mechanics)**: Item rows will compute standard **18% FBR GST** per line item with an inline **Yes / Exempt** selector, updating tax totals, net totals, and grand balances in real time.
- **Confirmed Decision 4 (Billing Terms & Balances)**: Headers will provide a **Cash vs Credit Bill** switch, with automatic customer/vendor lookup attaching previous outstanding ledger balances to the grand total.

---

## 1. Overview & Core Concept

### What It Does
- **Active Navigation for Definitions & Forms**: Clicking any subitem under **Definitions** (e.g., Chart of Accounts, Suppliers & Creditors, Item Catalog, Customer Directory, Warehouse Locations) or **Forms** (e.g., Journal Voucher, Payment Voucher, Issue PO, GRN, Tax Invoice, BOM Setup) in the sidebar will immediately open a dedicated, functional interface rather than changing headings or failing silently.
- **Standard Pakistani ERP Tabular Item Grid**: Provides a standardized 10-row item data grid with columns:
  `Sr #`, `Item Code`, `Item Name`, `UOM`, `Qty Demand`, `Issue Qty`, `Bal Stock`, `Remarks`, `Price / Unit Rate`, `GST (Yes/Exempt)`, `Tax Amount`, and `Line Total`.
- **Comprehensive Financial Calculation Summary**: Auto-calculates Subtotal, Total GST (18%), Editable Discount, Freight/Other Expenses, Net Current Amount, Attached Previous Ledger Balance, and Grand Total.
- **Report Parameter Customization**: Replaces the generic "Voucher Type" popup with domain-specific parameter dialogs tailored to each report type (e.g., POS terminal/cashier/payment modes for POS reports, warehouse/valuation method for Stock Ledger, aging brackets for Customer Aging).
- **Universal Logo Branding**: Embeds tenant company logos on all printable documents and PDF reports with easy toggle and preview controls.

### Target Audience & Persona
- Enterprise finance officers, warehouse inventory managers, procurement leads, POS cashiers, and company executives operating under Pakistani corporate and tax regulations (FBR STRN 18%, NTN compliance).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Department Form Entry**:
   - User expands a department (e.g. Sales, Procurement, Inventory, Finance) in the sidebar and clicks a form (e.g. *Tax Invoice (STRN 18%)* or *Issue Purchase Order*).
   - A modal or full-width document workspace opens with a clean header: Document Number, Date, Cash/Credit toggle, and Customer/Vendor dropdown.
   - Selecting a customer automatically populates their **Previous Ledger Balance**.
   - The user fills or adjusts the 10 item rows (`Item Code`, `Item Name`, `UOM`, `Qty Demand`, `Issue Qty`, `Bal Stock`, `Price`, and `GST toggle`).
   - The summary footer recalculates Subtotal, 18% Tax, Freight/Expenses, Discount, and Grand Total.
   - User clicks **Print / PDF View** to preview the branded voucher with company logo, signatures, and terms.
2. **Definition Management**:
   - User clicks a definition (e.g., *Customer Directory*, *Warehouse Locations*, *Chart of Accounts*).
   - Opens the Definition Master panel showing existing records, search bar, active status, and an **Add New Record** form.
3. **Context-Aware Report Generation**:
   - User clicks a report (e.g. *Daily POS Sales Summary*).
   - Dialog opens with report-specific filters (POS Terminal, Cashier, Payment Type, Date Range) with no irrelevant accounting voucher dropdowns.
   - User toggles **Include Company Logo** and clicks **View / Print PDF** or **Export Excel**.

### Visual Identity & Layout Rules (SaaS & Dashboard Domain Reference)
- **Palette (60-30-10 Rule)**:
  - 60% Canvas: Slate-950 deep canvas (`#020617` / `#0F172A`)
  - 30% Structural Surfaces: Slate-900 / Slate-800 surfaces with 1px border lines (`border-slate-800` / `border-slate-700`)
  - 10% Accent: High-contrast Cyan (`#06B6D4` / `#0891B2`) for primary actions and Emerald (`#10B981`) for approved/balanced ledger status
- **Typography**:
  - Headings & Navigation: `Plus Jakarta Sans` / `Manrope` with clean title-casing (no code-comment prefixes or fake version stamps).
  - Tabular Data & Financial Figures: `font-mono tabular-nums` (`JetBrains Mono`) for all numeric rates, stock balances, taxes, and grand totals.
- **Print / PDF Styling**:
  - High-contrast clean white background (`bg-white text-slate-900`) for high-fidelity browser printing with clear border lines, logo branding in header, and formal 4-signature approval block (Prepared By, Checked By, Approved By, Receiver's Signature).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Modular Grid Component vs Fragmented Department Forms**
  - *Chosen Approach*: Build a robust, highly configurable `StandardDocumentGridForm` that dynamically adapts to Invoices (Sales), Purchase Orders / GRN (Procurement), Stock Adjustment Notes (Inventory), and Payment / Journal Vouchers (Finance).
  - *Why*: Ensures 100% consistent 10-row layout, identical keyboard navigation, uniform GST logic, and reliable PDF printing across all departments without duplicating thousands of lines of fragile table code.
- **Decision 2: Intelligent Report Parameter Engine**
  - *Chosen Approach*: Upgrade `ReportParameterModal` with a category/code-driven parameter schema router that renders dedicated filter fields for Sales, Inventory, Accounts, Procurement, and HR reports.
  - *Why*: Eliminates the confusing "Voucher Type" field from non-accounting reports (like POS or Stock Ledger) while preserving standard accounting filters for GL and voucher reports.
- **Decision 3: Direct Sidebar Subtab Integration**
  - *Chosen Approach*: Wire `Sidebar.tsx` to directly launch the corresponding definition or form component, ensuring that clicking any item in the left menu immediately yields the correct interactive view.
  - *Why*: Resolves the user's primary bug report where clicking definitions and forms performed no visible action.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Sidebar.tsx                                │
│   Definitions List       │       Forms List       │   Reports List      │
└───────────┬──────────────┴───────────┬────────────┴──────────┬──────────┘
            │                          │                       │
            ▼                          ▼                       ▼
┌─────────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ DepartmentDefinition-   │ │ StandardDocument-    │ │ ReportParameter-     │
│ Modal.tsx               │ │ GridForm.tsx         │ │ Modal.tsx (Revamped) │
│ - Master records table  │ │ - 10 default rows    │ │ - Domain parameters  │
│ - Code / Name / Limits  │ │ - Add/Delete row     │ │   (Sales, Stock, GL) │
│ - Search & Create form  │ │ - GST 18% Yes/Exempt │ │ - Logo toggle switch │
│ - Instant save handler  │ │ - Cash / Credit term │ │ - PDF / Excel export │
│                         │ │ - Previous balance   │ │ - Full preview sheet │
│                         │ │ - Logo print toggle  │ │                      │
└─────────────────────────┘ └──────────────────────┘ └──────────────────────┘
            │                          │                       │
            └──────────────────────────┼───────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │     AuthTenantContext &       │
                       │    LocalStorage Persistence   │
                       │ - Company branding & logo     │
                       │ - Customer/vendor balances    │
                       │ - Posted vouchers / invoices  │
                       └───────────────────────────────┘
```

### Component & Data Model Specifications
1. **`StandardDocumentGridForm.tsx`**:
   - `DocumentItemRow`:
     - `srNo: number`
     - `itemCode: string`
     - `itemName: string`
     - `uom: string`
     - `qtyDemand: number`
     - `issueQty: number`
     - `balStock: number`
     - `remarks: string`
     - `price: number`
     - `isGstTaxable: boolean` (Yes = 18%, Exempt = 0%)
     - `taxAmount: number`
     - `lineTotal: number`
   - Document Level State:
     - `billType: 'CASH' | 'CREDIT'`
     - `entityType: 'CUSTOMER' | 'VENDOR'`
     - `selectedEntityId: string`
     - `previousBalance: number`
     - `discountAmount: number`
     - `otherExpenses: number`
     - `showLogo: boolean`
2. **`DepartmentDefinitionModal.tsx`**:
   - Manages CRUD entries for 18+ definitions across 6 departments with local and tenant synchronization.
3. **`ReportParameterModal.tsx`**:
   - Dynamic parameter fields by report category (Sales POS vs Stock Ledger vs Trial Balance vs HR).
   - Integrated company logo in print preview and downloadable exports.
