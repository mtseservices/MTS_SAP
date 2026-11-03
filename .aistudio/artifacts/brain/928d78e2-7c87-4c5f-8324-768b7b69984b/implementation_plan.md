# Implementation Plan - QR Code-Based Client Login

## Proposed Changes

### `src/components/common/ClientLoginView.tsx` (or equivalent client login component)
- Add a "QR Code Login" option / tab on the client-specific login page.
- **QR Code Login Features**:
  - Displays a secure session QR code graphic (with tenant name, timestamp, and secure token).
  - Includes a "Simulate Mobile App Scan" helper button that opens a simulated mobile approval dialog.
  - Upon clicking "Approve Login on Mobile", completes authentication and logs in instantly as the tenant administrator without password entry.

## Verification Plan
- Run `lint_applet` to verify TypeScript type correctness.
- Run `compile_applet` to ensure successful build.
- Visually test QR code login generation and simulated mobile approval flow.
