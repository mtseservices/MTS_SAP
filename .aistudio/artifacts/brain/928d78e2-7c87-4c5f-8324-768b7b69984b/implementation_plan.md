# Implementation Plan - ERP Enhancements & Customization Modules

## Proposed Changes

### 1. Pakistan Province & City Mapping (`src/services/pakistanRegions.ts`)
- Create a comprehensive dataset of all Pakistan provinces (Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Azad Kashmir, Gilgit-Baltistan) and their major cities (Lahore, Karachi, Faisalabad, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Sialkot, Hyderabad, etc.).
- Integrate this into `CompanyRegistrationWizard.tsx` and company profile forms so selecting a province automatically populates and filters the associated city dropdown.

### 2. PC File Upload & URL Support in Company Registration (`CompanyRegistrationWizard.tsx`)
- Add file input handlers (`FileReader` API converting uploaded PNG/JPG/WEBP files to Base64 data URLs) alongside the text URL input fields for Company Logo and Login Background.

### 3. Industry Core & Province-City Manager in Master Settings (`MasterSettingsDashboard.tsx` & new subcomponents)
- Provide a dedicated management section in Master Settings for Master Admins to add/edit Industry Cores, packages, and view/manage Province-City mappings.

### 4. Master Department Settings & Details Manager (`MasterSettingsDashboard.tsx` / `DepartmentSettingsManager.tsx`)
- Implement a Master Admin control panel for managing department structures, custom names, associated forms, reports, and tool definitions across enterprise tenants.

### 5. Customizable Dashboard Grid in Client Dashboard (`ClientDashboard.tsx`)
- Implement a drag-and-drop / reorderable and toggleable widget grid (Inventory Alerts, Recent Invoices, Performance Metrics, Financial Summary, Quick Actions) allowing client users to personalize their landing view.

## Verification Plan
- Compile applet with `compile_applet`.
- Test province-city cascading dropdowns, PC file uploads, Master Industry Core manager, and Client Dashboard widget reordering.
