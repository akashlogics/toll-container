import { supabase } from "./supabaseClient";

export async function signIn(email, password) { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; return data; }
export async function signOut() { await supabase.auth.signOut(); }
export function onAuthChange(callback) { const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session)); return () => data.subscription.unsubscribe(); }
export async function getSession() { const { data } = await supabase.auth.getSession(); return data.session; }

export async function fetchMyProfile(userId) { const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single(); if (error) throw error; return data; }
export async function fetchAllProfiles() { const { data, error } = await supabase.from("profiles").select("*").order("name"); if (error) throw error; return data; }
export async function setProfileActive(userId, active) { const { error } = await supabase.from("profiles").update({ active }).eq("id", userId); if (error) throw error; }
export async function createEmployee(payload) { const { data, error } = await supabase.functions.invoke("create-user", { body: payload }); if (error) throw error; return data; }

export async function fetchMyProjects() { const { data, error } = await supabase.from("projects").select("*").eq("archived", false).order("created_at"); if (error) throw error; return data; }
export async function createProject(payload) { const { data, error } = await supabase.from("projects").insert(payload).select().single(); if (error) throw error; return data; }
export async function fetchProjectMembers(projectId) { const { data, error } = await supabase.from("project_members").select("user_id, profiles(id, name, role, active, phone)").eq("project_id", projectId); if (error) throw error; return data.map(r => r.profiles); }
export async function setProjectMembers(projectId, userId, shouldBeMember) { const q = shouldBeMember ? supabase.from("project_members").upsert({ project_id: projectId, user_id: userId }) : supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId); const { error } = await q; if (error) throw error; }

export async function fetchBoqItems(projectId) { const { data, error } = await supabase.from("boq_items").select("*").eq("project_id", projectId).order("code"); if (error) throw error; return data; }
export async function updateBoqItem(id, patch) { const { error } = await supabase.from("boq_items").update(patch).eq("id", id); if (error) throw error; }
export async function insertBoqItem(projectId, item) { const { data, error } = await supabase.from("boq_items").insert({ project_id: projectId, ...item }).select().single(); if (error) throw error; return data; }
export async function fetchFieldConfigs(projectId) { const { data, error } = await supabase.from("field_configs").select("*").eq("project_id", projectId); if (error) throw error; return Object.fromEntries(data.map(row => [row.module, row.fields])); }
export async function saveFieldConfig(projectId, module, fields) { const { error } = await supabase.from("field_configs").upsert({ project_id: projectId, module, fields }, { onConflict: "project_id,module" }); if (error) throw error; }

export async function fetchWorkers() { const { data, error } = await supabase.from("workers").select("*").order("name"); if (error) throw error; return data; }
export async function addWorker(name, grade) { const { data, error } = await supabase.from("workers").insert({ name, grade }).select().single(); if (error) throw error; return data; }
export async function setWorkerActive(id, active) { const { error } = await supabase.from("workers").update({ active }).eq("id", id); if (error) throw error; }
export async function fetchEquipmentItems() { const { data, error } = await supabase.from("equipment_items").select("*").order("name"); if (error) throw error; return data; }
export async function fetchMaterialItems() { const { data, error } = await supabase.from("material_items").select("*").order("name"); if (error) throw error; return data; }

const ENTRY_TABLES = { measurement: "measurement_entries", labour: "labour_entries", equipment: "equipment_entries", material: "material_entries" };
export async function fetchEntries(kind, projectId) { const { data, error } = await supabase.from(ENTRY_TABLES[kind]).select("*").eq("project_id", projectId).order("work_date", { ascending: false }); if (error) throw error; return data; }
export async function fetchMyEntries(kind, userId) { const { data, error } = await supabase.from(ENTRY_TABLES[kind]).select("*").eq("entered_by", userId).order("work_date", { ascending: false }); if (error) throw error; return data; }
export async function insertEntry(kind, payload) { const { data, error } = await supabase.from(ENTRY_TABLES[kind]).insert(payload).select().single(); if (error) throw error; return data; }
export async function setEntryStatus(kind, id, status, approverId) { const { error } = await supabase.from(ENTRY_TABLES[kind]).update({ status, approved_by: approverId, approved_at: new Date().toISOString() }).eq("id", id); if (error) throw error; }
export async function fetchWageSettlements(projectId) { const { data, error } = await supabase.from("wage_settlements").select("*").eq("project_id", projectId).order("week_start", { ascending: false }); if (error) throw error; return data; }
export async function fetchApprovedLabourForWeek(projectId, weekStart, weekEnd) { const { data, error } = await supabase.from("labour_entries").select("*, workers(grade)").eq("project_id", projectId).eq("status", "approved").gte("work_date", weekStart).lte("work_date", weekEnd); if (error) throw error; return { entries: data, mastriCount: data.filter(r => r.workers?.grade === "mastri").length, helperCount: data.filter(r => r.workers?.grade === "helper").length, foodCount: data.filter(r => r.food_flag).length, otHours: data.reduce((sum, r) => sum + Number(r.ot_hours || 0), 0) }; }
export async function insertWageSettlement(payload) { const { data, error } = await supabase.from("wage_settlements").insert(payload).select().single(); if (error) throw error; return data; }

export async function fetchDocuments(projectId) { const { data, error } = await supabase.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false }); if (error) throw error; return data; }
export async function uploadDocument({ file, projectId, category, title, uploadedBy }) { const path = `${projectId}/${category}/${Date.now()}_${file.name}`; const { error: upErr } = await supabase.storage.from("project-documents").upload(path, file); if (upErr) throw upErr; const { data, error } = await supabase.from("documents").insert({ project_id: projectId, title, category, storage_path: path, uploaded_by: uploadedBy }).select().single(); if (error) throw error; return data; }
export async function fetchAlerts(userId) { const { data, error } = await supabase.from("alerts").select("*").or(`recipient_id.eq.${userId},recipient_id.is.null`).order("created_at", { ascending: false }); if (error) throw error; return data; }
export async function createAlert(payload) { const { data, error } = await supabase.from("alerts").insert(payload).select().single(); if (error) throw error; return data; }
export async function markAlertRead(id) { const { error } = await supabase.from("alerts").update({ read_at: new Date().toISOString() }).eq("id", id); if (error) throw error; }

export async function archiveProject(id) { const { error } = await supabase.from("projects").update({ archived: true }).eq("id", id); if (error) throw error; }
export async function deleteBoqItem(id) { const { error } = await supabase.from("boq_items").delete().eq("id", id); if (error) throw error; }
