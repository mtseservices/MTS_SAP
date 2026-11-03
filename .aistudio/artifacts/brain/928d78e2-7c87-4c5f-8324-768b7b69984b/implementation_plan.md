# Performance & Speed Optimization Plan for Onboarding & Permanent Deletion

This plan addresses performance bottlenecks in company registration and permanent deletion, replacing blocking network operations and artificial delays with instant optimistic UI updates and background parallel database synchronization.

## Confirmed User Decisions

- **Company Registration Submission**: Instant optimistic state save to memory and `localStorage` with non-blocking background Firestore sync (< 50ms user-perceived time).
- **Permanent Deletion (Single & Bulk)**: Immediate optimistic UI state removal with parallel background Firestore deletion (`Promise.allSettled`).

---

## 1. Root Cause Analysis & Technical Strategy

### Bottlenecks Identified

1. **Company Onboarding (`CompanyRegistrationWizard.tsx`)**:
   - Sequential `await new Promise(r => setTimeout(...))` artificial delay calls (accumulating nearly 1 second of wasted blocking time).
   - Sequential blocking network calls to Firestore (`await setDoc(tenants)` then `await setDoc(companies)`).
   - Delayed launch redirect waiting for network roundtrips.

2. **Permanent Deletion & Bulk Purge (`TenantManagement.tsx` & `AuthTenantContext.tsx`)**:
   - Sequential `for...of` loop executing `await deleteDoc(...)` calls one by one across network latency.
   - UI blocked with spinner modal until all network deletion requests finished.

---

## 2. Optimized Solution Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Action Trigger                             │
│               (Submit Form / Permanent Delete Button)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │  Instant Optimistic Update (< 10ms)  │
                 ├──────────────────────────────────────┤
                 │ • Update React State immediately     │
                 │ • Persist to LocalStorage            │
                 │ • Close modal / Navigate to workspace│
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ Parallel Background Sync (Non-Block) │
                 ├──────────────────────────────────────┤
                 │ • Promise.allSettled([               │
                 │     deleteDoc(companies, id),        │
                 │     deleteDoc(tenants, tenantId)     │
                 │   ])                                 │
                 └──────────────────────────────────────┘
```

---

## 3. Detailed Implementation Steps

### Step 1: Optimize Company Registration Wizard (`CompanyRegistrationWizard.tsx`)
- Remove all artificial `setTimeout` delay loops from `handleSubmit`.
- Optimistically execute `registerNewCompany` and `localStorage` sync immediately.
- Fire Firestore writes in parallel background execution (`Promise.all([setDoc(tenants), setDoc(companies)])`).
- Immediately set `createdCompanyDetails` to transition to the success / auto-launch screen without waiting for database response.

### Step 2: Optimize Single & Bulk Permanent Deletion (`TenantManagement.tsx` & `AuthTenantContext.tsx`)
- Update `permanentDeleteCompany` to apply optimistic state filtering instantly.
- In `handleConfirmPermanentDelete` and `handleConfirmBulkDelete`:
  - Optimistically purge selected company IDs from `allCompanies` state memory and `localStorage` immediately.
  - Close confirmation modals instantly.
  - Execute background deletions concurrently using `Promise.allSettled`.

---

## 4. Verification & Testing

- Run `lint_applet` and `compile_applet` to ensure clean TypeScript types and zero build errors.
- Test company registration submission to verify instant submission response.
- Test single and bulk permanent deletion to verify instant UI removal and non-blocking background cleanup.
