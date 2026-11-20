# ATSFY Finance

Private internal finance workspace for ATSFY Technologies.

## Current operating mode: browser-local

- React + Vite frontend deployed to Vercel.
- Records stored in the browser using IndexedDB.
- No hosted database, Supabase project, or subscription required for this initial manual workflow.
- Clients, projects, GST invoice drafts/issues, receipts/payments, expenses, and PDF reports.
- Local owner PIN/passphrase gate.
- JSON backup export and restore.

## Important storage and security limits

This version stores data only in the browser profile and device where it is used. It does not sync between devices or browsers. Clearing browser site data, losing the device, or browser profile corruption can permanently remove records. Export backups regularly and keep them in a secure location.

The local PIN is a convenience lock, not server-side authentication or encryption. Anyone with access to the same browser profile/device storage may be able to access the data. Use a trusted, encrypted device. Vercel SSO protection remains enabled for the project’s default deployment domain.

For multi-device access or stronger access control, migrate to a dedicated persistent database and server-side authentication after provisioning a separate database project.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

No real financial transactions are preloaded. Start with verified source documents and actual recorded transactions only.

## Tax note

The app is an internal record-keeping tool, not a substitute for GST compliance advice. Verify the legal entity name, GSTIN, place of supply, HSN/SAC, tax rates, and invoice numbering with the company’s CA before issuing tax invoices. The business GSTIN must be independently verified; the app does not perform GST portal verification.
