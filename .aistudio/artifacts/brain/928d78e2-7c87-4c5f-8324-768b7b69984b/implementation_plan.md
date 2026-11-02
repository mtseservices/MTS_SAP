# Implementation Plan - Enterprise ERP Enhancements & Company Registration Wizard

## Proposed Changes

### 1. Secure Session Persistence in `AuthTenantContext.tsx`
- Ensure `setPersistence(auth, browserLocalPersistence)` is correctly configured in Firebase Auth.
- Synchronize session state across browser reloads and ensure seamless recovery for both Master Admin and Client tenant sessions.

### 2. Company Registration Wizard Enhancements (`CompanyRegistrationWizard.tsx`)
- **Subscription Plan Selector**: Add a dedicated subscription tier selection step or field (Enterprise, Professional, Standard Business) with pricing details and quota mapping.
- **Logo & Background Image Upload**: Provide input fields / image upload options for Company Logo (`logoUrl`) and Login Form Background Image (`loginBgUrl`), which will dynamically style the tenant's login portal.
- **Industry-Based Auto-Connection**: Automatically update assigned departments, modules, forms, and reports based on the selected business category/industry package.
- **Password Preview (Eye Toggle)**: Add a password visibility toggle (eye icon) on the admin password creation field.
- **Live Bill / Summary Preview**: Provide a comprehensive "Live Bill & Enterprise Summary Preview" step before final submission so the master admin can review quotas, modules, pricing, and visual assets.

### 3. Data Cleansing
- Verify that `INITIAL_CLIENT_COMPANIES` in `tenantResolver.ts` is completely empty (no sample companies), allowing the master admin to create their own companies from scratch.

## Verification Plan
- Compile applet with `compile_applet`.
- Test registration wizard steps, logo/background upload preview, subscription plan selection, and session persistence across page reloads.
