import { supabase } from "./supabaseClient";

/* ============================== AUTH ============================== */

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/* ============================== PROFILE & TEAM ============================== */

export async function fetchMyProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

// Admin only (RLS enforces this) -- everyone who can log in, across all roles.
export async function fetchAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function setProfileActive(userId, active) {
  const { error } = await supabase.from("profiles").update({ active }).eq("id", userId);
  if (error) throw error;
}

// Creating a brand-new login can't happen from the browser with the anon
// key -- it needs the service role key, which must never reach client code.
// This calls a Supabase Edge Function (see supabase/functions/create-user)
// that does the privileged part server-side, after checking the caller is
// an admin.
export async function createEmployee({ name, role, phone, email, projectIds }) {
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: { name, role, phone, email, projectIds },
  });
  if (error) throw error;
  return data;
}

/* ============================== PROJECTS & MEMBERSHIP ============================== */

export async function fetchMyProjects() {
  // RLS already limits this to projects the logged-in user belongs to
  // (or every project, if they're an admin) -- no extra filtering needed.
  const { data, error } = await supabase.from("projects").select("*").eq("archived", false).order("created_at");
  if (error) throw error;
  return data;
}

export async function fetchProjectMembers(projectId) {
  const { data, error } = await supabase
    .from("project_members")
    .select("user_id, profiles(id, name, role, active)")
    .eq("project_id", projectId);
  if (error) throw error;
  return data.map((r) => r.profiles);
}

