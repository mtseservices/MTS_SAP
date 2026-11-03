# Implementation Plan: Client Admin Labeling & Complete Submission Persistence

## Overview
1. **Relabel Step 7 Credentials Section**: Update all headings, subheadings, labels, and tooltips in Step 7 of `CompanyRegistrationWizard.tsx` to explicitly say **"Client Company Administrator & Tenant Owner Account"** (clarifying that these are the credentials for the client company owner being registered, NOT the Master Admin).
2. **Audit & Enhance Submission Handler (`handleSubmit`)**:
   - Ensure every piece of accumulated data from Steps 1–7 is captured and validated:
     - **Step 1**: `name`, `registeredName`, `entityType`, `secpNumber`, `slug`
     - **Step 2**: `ntn`, `strn`, `salesTaxAuthority`, `bankName`, `accountTitle`, `iban`
     - **Step 3**: `address`, `city`, `province`, `phone`, `email`, `plantLocations`
     - **Step 4**: `industry`, `category`, `activeModules`, `assignedDepartmentIds`
     - **Step 5**: `subscriptionPlan`, `userLimit`, `branchLimit`, `billingCycle`, `smsQuota`, `whatsappAlertsEnabled`
     - **Step 6**: `theme`, `themeMode`, `loginTemplateId`, `logoUrl`, `backgroundUrl`
     - **Step 7**: `adminName`, `adminEmail`, `adminPhone`, `adminUsername`, `adminPassword`, `branches`
   - Persist to both Firestore (`tenants` and `companies` collections) and LocalStorage (`mts_custom_companies`, `mts_branches_{id}`).
   - Automatically trigger instant tenant switch and login launch to the newly provisioned workspace (`https://mts-sap.vercel.app?company=SLUG`).

---

## Proposed Technical Changes

### 1. `CompanyRegistrationWizard.tsx`
- **UI Relabeling**:
  - Change Section Header in Step 7 to: `Client Company Administrator & Tenant Owner Account`.
  - Update input field labels: `Client Admin Full Name`, `Client Admin Email`, `Client Admin Username`, `Client Admin Password`.
  - Update security note: "SECURITY NOTE: These credentials belong to the Client Company Owner/Admin and grant full control over their tenant workspace."
- **Data Validation & Submission Handler**:
  - Audit all fields before persisting to ensure fallbacks exist for any blank input.
  - Persist full company model with `adminName`, `adminEmail`, `adminPhone`, `adminUsername`, `adminPassword`, and `branches` array to:
    1. LocalStorage (`mts_custom_companies`, `mts_branches_${compId}`)
    2. Firestore (`companies/{compId}` and `tenants/{tenantId}`)
  - On launch button click, call `login('CLIENT', createdCompanyDetails.slug)` or `switchTenantBySlug` to perform an instant auto-login launch into the newly created client workspace.

---

## Verification Plan
1. Test Step 7 UI labels: Verify that all headings and inputs clearly say "Client Company Administrator & Tenant Owner Account".
2. Test full registration flow: Navigate through Steps 1 to 7, fill company data, click "Finalize & Launch Workspace", and verify complete data is saved in Firestore and LocalStorage.
3. Test instant auto-login launch to verify seamless transition to the new client dashboard.
4. Run `compile_applet` and `lint_applet` to confirm zero errors.
