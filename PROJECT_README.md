# Kumar & Co. — Project & Labour Management

This package combines the supplied Supabase backend with a React/Vite frontend that follows the approved Netlify demo structure. The demo role picker has been replaced with real Supabase email/password authentication and role-based workspaces.

## Included

- React/Vite frontend with Admin, Manager, and Supervisor workspaces.
- Supabase authentication using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Admin views for overview, Projects & Rates, Field Settings, Team & Access, and approval snapshots.
- Manager views for approvals, wage settlements, and project progress.
- Supervisor views for named-worker labour entry, entry history, and project documents.
- Existing `schema.sql`, `lib/api.js`, Supabase client, and `create-user` Edge Function.
- `netlify.toml` for Netlify deployment.

## Local setup

1. Install Node.js 18+.
2. Create a Supabase project.
3. In the Supabase SQL editor, run `schema.sql` from this folder.
4. Create two private Storage buckets named `entry-photos` and `project-documents`.
5. Deploy the Edge Function:

   ```bash
   supabase functions deploy create-user
   ```

6. Copy `.env.example` to `.env` and fill in the Project URL and anon public key. Never put the service-role key in `.env` or browser code.
7. Install and run the frontend:

   ```bash
   npm install
   npm run dev
   ```

8. Open the local URL printed by Vite. Create the first user in Supabase Authentication, then insert that user’s row in `profiles` with role `admin`. Add a project and membership row before testing the workspace.

## Production build

```bash
npm run build
npm run preview
```

For Netlify, set the same two `VITE_` variables in Site configuration → Environment variables. The included `netlify.toml` builds `dist` and supports client-side routes.

## Important security notes

The browser uses only the Supabase anon public key and the database’s Row Level Security policies. The service-role key belongs only in the Supabase Edge Function secret environment. Do not commit `.env`, passwords, or service-role credentials.

The schema tracks labour by named worker. This is intentional: it permits hours, overtime, and food allowance to be correctly calculated when a worker splits time across projects.