export async function setProjectMembers(projectId, userId, shouldBeMember) {
  if (shouldBeMember) {
    const { error } = await supabase.from("project_members").upsert({ project_id: projectId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);
    if (error) throw error;
  }
}

/* ============================== BOQ ITEMS (RATES) ============================== */

export async function fetchBoqItems(projectId) {
  const { data, error } = await supabase.from("boq_items").select("*").eq("project_id", projectId).order("code");
  if (error) throw error;
  return data;
}

export async function updateBoqItem(id, patch) {
  const { error } = await supabase.from("boq_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function insertBoqItem(projectId, item) {
  const { data, error } = await supabase.from("boq_items").insert({ project_id: projectId, ...item }).select().single();
  if (error) throw error;
  return data;
}

/* ============================== FIELD CONFIGS ============================== */

export async function fetchFieldConfigs(projectId) {
  const { data, error } = await supabase.from("field_configs").select("*").eq("project_id", projectId);
  if (error) throw error;
  const byModule = {};
  for (const row of data) byModule[row.module] = row.fields;
  return byModule;
}

export async function saveFieldConfig(projectId, module, fields) {
  const { error } = await supabase
    .from("field_configs")
    .upsert({ project_id: projectId, module, fields }, { onConflict: "project_id,module" });
  if (error) throw error;
}

/* ============================== WORKERS (labour roster) ============================== */

export async function fetchWorkers() {
  const { data, error } = await supabase.from("workers").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function addWorker(name, grade) {
  const { data, error } = await supabase.from("workers").insert({ name, grade }).select().single();
  if (error) throw error;
  return data;
}

export async function setWorkerActive(id, active) {
  const { error } = await supabase.from("workers").update({ active }).eq("id", id);
  if (error) throw error;
}

/* ============================== EQUIPMENT & MATERIAL CATALOGUES ============================== */

export async function fetchEquipmentItems() {
  const { data, error } = await supabase.from("equipment_items").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function fetchMaterialItems() {
  const { data, error } = await supabase.from("material_items").select("*").order("name");
  if (error) throw error;
  return data;
}

/* ============================== ENTRIES (measurement / labour / equipment / material) ============================== */

const ENTRY_TABLES = {
  measurement: "measurement_entries",
  labour: "labour_entries",
  equipment: "equipment_entries",
  material: "material_entries",
};

export async function fetchEntries(kind, projectId) {
  const { data, error } = await supabase
    .from(ENTRY_TABLES[kind])
    .select("*")
    .eq("project_id", projectId)
    .order("work_date", { ascending: false });
  if (error) throw error;
  return data;
}

// Entries by a specific person, across every project they can see (used by
// "My Entries" for a Supervisor -- RLS still applies underneath).
export async function fetchMyEntries(kind, userId) {
  const { data, error } = await supabase
    .from(ENTRY_TABLES[kind])
    .select("*")
    .eq("entered_by", userId)
    .order("work_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertEntry(kind, payload) {
  const { data, error } = await supabase.from(ENTRY_TABLES[kind]).insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function setEntryStatus(kind, id, status, approverId) {
  const { error } = await supabase
    .from(ENTRY_TABLES[kind])
    .update({ status, approved_by: approverId, approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/* ============================== WAGE SETTLEMENTS ============================== */

export async function fetchWageSettlements(projectId) {
  const { data, error } = await supabase
    .from("wage_settlements")
    .select("*")
    .eq("project_id", projectId)
    .order("week_start", { ascending: false });
  if (error) throw error;
  return data;
}

// Counts approved labour_entries for a project + date range, split by
// worker grade -- this is what feeds the Mastri/Helper totals on the
// wage settlement screen, now computed from named-worker rows instead
// of a typed-in headcount.
export async function fetchApprovedLabourForWeek(projectId, weekStart, weekEnd) {
  const { data, error } = await supabase
    .from("labour_entries")
    .select("*, workers(grade)")
    .eq("project_id", projectId)
    .eq("status", "approved")
    .gte("work_date", weekStart)
    .lte("work_date", weekEnd);
  if (error) throw error;
  const mastriCount = data.filter((r) => r.workers?.grade === "mastri").length;
  const helperCount = data.filter((r) => r.workers?.grade === "helper").length;
  const foodCount = data.filter((r) => r.food_flag).length;
  const otHours = data.reduce((sum, r) => sum + Number(r.ot_hours || 0), 0);
  return { entries: data, mastriCount, helperCount, foodCount, otHours };
}

export async function insertWageSettlement(payload) {
  const { data, error } = await supabase.from("wage_settlements").insert(payload).select().single();
  if (error) throw error;
  return data;
}

/* ============================== PHOTOS (attached to entries) ============================== */

export async function uploadEntryPhoto({ file, projectId, entryType, entryId, uploadedBy, caption }) {
  const path = `${projectId}/${entryType}/${entryId}/${Date.now()}_${file.name}`;
  const { error: upErr } = await supabase.storage.from("entry-photos").upload(path, file);
  if (upErr) throw upErr;
  const { data, error } = await supabase
    .from("attachments")
    .insert({ project_id: projectId, entry_type: entryType, entry_id: entryId, storage_path: path, uploaded_by: uploadedBy, caption })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAttachments(entryType, entryId) {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("entry_type", entryType)
    .eq("entry_id", entryId);
  if (error) throw error;
  // Signed URLs since the bucket is private -- valid for 1 hour.
  const withUrls = await Promise.all(
    data.map(async (a) => {
      const { data: signed } = await supabase.storage.from("entry-photos").createSignedUrl(a.storage_path, 3600);
      return { ...a, url: signed?.signedUrl };
    })
  );
  return withUrls;
}

/* ============================== DOCUMENTS (project folder) ============================== */

export async function fetchDocuments(projectId) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const withUrls = await Promise.all(
    data.map(async (d) => {
      const { data: signed } = await supabase.storage.from("project-documents").createSignedUrl(d.storage_path, 3600);
      return { ...d, url: signed?.signedUrl };
    })
  );
  return withUrls;
}

export async function uploadDocument({ file, projectId, category, title, uploadedBy }) {
  const path = `${projectId}/${category}/${Date.now()}_${file.name}`;
  const { error: upErr } = await supabase.storage.from("project-documents").upload(path, file);
  if (upErr) throw upErr;
  const { data, error } = await supabase
    .from("documents")
    .insert({ project_id: projectId, title, category, storage_path: path, uploaded_by: uploadedBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id, storagePath) {
  await supabase.storage.from("project-documents").remove([storagePath]);
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}
