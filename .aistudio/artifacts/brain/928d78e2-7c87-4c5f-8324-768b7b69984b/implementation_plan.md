# Standardized Enterprise UI/UX Theme, 6-Step Company Onboarding Wizard, and Live Theme & Layout Preview Drawer

Standardize Finance, Procurement, and Inventory modules under a unified corporate UI/UX system with consistent Pakistani business terminology, transform Company Registration into an exhaustive 6-step enterprise onboarding wizard with automated module/department/report bundling, enrich subscription plans with SMS/WhatsApp alerts and vendor limits, and introduce an interactive right-side drawer for real-time theme, layout, and login template switching.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been synthesized from your answers and corporate ERP requirements:

- **Theme Mode & Visual System**: Confirmed three-way toggle (Dark, Slate Gray, Light) across all Finance, Procurement, and Inventory modules. Standardized 60-30-10 palette with tabular figures for Pakistani Rupees (`Rs. / PKR`), FBR NTN, STRN, and WHT withholding taxes.
- **Enterprise Company Onboarding Structure**: Confirmed 6-step structured wizard (`Corporate & Legal Identity`, `Tax & Banking Compliance`, `Locations & Facilities`, `Category Auto-Connected Architecture`, `Add-Ons & Custom Extensions`, and `Subscription & Gateways`).
- **Interactive Style & Template Customizer**: Confirmed interactive right-side slide-over drawer accessible globally, allowing administrators to live-switch themes, table densities, and preview 4 distinct login form templates.
- **Tenant Isolation**: Only **Crest Textile Mills Ltd (CTM003 · FBR NTN: 1029384-9)** remains as the sole seed tenant, with legacy sample companies permanently purged across all layers.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Delivers a unified, boardroom-grade interface across all core transaction modules (Finance, Procurement, Inventory) with 10-row dynamic document grids, FBR sales tax toggles, and dual logo visibility.
  - Upgrades company registration into an enterprise-grade onboarding engine that takes SECP registration, FBR NTN/STRN, bank IBANs, and plant locations, then dynamically connects the exact operational modules, category departments, and statutory reports for 12 major Pakistani industries.
  - Expands subscription tiers with SMS alerting quotas, WhatsApp Business API transactional notifications, vendor self-service portal limits, and table density options.
  - Provides an instant right-side preview drawer for switching themes (Dark / Slate Gray / Light), table row densities, and login layout templates.
- **Target Audience / Persona**:
  - Master System Administrators configuring enterprise client tenants and subscription packages.
  - Chief Financial Officers, Procurement Heads, and Inventory Managers in Pakistani manufacturing and trading enterprises who require accurate statutory tax handling (FBR 18% GST, WHT U/S 153/236) and clean data presentation.
- **Key Value**:
  - Eliminates visual inconsistency across transactional forms and modules.
  - Reduces new enterprise tenant setup time from hours to under 2 minutes through intelligent industry-driven auto-bundling.
  - Empowers enterprises to brand their portals with custom color modes, table densities, and customized login presentations.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Transaction Processing in Finance, Procurement & Inventory**:
   - User navigates between Voucher Posting (JV/BPV/BRV/CPV/CRV), Purchase Requisitions / POs, and Goods Receipt Notes (GRN) / Warehouse Transfers.
   - All modules share uniform 10-row dynamic tables with keyboard-navigable rows (`Add Row`, delete, recalculate).
   - Consistent Pakistani financial controls: FBR NTN validation badges, STRN 18% GST calculation (Yes vs. Exempt), WHT tax deduction, previous balance display, and company logo header toggle.
2. **6-Step Enterprise Company Registration**:
   - **Step 1 (Corporate & Legal)**: Enters registered legal name, trade brand, code, SECP incorporation number, entity classification, Chamber of Commerce membership, and PSW ID.
   - **Step 2 (Tax & Banking Compliance)**: Enters FBR NTN, STRN, provincial sales tax authority (PRA / SRB / KPRA / BRA), corporate bank title, IBAN, and fiscal year calendar.
   - **Step 3 (Locations & Leadership)**: Enters registered head office, factory/plant addresses, city, industrial zone, and executive authorized contact.
   - **Step 4 (Industry Category Auto-Connection)**: User selects an industry (e.g. Textile, Manufacturing, Food, Healthcare, Construction). The wizard instantly visualizes and binds the recommended core modules, operational departments (from the 130 catalogue), and statutory reports.
   - **Step 5 (Custom Add-Ons & Overrides)**: Admins can toggle optional add-on modules, select additional departments via searchable multi-column checkboxes, and attach custom reports.
   - **Step 6 (Subscription, Gateways & Branding)**: Configures user/branch capacity limits, logo, SMS gateway quota, WhatsApp Business API alerts, and initial theme mode.
