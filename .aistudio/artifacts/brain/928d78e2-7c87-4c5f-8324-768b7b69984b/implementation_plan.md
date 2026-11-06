# Unified BaseFormLayout & Transaction Form Architecture

Architectural plan to standardize all enterprise transaction forms across Finance, Procurement, and HR modules using a reusable, accessible `BaseFormLayout` with sticky action controls, adaptive responsive containment, and standardized list-level creation triggers.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters were confirmed during user clarification:
> - **View Mode**: Full-page view with contextual breadcrumb navigation and sticky action header (replacing restrictive modals with full-width workspaces).
> - **Header Action Suite**: Save Draft, Post/Submit (Primary CTA), Print Preview, and Discard (with dirty-state confirmation).
> - **Responsive Container Width**: Adaptive max-width (`max-w-5xl` for standard structured forms, `max-w-7xl` for multi-column grid ledgers).
> - **List View Integration**: Standardized 'Create New' primary action buttons positioned consistently in module list headers.

---

## 1. Overview & Core Concept

### What It Delivers
A unified enterprise form shell (`BaseFormLayout`) implemented in `src/components/common/BaseFormLayout.tsx` that provides:
1. **Contextual Navigation**: Interactive breadcrumb trail (e.g. `Finance / Vouchers / New Receipt Voucher`) allowing operators to return safely to registers with uncommitted draft safeguards.
2. **Sticky Header Actions**: Pinned top action bar featuring:
   - **Discard**: Cancel edits with prompt confirmation if changes exist.
   - **Print Preview**: Opens quick receipt/slip print modal or document view.
   - **Save Draft**: Persists in-progress work to company-scoped local storage without validation blocks.
   - **Post / Submit**: Executes validation, signs or hashes payload, and commits document to Firestore cloud.
3. **Adaptive Form Canvas**:
   - `standard` variant: `max-w-5xl` for entity forms (e.g., HR Employee onboarding, Department setup).
   - `grid-ledger` variant: `max-w-7xl` for high-density tabular ledgers (e.g., Finance Journal/Receipt Vouchers, Procurement Purchase Orders & Goods Receipt Notes).
4. **Unified 'Create New' Buttons**:
   - Consistent primary action triggers across `FinanceAccountsModule`, `ProcurementModule`, and `HrPayrollModule` with identical visual weight, keyboard access, and active state indicators.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Color Discipline (60-30-10)**:
  - 60% neutral canvas (`bg-slate-950` / `bg-slate-900`)
  - 30% structural surfaces (`border-slate-800`, `bg-slate-900/60` cards)
  - 10% module-specific accent highlights (Emerald for Finance, Amber for Procurement, Cyan for HR)
- **Zero-Pill Discipline**:
  - Metadata rendered as clean unboxed text with `·` typographic separators (e.g. `FY 2026 · PK-LHE-01 · PKR Base Currency`).
  - No decorative colored capsule badges on static text.
- **Top Bar & Sticky Header Contract**:
  - Pinned bar containing breadcrumb wordmark on left, document title and draft badge in center, and action button cluster on right with single-line controls (`whitespace-nowrap shrink-0`).
- **Tabular Figures**:
  - Monospace tabular numerals (`tabular-nums font-mono`) across all debit/credit lines, unit prices, tax calculations, and gross amounts.

### Component Layout & Spatial Rhythms
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Top Bar: [Module] / [Register] / [Document Reference]       [Draft Saved]   │
│  Sticky Actions: [ Discard ]   [ Print ]   [ Save Draft ]   [ Post / Submit] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Adaptive Container (max-w-5xl or max-w-7xl)                                │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │ Document Header Fields: Date, Reference, Party/Account, Currency     │   │
│   ├──────────────────────────────────────────────────────────────────────┤   │
│   │ Transaction Line Items / Ledger Grid (Tabular Numeral Inputs)        │   │
│   ├──────────────────────────────────────────────────────────────────────┤   │
│   │ Summary Strip: Subtotals, FBR Tax, Freight, Net Totals, QR Preview   │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Full-Page Canvas vs. Modal Overlays
- **Chosen Approach**: Full-page workspace view with breadcrumbs over modal dialogs.
- **Why**: Multi-row ledgers (voucher debit/credit lines, PO line items with GST/tax breakdown) require wide horizontal space (1200px+) and vertical scrolling that feel cramped and error-prone in modal popups.
- **Alternatives Considered**: Slide-over drawer (too narrow for 10-column financial grids) and centered modals (cluttered on small screens).

