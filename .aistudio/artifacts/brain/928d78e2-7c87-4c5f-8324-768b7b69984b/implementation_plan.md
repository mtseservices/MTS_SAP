# Complete Archiving & Permanent Deletion Workflow for Master Tenant Management

Comprehensive solution ensuring archived companies remain safely stored in the Archive tab until restored via "Undo", and permanently deleting companies from both Firestore database and local state with an explicit confirmation modal so they never reappear in Tenant List or Archive.

## Confirmed User Decisions

- **Deletion Behavior**: Permanent deletion purges company records from Firestore database (`companies` and `tenants` collections), `localStorage`, and active state memory.
- **Confirmation UX**: Displays an explicit glassmorphism confirmation modal prompting confirmation before initiating irreversible permanent deletion.
- **Master Admin Views**: Separate Active Tenants (`!isArchived`) and Archived Companies (`isArchived`) into distinct, tabbed views in Master Tenant Management.

---

## 1. Overview & Core Concept

When a Master Admin archives a company, the system updates `isArchived = true` and transfers the tenant to the **Archive Vault** tab. The company stays in the Archive Vault indefinitely until the user clicks **Undo / Restore**.

When the user selects **Permanent Delete** from either the Tenant List or the Archive Vault:
1. An explicit glassmorphic confirmation modal opens displaying the company name, code, tenant ID, and warning notice.
2. Upon user confirmation:
   - The company document is deleted from Firestore `companies` and `tenants` collections (`deleteDoc`).
   - The company ID is added to `mts_deleted_companies` in `localStorage` and purged from `mts_custom_companies`.
   - All associated company metadata keys (`mts_sub_${id}`, `mts_roles_${id}`, `mts_depts_${id}`, `mts_branches_${id}`) are purged.
   - `allCompanies` memory state is updated immediately so the company never appears in either the Tenant List or the Archive Vault.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Archive Flow**:
   - Master Admin clicks **Archive** on a company card in the Tenant List.
   - Company status transitions to `INACTIVE` with `isArchived: true`.
   - Card disappears from Tenant List and appears under **📦 Archive (Count)** tab.

2. **Restore Flow**:
   - Master Admin navigates to the **📦 Archive** tab and clicks **↩️ Undo / Restore**.
   - Company status transitions back to `ACTIVE` with `isArchived: false`.
   - Card moves back to the active **🏢 Tenant List** tab.

3. **Permanent Deletion Flow**:
   - Master Admin clicks **Permanent Delete** on any archived (or active) company card.
   - A high-contrast glassmorphism confirmation modal pops up (`bg-slate-950/90 backdrop-blur-xl border-rose-500/40`).
   - Master Admin clicks **"Confirm Permanent Delete"**.
   - System executes Firestore `deleteDoc` for both company and tenant collections, clears `localStorage`, purges state, and displays a success notification.

---

## 3. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Master Admin Portal                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   🏢 Active Tenant List Tab                  📦 Archive Vault Tab
   (!comp.isArchived)                         (comp.isArchived)
               │                                         │
               ├── [Archive] ───────────────► Set isArchived=true
               │                                         │
               └── [Permanent Delete] ◄───── [Permanent Delete]
                         │
                         ▼
          ┌──────────────────────────────┐
          │ Permanent Delete Modal       │
          │ (Explicit Confirmation)      │
          └──────────────┬───────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Firestore & Storage Purge        │
        ├──────────────────────────────────┤
        │ 1. deleteDoc(companies, id)      │
        │ 2. deleteDoc(tenants, tenantId)  │
        │ 3. Purge localStorage keys       │
        │ 4. Filter allCompanies state     │
        └──────────────────────────────────┘
```

---

## 4. Implementation Steps

1. **AuthTenantContext (`permanentDeleteCompany`)**:
   - Extend `permanentDeleteCompany` to delete documents from both `companies` and `tenants` Firestore collections.
   - Clean up associated local storage keys (`mts_sub_*`, `mts_roles_*`, `mts_depts_*`, `mts_branches_*`).
   - Ensure the deleted company ID is recorded in `mts_deleted_companies` so it cannot reappear on page refresh.

2. **TenantManagement Component (`TenantManagement.tsx`)**:
   - Add state for `deletingCompanyModal: ClientCompany | null`.
   - Render explicit glassmorphism confirmation modal when `deletingCompanyModal` is active.
   - Provide "Confirm Permanent Delete" button with loading state and warning text.
   - Ensure Archive tab cleanly renders archived tenants and provides instant **Undo / Restore** and **Permanent Delete** triggers.

3. **Validation & Verification**:
   - Run `lint_applet` and `compile_applet` to verify clean build without errors.
