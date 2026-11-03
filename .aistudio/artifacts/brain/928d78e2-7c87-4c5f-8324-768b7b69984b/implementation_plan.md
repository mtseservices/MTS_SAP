# Implementation Plan - Client Login Isolation, Google Sign-In, Dashboard Master Lock & Dynamic Favicon

Refine client tenant experience by isolating client login details to the single company, adding Firebase Google Sign-In, restricting Master User switching on client dashboards, and dynamically setting the browser favicon to the company logo.

## Proposed Changes

### 1. Client Login Page Data & Details Isolation
#### `src/components/common/MasterLoginModal.tsx`
- When `isClientUrl` is true (`?company=SLUG` present in URL):
  - Strictly isolate views to `currentComp` (the URL-matched company).
  - Hide any dropdowns, lists, or access guides pertaining to other companies.
  - Render exclusively `currentComp.name`, `currentComp.logoUrl`, `currentComp.ntn`, and verified company badges.

### 2. Google Sign-In Integration for Client Logins
#### `src/components/common/MasterLoginModal.tsx`
- Add a **"Sign in with Google"** action button in the client login form using `signInWithPopup(auth, googleProvider)`.
- Upon successful authentication with Google, auto-link the Google account session to the active company client admin profile and complete login.
- Provide clear inline error handling if Google authentication fails or popup is blocked.

### 3. Restrict Master Switcher on Client Dashboard
#### `src/components/common/Header.tsx`
- Ensure Master Portal toggle buttons (`ShieldAlert` pill) and Master switch options are **completely hidden** whenever the logged-in user is a Client User (`!currentUser.isMaster` or `currentUser.role !== 'MASTER_ADMIN'`).
- On client dashboards, disable switching to other companies if the user is a client user, so client administrators remain locked within their tenant scope.

### 4. Dynamic Company Logo Favicon
#### `src/context/AuthTenantContext.tsx`
- Add a `useEffect` that listens to `currentCompany` changes and `companyFromUrl`.
- If `currentCompany.logoUrl` exists:
  - Dynamically find or create `<link rel="icon">` in `document.head`.
  - Update its `href` to `currentCompany.logoUrl`.
- Fall back gracefully to the default logo icon when no custom logo is uploaded.

---

## User Verification Instructions
1. **Client Tenant URL Test**:
   - Navigate to `?company=SLUG` (e.g. `?company=crest`).
   - Verify that ONLY Crest details appear, with no Master switchers or other companies shown.
2. **Google Sign-In Test**:
   - Click "Sign in with Google" on the client login modal to authenticate via Google popup.
3. **Client Dashboard Lock Test**:
   - Sign in as a client user and check the top header — verify that no "Master Portal" switch button exists.
4. **Dynamic Favicon Test**:
   - Check the browser tab icon — verify it updates to the client's uploaded company logo URL.