### Decision 2: Centralized vs. Decentralized Draft Saving
- **Chosen Approach**: Embedded draft auto-save hook in `BaseFormLayout` combined with module-specific serializer callbacks.
- **Why**: Guarantees that draft status ("Draft auto-saved 2s ago") and draft reset logic work identically across Finance, Procurement, and HR without duplicating timer logic.

---

## 4. Technical Architecture & Component Hierarchy

```
                   ┌───────────────────────────────┐
                   │    App Navigation / Router    │
                   └───────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────────┐  ┌─────────▼───────────┐  ┌──────────▼──────────┐
│FinanceAccountsModule│  │  ProcurementModule  │  │   HrPayrollModule   │
│ (List + Create CTA) │  │ (List + Create CTA) │  │ (List + Create CTA) │
└────────┬────────────┘  └─────────┬───────────┘  └──────────┬──────────┘
         │                         │                         │
         │ activeSubTab='newVoucher'│ isCreating='true'       │ isAddEmployee='true'
         │                         │                         │
┌────────▼─────────────────────────▼─────────────────────────▼──────────┐
│                           BaseFormLayout                              │
│  - Sticky Action Header (Discard, Print, Save Draft, Post/Submit)     │
│  - Breadcrumb Path & Document Identity                                │
│  - Auto-Save Draft Status Indicator                                   │
│  - Adaptive Container Width (5xl standard / 7xl grid-ledger)          │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────────┐  ┌─────────▼───────────┐  ┌──────────▼──────────┐
│ JournalVoucherForm  │  │PurchaseOrderFormGrid│  │  EmployeeRecordForm │
│  (Finance Voucher)  │  │ (Procurement PO/GRN)│  │    (HR Onboarding)  │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 5. Execution Steps

1. **Step 1: Create `src/components/common/BaseFormLayout.tsx`**:
   - Implement the unified shell with props for `title`, `subtitle`, `breadcrumbs`, `status`, `variant` (`standard` | `grid-ledger`), `isSubmitting`, `onSaveDraft`, `onSubmit`, `onPrintPreview`, `onDiscard`, and auto-save timestamp.
   - Embed standard keyboard shortcuts (`Ctrl+S`, `Ctrl+Enter`, `Esc`).

2. **Step 2: Refactor Finance Transaction Form (`JournalVoucherForm.tsx`)**:
   - Wrap the voucher form within `BaseFormLayout` using `variant="grid-ledger"`.
   - Connect header actions to the existing Firestore ledger submission and draft state.
   - Verify QR code generator preview and bulk slip integration.

3. **Step 3: Refactor Procurement Transaction Form (`ProcurementModule.tsx` & `StandardDocumentGridForm.tsx`)**:
   - Upgrade the PO/GRN creation flow into a full-page view inside `BaseFormLayout`.
   - Standardize the 'Create Purchase Order' button at the list view level.

4. **Step 4: Refactor HR Employee Transaction Form (`HrPayrollModule.tsx`)**:
   - Extract the employee record modal into a dedicated full-page `EmployeeRecordForm` hosted in `BaseFormLayout` with `variant="standard"`.
   - Update 'Add Employee Record' in the list view to trigger the unified layout.

5. **Step 5: Verification & Quality Audit**:
   - Execute `compile_applet` and `lint_applet` to guarantee type safety.
   - Verify consistent visual styling, responsive widths, and keyboard affordances.
