# Implementation Plan - Wizard Industry Core Module Sync & Master Subscription Plans

Fix the **Company Registration Wizard** (`CompanyRegistrationWizard.tsx`) so that:
1. **Step 4 (Smart Module Bundling)** automatically updates `activeModules` using `getDefaultModulesForIndustry(industry)` whenever an Industry Core package is selected, while retaining manual toggle ability.
2. **Step 5 (Subscription & Billing)** dynamically loads persistent subscription plans defined in the **Master Subscription Billing Manager** (`system/subscriptionPlans` Firestore collection and `localStorage` fallback), displaying live pricing, max user quotas, max branch limits, SMS quotas, WhatsApp alerts, vendor logins, and business suitability attributes.

---

## User Requirements & Solution Architecture

### 1. Step 4: Industry Core Active Module Auto-Selection
- **`useEffect` Sync**: Whenever `formData.industry` changes in Step 4, retrieve default modules via `getDefaultModulesForIndustry(formData.industry)`.
- **Auto-Update**: Update `formData.activeModules` and `formData.assignedDepartmentIds` with the industry's tailored preset, allowing manual additions or removals afterwards.

### 2. Step 5: Dynamic Master Subscription Plans Integration
- **Persistent Plans Service**: Load master subscription plans from `getSubscriptionPlans()` (from `SubscriptionBillingManager` service / `system/subscriptionPlans` Firestore doc / `mts_subscription_plans` local storage).
- **Interactive Plan Selection Cards**: Render selectable cards displaying plan name, monthly/yearly price in PKR, user limits, branch limits, SMS quota, WhatsApp alert badges, and business suitability badges.
- **Form Data Binding**: Automatically update `userLimit`, `branchLimit`, `smsQuota`, `whatsappAlertsEnabled`, and plan pricing based on the selected master plan.

---

## Technical Tasks

### 1. Subscription Plans Persistence Service
- Create/ensure shared service function `getSubscriptionPlans()` that fetches stored subscription plans from Firestore (`system/subscriptionPlans`) and `localStorage` fallback.

### 2. Company Registration Wizard Updates (`src/components/master/CompanyRegistrationWizard.tsx`)
- Update Step 4 `useEffect` to set `activeModules` from `getDefaultModulesForIndustry(formData.industry)` when `industry` changes.
- In Step 5, load persistent subscription plans on mount (`useEffect`).
- Render dynamic plan cards for all configured subscription plans with user limits, branch limits, SMS quotas, WhatsApp badges, vendor logins, and business suitability.
- Auto-set plan limits upon selection.

### 3. Verification & Build
- Run `compile_applet` and `lint_applet` to verify compilation and strict TypeScript compliance.

---

## User Review Request

Please review this plan and click **Proceed** to implement these fixes in the Company Registration Wizard.
