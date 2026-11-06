# Enterprise Security: Bcrypt Password Hashing & AES-GCM Encrypted Storage

Implementation plan to introduce robust password hashing using `bcryptjs` and AES-GCM authenticated encryption for session credentials in browser storage (`sessionStorage`).

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Hashing Engine**: `bcryptjs` (pure JavaScript salt & hashing implementation with configurable work factor 10).
> - **Storage Encryption**: AES-GCM encrypted session vault stored in browser `sessionStorage` with cryptographic integrity checks.

---

## 1. Overview & Core Concept

### What It Delivers
1. **`src/services/securityService.ts`**:
   - `hashPassword(password: string): Promise<string>`: Generates a salted bcrypt hash with 10 salt rounds.
   - `verifyPassword(password: string, hash: string): Promise<boolean>`: Validates user credentials against stored bcrypt hashes.
   - `encryptSessionData(data: any): string`: Encrypts sensitive auth payloads into an authenticated ciphertext string using Web Crypto API AES-GCM.
   - `decryptSessionData(ciphertext: string): any`: Decrypts and verifies session ciphertext integrity upon retrieval from `sessionStorage`.
2. **Integration into `AuthTenantContext.tsx`**:
   - Replaces plaintext password handling during user account creation, client admin logins, and credential resets with secure bcrypt verification.
   - Secures session tokens and user profile objects stored in browser storage.

---

## 2. Technical Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   User Login / Signup                  │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
        [Password Signup]        [Session Login]
                │                        │
       ┌────────▼────────┐      ┌────────▼────────┐
       │   bcryptjs      │      │  AES-GCM Cipher │
       │  (hash / salt)  │      │ (Encrypt Token) │
       └────────┬────────┘      └────────┬────────┘
                │                        │
       ┌────────▼────────┐      ┌────────▼────────┘
       │  Firestore DB   │      │  sessionStorage  │
       │ (Hashed Storage)│      │(Encrypted Vault)│
       ------------------       ------------------
```

---

## 3. Execution Steps

1. **Step 1: Install `bcryptjs` and `@types/bcryptjs`**:
   - Run `install_applet_package` for `bcryptjs` and `@types/bcryptjs`.
2. **Step 2: Create `src/services/securityService.ts`**:
   - Implement `hashPassword`, `verifyPassword`, `encryptSessionData`, and `decryptSessionData`.
3. **Step 3: Integrate into `AuthTenantContext.tsx`**:
   - Use `securityService` for credential hashing and encrypted session storage.
4. **Step 4: Verification & Build Check**:
   - Run `compile_applet` and `lint_applet` to confirm zero TypeScript errors.