3. **Live Theme, Layout & Login Preview Drawer**:
   - Clicking the palette/settings trigger in the header opens a slick right-side drawer.
   - Administrators toggle between **Dark Mode** (`#0f172a`), **Slate Gray Mode** (`#1e293b`), and **Clean Light Mode** (`#ffffff`), seeing the entire ERP workspace adapt smoothly.
   - Admins can preview 4 distinct login form templates (Executive Split, Minimalist Modern, Floating Glass, Classic SAP Terminal) with real-time preview thumbnails and click-to-activate controls.

#### Visual Identity & 60-30-10 Palette

- **Theme Palette Tokens**:
  - **Dominant Neutral Canvas (60%)**:
    - Dark Mode: `#020617` (Deep Obsidian Canvas)
    - Slate Gray Mode: `#0f172a` (Balanced Corporate Slate)
    - Light Mode: `#f8fafc` (Clean Architectural Off-White)
  - **Structural Surfaces (30%)**:
    - Dark Mode: `#0f172a` card surfaces with `#1e293b` hairline borders
    - Slate Gray Mode: `#1e293b` card surfaces with `#334155` hairline borders
    - Light Mode: `#ffffff` card surfaces with `#e2e8f0` hairline borders
  - **Accent Budget (10%)**:
    - Primary Action: `#0284c7` (Sky Corporate) / `#0d9488` (Teal Executive)
    - Financial Positive: `#16a34a` (Emerald Clear)
    - Tax Warning / Overdue: `#d97706` (Amber Alert)
    - Critical Breach / SLA: `#dc2626` (Crimson)
- **Typography & Formatting**:
  - Display & Headings: `Plus Jakarta Sans` with natural title-casing and strict zero-pill discipline.
  - Body & Form Controls: `DM Sans` / `Plus Jakarta Sans` (13px–15px) with comfortable line-height.
  - Numerical Data & Financial Totals: Strictly `font-mono tabular-nums` for PKR currency figures, voucher numbers, NTNs, and quantities.
- **Zero-Pill Discipline & Anti-Slop Enforcement**:
  - No decorative capsules or candy pill badges around static metadata. Metadata uses clean unboxed typography with `·` or `/` separators.
  - No fake telemetry tickers, no code-comment headings (`// 01_FINANCE`), and no decorative pulsing green dots on static views.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Tri-Theme Engine (Dark / Slate Gray / Light) via Root CSS Classes**:
  - *Chosen Approach*: Implement a lightweight theme provider utilizing root class toggling (`dark`, `slate-gray`, `light`) paired with Tailwind v4 custom variants and semantic CSS variable tokens.
  - *Why*: Provides instant switching across all modules without page reloads, ensuring zero contrast degradation and full compliance with user-chosen preferences.
  - *Alternatives Considered*: CSS-in-JS style injection was rejected to avoid runtime overhead and bundle inflation.
- **Decision 2: 6-Step Enterprise Wizard with Decoupled Add-On Overrides**:
  - *Chosen Approach*: Auto-generate recommended modules, departments, and reports based on the selected industry while providing Step 5 as a dedicated add-on configurator.
  - *Why*: Accommodates both standard operations (where default industry presets are 100% correct) and complex conglomerates (e.g. textile mills with their own hospital or captive power plant) without overwhelming the user.
  - *Alternatives Considered*: A flat single-page form was rejected as it caused visual clutter and failed enterprise SECP/FBR data capture standards.
- **Decision 3: Unified Right-Side Style & Login Template Drawer**:
  - *Chosen Approach*: A slide-over panel on the right side of the screen featuring live controls for Theme, Table Density, and Login Form Templates with interactive thumbnail cards.
  - *Why*: Allows administrators to evaluate the visual impact on both the internal workspace and external login portal in real-time.

---

### 4. Technical Architecture & Data Strategy

#### Component Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ROOT APPLICATION                                     │
│                     (App.tsx / AuthTenantContext / ThemeProvider)                     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┴───────────────────────────┐
               ▼                                                        ▼
