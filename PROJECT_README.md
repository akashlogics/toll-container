# Kumar & Co. — Construction Operations System

This package combines the Supabase backend with a requirements-driven React/Vite frontend for a construction contractor. It is no longer a role-picker demo. The workflow is organized around real work: create projects, create employee logins, maintain a named Mastri/Helper roster, record site measurements, record daily labour, review submissions, and prepare project and wage reports.

## What the client can do

The contractor/admin can create projects such as a toll-road section, assign employees to projects, create manager and supervisor logins, maintain the named worker roster, review progress, and view operational reports. A manager can review and approve measurements and attendance. A site supervisor can enter named-worker attendance and site measurements from the field. The measurement form follows the supplied register: item, room/description, No, L, B, H, calculated quantity, rate, and amount. The labour workflow follows the supplied weekly sheet: Mastri, Helpers, overtime, food allowance, advances, deductions, TDS, and final payment calculations.

## Supabase setup

1. Create or open the Supabase project.
2. Run `schema.sql` in the Supabase SQL Editor if the database is new.
3. Run `schema_v2.sql` after `schema.sql`. This adds in-app alerts and reporting support.
4. Create private Storage buckets named `entry-photos` and `project-documents`.
5. Deploy the employee-creation Edge Function:

   ```bash
   supabase functions deploy create-user
   ```

6. Copy `.env.example` to `.env` and fill in the Supabase Project URL and anon public key. Never put the service-role key in browser code.
7. Create the first user in Supabase Authentication, then add a matching `profiles` row with role `admin` and `active = true`. Create at least one project before inviting employees.

## Local setup

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

Netlify can use the included `netlify.toml`; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the site environment variables.

## Security

The frontend only uses the anon public key. Access is restricted by Supabase Row Level Security policies. The service-role key must remain a Supabase Edge Function secret. The two Storage buckets should remain private. The client’s original schema already restricts project membership, approval permissions, and admin-only configuration; keep those policies enabled in production.

## Source reference

The requirements archive included a seven-page site measurement PDF, a weekly labour sheet, a daily-progress Excel workbook for `KTTRL SECTION 1`, and screenshots of an operational measurement-sheet system. Those references informed the current navigation and data-entry fields.
