# Implementation Plan - Robust Tenant Slug Parsing & Keyword-Based Auto-Provisioning

## Proposed Changes

### 1. `src/components/common/TenantRouteHandler.tsx`
- Refine slug extraction and parsing logic to cleanly handle `/login/:slug`, `/company/:slug`, `/tenant/:slug`, and query parameters (`?company=...` or `?tenant=...`).
- Implement robust validation and automated invocation of `ensureCompanyExists` for any valid non-empty slug.

### 2. `src/context/AuthTenantContext.tsx`
- Enhance `ensureCompanyExists` to scan slug keywords (e.g. `food`, `textile`, `steel`, `pharma`, `tech`, `trading`) and dynamically assign tailored industry profiles, categories, and default active modules upon auto-provisioning.

## Verification Plan
- Run `lint_applet` to check TypeScript correctness.
- Run `compile_applet` to ensure successful build.
- Test accessing `/login/fusionfoodfaisalabad` to verify it auto-provisions with Food & Beverage industry profile and opens the client login page successfully.