┌───────────────────────────────┐                        ┌──────────────────────────────┐
│       TOP HEADER BAR          │                        │     RIGHT-SIDE DRAWER        │
│  - Active Company (Crest)     │                        │  - Theme Mode Toggle         │
│  - Branch Switcher            │                        │    (Dark / Slate / Light)    │
│  - Quick Search & Alerts      │                        │  - Table Density Preset      │
│  - Style Drawer Trigger       │                        │  - Login Template Switcher   │
└──────────────┬────────────────┘                        └──────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 WORKSPACE LAYOUT                                       │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │    ERP MAIN SIDEBAR     │  │                  MAIN CONTENT VIEW                  │  │
│  │ - Crest Textile (16)    │  │                                                     │  │
│  │ - Finance & Accounts    │  │  ┌───────────────────────────────────────────────┐  │  │
│  │ - Procurement           │  │  │ STANDARDIZED MODULES (Pakistani Business Law) │  │  │
│  │ - Inventory & Warehouse │  │  │ - Finance: General Ledger, Vouchers, Tax WHT  │  │  │
│  │ - Production            │  │  │ - Procurement: Requisitions, POs, Vendor ATL  │  │  │
│  │ - Sales & POS Counter   │  │  │ - Inventory: Stock Ledger, GRN, Raw Cotton    │  │  │
│  │ - Company Settings      │  │  └───────────────────────────────────────────────┘  │  │
│  │                         │  │  ┌───────────────────────────────────────────────┐  │  │
│  │ [MASTER PORTAL VIEWS]   │  │  │ 6-STEP COMPANY REGISTRATION WIZARD           │  │  │
│  │ - Tenant Management     │  │  │ 1. Corporate / SECP  4. Auto-Connect Presets  │  │  │
│  │ - Register New Company  │  │  │ 2. FBR Tax & Bank    5. Custom Add-Ons        │  │  │
│  │ - Subscriptions & Plans │  │  │ 3. Plants & Contacts 6. Plan & Gateways       │  │  │
│  └─────────────────────────┘  │  └───────────────────────────────────────────────┘  │  │
│                               └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities & Schema Enhancements

1. **ClientCompany**:
   - `secpNumber`: SECP incorporation/registration string.
   - `entityType`: `'Private Limited' | 'Public Limited' | 'Sole Proprietor' | 'Partnership' | 'Listed'`.
   - `salesTaxAuthority`: `'FBR (Federal)' | 'PRA (Punjab)' | 'SRB (Sindh)' | 'KPRA' | 'BRA'`.
   - `bankDetails`: `{ bankName, accountTitle, iban, swiftCode, branchCode }`.
   - `chamberOfCommerce`: Membership ID string.
   - `assignedDepartmentIds`: List of department IDs selected from the 130 catalogue.
   - `activeModules`: List of enabled ERP modules.
   - `connectedReports`: List of statutory and operational report keys.
   - `communicationGateways`: `{ smsQuota: number; smsUsed: number; whatsappAlertsEnabled: boolean; whatsappPhone: string }`.
   - `branding`: `{ themeMode: 'dark' | 'slate-gray' | 'light'; loginTemplateId: 'split' | 'minimal' | 'glass' | 'terminal'; tableDensity: 'compact' | 'standard' }`.
2. **SubscriptionPlan**:
   - Enhanced fields: `smsQuota`, `whatsappAlerts`, `vendorPortalLogins`, `customLayoutThemes`, `supportedModes`.

---

### Implementation Milestones

1. **Phase 1: Module UI/UX & Terminology Standardization**:
   - Update Finance, Procurement, and Inventory modules with consistent Pakistani corporate terminology (FBR STRN, NTN, WHT U/S 153/236, ATL verification, Cheque/IBFT reference).
   - Verify every transactional document form connects to the standard 10-row dynamic table with FBR 18% GST toggle and logo visibility.
2. **Phase 2: Comprehensive 6-Step Enterprise Company Registration Wizard**:
   - Implement the complete 6-step form with step navigation, progress indicator, and validation.
   - Implement the auto-connection engine binding category presets for modules, departments, and reports.
   - Build Step 5 add-on selector allowing admins to seamlessly attach extra modules, departments, or custom reports.
3. **Phase 3: Subscription Plans Upgrade**:
   - Add SMS quotas, WhatsApp Business API alert toggles, vendor portal limits, and table density options to plans in `SubscriptionBillingManager.tsx`.
4. **Phase 4: Live Theme, Layout & Login Preview Drawer**:
   - Create `StylePreviewDrawer.tsx` with instant live switching between Dark, Slate Gray, and Clean Light modes.
   - Include interactive preview cards for the 4 login form templates and table density options.
5. **Phase 5: Verification & Quality Audit**:
   - Verify zero compilation errors (`compile_applet`), zero TypeScript lint errors (`lint_applet`), and seamless runtime performance.
