# Implementation Plan - Firebase Google Authentication & Tenant Profile Auto-Linking

Expose a native `loginWithGoogle` method in `AuthTenantProvider`, allowing client users to authenticate via Google Firebase OAuth (`signInWithPopup`), auto-linking Google credentials directly to the client company's tenant admin profile and persisting active sessions to Firestore.

## Proposed Changes

### 1. Context Extension in `AuthTenantContext.tsx`
#### `src/context/AuthTenantContext.tsx`
- Add `loginWithGoogle: (companySlug?: string) => Promise<void>` to `AuthTenantContextType` interface and provider context.
- Implement `loginWithGoogle` logic:
  - Invokes `signInWithPopup(auth, googleProvider)`.
  - Extracts Google user metadata (`uid`, `email`, `displayName`, `photoURL`).
  - Resolves target company by `companySlug` or active `currentCompany`.
  - Links Google account as `CLIENT_ADMIN` for that specific tenant company.
  - Persists active session document in Firebase Firestore (`sessions` collection) and local storage.
  - Logs audit log entry: `Google Authentication for tenant {companyName}`.

### 2. UI Button Integration in `MasterLoginModal.tsx`
#### `src/components/common/MasterLoginModal.tsx`
- Connect the **"Continue with Google Account"** button directly to `loginWithGoogle(activeSlug)`.
- Show loading indicator while Google popup is active.
- Handle popup cancellations or errors gracefully with clear user feedback.

---

## User Verification Instructions
1. **Google Sign-In Execution Test**:
   - Open client login page (e.g. `/login/fusionfoodfaisalabad` or `/login/crest`).
   - Click "Continue with Google Account".
2. **Profile Linking Verification**:
   - Complete Google login via popup.
   - Verify that you are signed in as `CLIENT_ADMIN` for that specific tenant with your Google name & email displayed in the header.
3. **Session Persistence Test**:
   - Refresh the page and verify that your authenticated Google tenant session remains active.
