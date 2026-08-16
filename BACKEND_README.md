# Kumar & Co. — Backend Integration Package

This is the real backend layer: the database schema, the Supabase client
setup, the data-access functions the React app will call, a real login
screen, and the one server-side function that needs to exist (creating
new employee logins safely).

## What's in here

- `schema.sql` — the full database. Tested against a live local
  Postgres instance, including multi-role access isolation tests
  (a Supervisor cannot see or approve another project's data; only
  Admin sees everything). Run this in the Supabase SQL editor.
- `lib/supabaseClient.js` — connects to your Supabase project using
  the two keys in `.env` (see `.env.example`).
- `lib/api.js` — every read/write the app needs: projects, BOQ rates,
  field configs, worker roster, the four entry types, wage
  settlements, photo uploads, and project documents. This is what the
  React screens will call instead of the demo's fake in-memory data.
- `Login.jsx` — a real email/password sign-in screen, replacing the
  demo's "pick a role" picker.
- `supabase/functions/create-user/` — a server-side function for the
  "Add employee" flow. This has to run on Supabase's servers, not in
  the browser, because creating a login requires a privileged key
  that must never reach client code.

## What's verified vs. what isn't (please read this part)

**Verified, with an actual database:** the schema — every table,
every security rule, the quantity-calculation trigger, and multi-role
access isolation. I ran real test queries as different simulated
users and confirmed a Supervisor cannot see another project's data,
and confirmed a Manager approving an entry only affects their own
project.

**Written carefully, but not yet run against a live Supabase
project:** `api.js`, `Login.jsx`, and the Edge Function. I don't have
a live Supabase project to test them against — I can validate SQL
locally, but I can't spin up Supabase's Auth, Storage, or Edge
Functions runtime here. These are written correctly against
Supabase's documented client patterns, but "written correctly" and
"tested against your real project" are different levels of
confidence, and I don't want to blur that.

**Not yet wired into the demo's screens.** The React demo you showed
your client still runs on fake in-memory data. Connecting each
screen (Overview, Approvals Queue, Wage Settlement, entry forms, and
so on) to these real functions is the next phase — and I'd rather do
that with your actual Supabase project in front of me, testing each
screen as I go, than guess blindly across a dozen components with no
way to catch mistakes. That's the same standard I held the schema to.

## One design change worth knowing before you show him anything new

The schema tracks labour by **named worker** (a small roster —
Mastri/Helper names), not by typing in a headcount like the current
demo and his paper sheet do. This is what makes "this worker did 4
hours on Project A and 4 on Project B today" and "his overtime this
week, summed across both projects" actually possible to calculate
correctly. It means the Labour entry screen will look different from
what he already approved — a Supervisor picks a worker from a list
instead of typing "9 helpers." Worth a one-line heads-up to him
before he sees the next version.

## Next step

1. Create the Supabase project (steps already given separately) and
   run `schema.sql`.
2. Send me the **Project URL** and **anon public** key (Settings ->
   API) — both are safe to share, they're meant to be public-facing.
   Do **not** send the service role key or database password.
3. I'll wire the demo's screens to real data and test each one
   against your actual project as I go.
