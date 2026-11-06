# Receipt Voucher QR Code Generator & Verification Slip

Integrates a real-time QR code generator into the Receipt Voucher (RV) creation workflow in the Finance & Accounts module, encoding structured financial verification payload into a scannable QR matrix, paired with an interactive receipt verification modal, thermal-friendly print slip, PNG download, and cryptographic security verification hash.

> [!IMPORTANT]
> **User Review & Confirmed Decisions**
> 
> - **Display Placement**: Live reactive QR preview card within the voucher form interface alongside voucher metadata, plus an on-demand "Receipt Verification Slip" modal with full print view.
> - **Encoded Payload**: Structured JSON containing official document number, issuance date, gross amount, currency, receiving bank/cash account, tenant ID, and a SHA-256 verification hash.
> - **Quick Actions**: "Print Receipt Slip" (with print-optimized CSS media queries), "Download QR Image" (direct PNG export from SVG/canvas), and "Copy Payload" (to clipboard with confirmation toast).

---

## 1. Overview & Core Concept

In corporate treasury and finance operations, cash and bank receipts require instantaneous authenticity verification to prevent counterparty fraud and duplicate voucher logging. This enhancement adds:
1. **Dynamic Real-Time QR Generation**: As the accountant selects "Receipt Voucher (RV)", types the receipt reference, selects receiving accounts, and enters credit amounts, the QR code automatically updates in real time.
2. **Standardized Verification Payload**: Encodes structured document metadata with a deterministic security hash allowing field auditors and storekeepers to scan the QR code via mobile camera or barcode prober (`html5-qrcode`) to instantly audit against the ERP database.
3. **Official Printable Receipt Voucher**: A clean, printable financial slip complying with corporate audit standards, complete with company header, NTN/STRN tax credentials, line-item receipt breakdown, authorized signature lines, and the verification QR code.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Voucher Type Selection**:
   - The user selects `Receipt Voucher (RV)` tab in the `JournalVoucherForm`.
   - A dedicated **"Instant Verification QR Matrix"** preview panel smoothly reveals in the voucher header.
2. **Interactive Live QR Encoding**:
   - As amounts are entered in the credit/debit grid, the QR code regenerates with the current gross total and currency.
   - A live security badge shows the computed verification checksum (e.g. `SHA-256: 7f8a...3d9c`).
3. **One-Click Quick Actions**:
   - **Preview & Print Slip**: Opens a modal displaying the corporate Receipt Voucher slip ready for physical printing (via `window.print()` with `@media print` rules hiding surrounding navigation).
   - **Download PNG**: Uses canvas conversion to export high-resolution QR PNG for digital attachment or WhatsApp dispatch.
   - **Copy Verification JSON**: Copies the exact JSON verification payload to clipboard with an animated confirmation checkmark.
4. **Post-Submission Verification**:
   - Once posted to Firebase, the success screen retains a direct link to re-print or view the receipt QR slip anytime.

### Visual Identity & Theme

- **Palette**: Dark slate canvas (`#020617` / `bg-slate-950`), structural card surface (`#0f172a` / `bg-slate-900`), border hairlines (`#1e293b` / `border-slate-800`), with emerald accents (`#10b981` / `emerald-400`) representing verified cash receipts.
- **Typography & Tabular Numbers**: Tabular numerals (`tabular-nums font-mono`) for all receipt totals, account numbers, and currency figures.
- **Print Layout**: In print mode, background switches to pristine white (`#ffffff`) with deep black typography (`#000000`), crisp 1px borders, and high-contrast QR placement suitable for both laser printers and thermal receipt devices.
- **Zero-Pill Discipline**: Status and verification metadata displayed as unboxed text separated by subtle bullets (`·`) rather than heavy pill tags.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side SVG QR Rendering (`qrcode.react`)**:
  - *Chosen Approach*: Render via `QRCodeSVG` from the existing `qrcode.react` package with an off-screen canvas bridge for PNG download.
  - *Why*: Zero network overhead, instant millisecond updates as user types amounts, and zero external API dependencies.
  - *Alternatives Considered*: Backend QR generation endpoint—rejected due to unnecessary server latency and offline unfriendliness.

- **Decision 2: Deterministic Verification Hash**:
  - *Chosen Approach*: Generate a deterministic SHA-256 string from `[voucherNo + tenantId + totalAmount + date + accountCode]` using standard Web Crypto API (`crypto.subtle.digest`).
  - *Why*: Allows cross-checking voucher integrity offline without exposing private server secrets.

- **Decision 3: Non-Intrusive Integration**:
  - *Chosen Approach*: Activate the prominent QR display specifically when `voucherType === 'RECEIPT'`, while maintaining full backward compatibility with Journal (JV), Payment (PV), and Contra (CV) vouchers.
  - *Why*: Prevents visual clutter for pure adjustment journals while delivering high fidelity for receipt confirmation documents.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Finance & Accounts Module                         │
│                    (FinanceAccountsModule.tsx)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         Opens "New Voucher"
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        JournalVoucherForm                              │
│                                                                        │
│  ┌─────────────────────────┐              ┌─────────────────────────┐  │
│  │  Voucher Type Selector  │              │ Cost Center & Currency  │  │
│  │    [JV | RV* | PV | CV] │              │    [PKR | USD | EUR]    │  │
│  └────────────┬────────────┘              └─────────────────────────┘  │
│               │                                                        │
│               ▼                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Receipt QR Card (Active on RV)                                 │  │
│  │   • Live SVG QR Matrix (<QRCodeSVG value={qrPayload} />)         │  │
│  │   • Security Hash (SHA-256 Digest)                               │  │
│  │   • [Preview Slip]  [Download PNG]  [Copy Payload]               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Double-Entry Transaction Rows (Debit / Credit)                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                     Clicks "Preview & Print Slip"
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    ReceiptVoucherSlipModal                             │
│                                                                        │
│  • Corporate Header (Company Name, NTN, STRN, Logo)                    │
│  • Receipt Document Info (RV Number, Date, Received From)              │
│  • Account Breakdown & Amount in Words                                 │
│  • High-Resolution Verification QR Matrix                              │
│  • Authorized Signatures (Cashier, Accountant, Auditor)                │
│  • Actions: [Print Slip]  [Download PNG]  [Close]                      │
└────────────────────────────────────────────────────────────────────────┘
```

### Encoded QR Payload Schema

```json
{
  "doc": "RV-2026-104928",
  "type": "RECEIPT_VOUCHER",
  "tenant": "tenant_crest",
  "company": "Crest Textiles Mills Ltd",
  "date": "2026-11-05",
  "amount": 2500000,
  "currency": "PKR",
  "account": "1020 - Meezan Bank Operations",
  "costCenter": "Corporate Accounts & Treasury",
  "ref": "LC-ADV-99201",
  "payer": "Global Apparel Sourcing B.V.",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "verifyUrl": "https://mts-sap.vercel.app/verify/RV-2026-104928"
}
```

### File Changes

1. **New Component `src/components/client/finance/ReceiptVoucherSlipModal.tsx`**:
   - Clean printable modal displaying the formal corporate receipt voucher with print CSS styles (`@media print`), download QR PNG handler, and signature areas.
2. **Updated Component `src/components/client/finance/JournalVoucherForm.tsx`**:
   - Integrate QR code generation when `voucherType === 'RECEIPT'` (or selectable for all).
   - Real-time payload generation and SHA-256 checksum computation via Web Crypto API.
   - Quick action bar: "Receipt Slip", "Download QR", "Copy JSON".
