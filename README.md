# ATSFY Finance

Owner-operated internal finance workspace for ATSFY Technologies.

## Included MVP
- Client and project registers
- GST invoice drafts and PDF copies (Original for Recipient / Duplicate for Supplier)
- Manual payment and receipt recording
- Expense register and management summaries
- Supabase email/password authentication with owner-scoped row-level security

## Local setup
1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for a dedicated Supabase project.
4. Apply `supabase/migrations/202611200001_finance_schema.sql`.
5. Disable public sign-ups in Supabase Auth and create the owner account.
6. Run `npm run dev`; create a production build with `npm run build`.

## Security and accounting
- Never expose a Supabase service-role key in browser variables.
- Database tables use authenticated owner-scoped row-level security.
- Keep the repository private: this application handles sensitive finance records.
- Verify the business GSTIN against the GST portal before issuing tax invoices.
- Review tax classification, SAC, place of supply, rates, reverse-charge treatment and ITC eligibility for each transaction. This is an internal record system, not GST return filing software.
- No production database is connected by default; configure a dedicated Supabase project before use.
