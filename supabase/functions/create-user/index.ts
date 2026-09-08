// supabase/functions/create-user/index.ts
//
// Deploy with:  supabase functions deploy create-user
//
// Why this has to be a server-side function and not a plain browser call:
// creating a new login requires Supabase's *admin* API, which only works
// with the service role key. That key must never be sent to the browser --
// it bypasses every Row Level Security rule in schema.sql. So this function
// runs on Supabase's servers, checks the caller is really an admin using
// their own (safe) login token, and only then uses the service role key
// to do the privileged part.

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
    }

    // Client scoped to the CALLER's own token -- used only to check who they are.
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const { data: callerProfile, error: profileErr } = await callerClient
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .single();

    if (profileErr || callerProfile?.role !== "admin" || !callerProfile.active) {
      return new Response(JSON.stringify({ error: "Only an active admin can add employees" }), { status: 403 });
    }

    const { name, role, phone, email, password, projectIds } = await req.json();

    if (!name || !role || !email || !Array.isArray(projectIds) || projectIds.length === 0) {
      return new Response(JSON.stringify({ error: "name, role, email and at least one projectId are required" }), { status: 400 });
    }
    if (!["manager", "supervisor"].includes(role)) {
      return new Response(JSON.stringify({ error: "role must be 'manager' or 'supervisor'" }), { status: 400 });
    }

    // Privileged client -- service role key, server-side only, never exposed to the browser.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // The admin may provide an initial password for handoff. If omitted,
    // generate one and return it once so the admin can securely relay it.
    if (password && (typeof password !== "string" || password.length < 8)) {
      return new Response(JSON.stringify({ error: "password must be at least 8 characters" }), { status: 400 });
    }
    const tempPassword = password || crypto.randomUUID().slice(0, 12);

    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400 });
    }

    const newUserId = created.user.id;

    const { error: profileInsertErr } = await adminClient
      .from("profiles")
      .insert({ id: newUserId, name, role, phone, active: true });
    if (profileInsertErr) {
      return new Response(JSON.stringify({ error: profileInsertErr.message }), { status: 400 });
    }

    const memberRows = projectIds.map((project_id) => ({ project_id, user_id: newUserId }));
    const { error: memberErr } = await adminClient.from("project_members").insert(memberRows);
    if (memberErr) {
      return new Response(JSON.stringify({ error: memberErr.message }), { status: 400 });
    }

    // In a real rollout, email/SMS the temp password instead of returning it.
    // Returned here only so the demo flow can show it to the admin to relay by hand.
    return new Response(JSON.stringify({ userId: newUserId, tempPassword }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
