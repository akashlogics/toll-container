import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Users, Settings2, ClipboardList, Truck, Package,
  CheckCircle2, XCircle, Plus, Pencil, LogOut, Building2, ChevronRight,
  Ruler, HardHat, ClipboardCheck, IndianRupee, TrendingUp, TrendingDown,
  Clock3, ShieldCheck, X, Trash2, ListChecks, Wallet, ArrowLeft
} from "lucide-react";

/* ============================== BRAND ============================== */
const NAVY = "#1F3A5F";
const NAVY_DK = "#152943";
const GOLD = "#B8862B";
const GOLD_LT = "#E7C77E";
const BG = "#F4F6F8";

const fmtINR = (n) =>
  "\u20b9" + Math.round(n).toLocaleString("en-IN");

const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

/* ============================== SEED DATA ============================== */

const seedUsers = [
  { id: "u1", name: "Kumar", role: "admin", username: "kumar", phone: "98940 00001", active: true, projectIds: ["p1"] },
  { id: "u2", name: "Ganesh Babu", role: "manager", username: "ganesh", phone: "98940 00002", active: true, projectIds: ["p1"] },
  { id: "u3", name: "Viji", role: "supervisor", username: "viji", phone: "98940 00003", active: true, projectIds: ["p1"], teamId: "t1" },
  { id: "u4", name: "Murugan", role: "supervisor", username: "murugan", phone: "98940 00004", active: true, projectIds: ["p1"], teamId: "t1" },
];

const seedProject = {
  id: "p1",
  name: "KTTRL \u2013 Section 1",
  authority: "IVRCL",
  period: "Apr 2026 \u2013 Mar 2027",
  boqItems: [
    { id: "b1", code: "23A", desc: "Demolish \u2013 Wall tile", unit: "Sq.m", rate: 145, qtyToDate: 931.0, contractQty: 1400 },
    { id: "b2", code: "21A", desc: "Floor tile \u2013 vitrified", unit: "Sq.m", rate: 620, qtyToDate: 173.26, contractQty: 260 },
    { id: "b3", code: "18A", desc: "Wall tile \u2013 vitrified", unit: "Sq.m", rate: 580, qtyToDate: 698.25, contractQty: 900 },
    { id: "b4", code: "PL", desc: "Plastering", unit: "Sq.m", rate: 210, qtyToDate: 235.73, contractQty: 400 },
    { id: "b5", code: "PT", desc: "Putty + 2 coat", unit: "Sq.m", rate: 95, qtyToDate: 517.75, contractQty: 780 },
    { id: "b6", code: "EM", desc: "Emulsion paint", unit: "Sq.m", rate: 65, qtyToDate: 3200, contractQty: 4800 },
  ],
};

const seedTeams = [{ id: "t1", name: "Viji Team", projectId: "p1" }];

const seedEquipment = [
  { id: "e1", name: "Water tanker", defaultRate: 1800 },
  { id: "e2", name: "Sweeping machine", defaultRate: 1500 },
  { id: "e3", name: "Grass cutting machine", defaultRate: 900 },
  { id: "e4", name: "Supervisor bike", defaultRate: 200 },
  { id: "e5", name: "Pickup vehicle (labour shift)", defaultRate: 1200 },
];

const seedMaterials = [
  { id: "m1", name: "Cement (bag)", defaultUnitCost: 420 },
  { id: "m2", name: "Vitrified tile (box)", defaultUnitCost: 950 },
  { id: "m3", name: "River sand (unit)", defaultUnitCost: 3200 },
  { id: "m4", name: "Emulsion paint (litre)", defaultUnitCost: 260 },
  { id: "m5", name: "Wall putty (bag)", defaultUnitCost: 480 },
];

// Field configuration \u2014 admin-editable per module. "core" fields can be
// relabelled but not removed; custom fields can be added/removed freely.
const seedFieldConfig = {
  measurement: [
    { id: "f_no", label: "No.", type: "number", required: false, core: true },
    { id: "f_len", label: "Length (L)", type: "number", required: true, core: true },
    { id: "f_brd", label: "Breadth (B)", type: "number", required: true, core: true },
    { id: "f_hgt", label: "Height (H)", type: "number", required: false, core: true },
    { id: "f_rem", label: "Remarks", type: "text", required: false, core: true },
  ],
  labour: [
    { id: "f_mastri", label: "Mastri count", type: "number", required: true, core: true },
    { id: "f_helper", label: "Helper count", type: "number", required: true, core: true },
    { id: "f_ot", label: "OT (hours)", type: "number", required: false, core: true },
    { id: "f_food", label: "Food count", type: "number", required: false, core: true },
  ],
  equipment: [
    { id: "f_qty", label: "Hours / Qty used", type: "number", required: true, core: true },
    { id: "f_rate", label: "Rate override (\u20b9)", type: "number", required: false, core: true },
  ],
  material: [
    { id: "f_mqty", label: "Quantity used", type: "number", required: true, core: true },
  ],
};

const seedMeasurementEntries = [
  { id: uid("me"), projectId: "p1", boqItemId: "b3", date: "2026-07-27", enteredBy: "u3", status: "approved", values: { f_no: 2, f_len: 8.25, f_brd: 9.5, f_hgt: "", f_rem: "Wall tile G floor" } },
  { id: uid("me"), projectId: "p1", boqItemId: "b4", date: "2026-07-28", enteredBy: "u4", status: "pending", values: { f_no: 1, f_len: 10.5, f_brd: 9.5, f_hgt: "", f_rem: "Ups room inner" } },
];

const seedLabourEntries = [
  { id: uid("le"), projectId: "p1", teamId: "t1", date: "2026-07-24", enteredBy: "u3", status: "approved", values: { f_mastri: 1, f_helper: 10, f_ot: 0, f_food: 11 } },
  { id: uid("le"), projectId: "p1", teamId: "t1", date: "2026-07-29", enteredBy: "u3", status: "pending", values: { f_mastri: 1, f_helper: 9, f_ot: 2, f_food: 10 } },
];

const seedEquipmentEntries = [
  { id: uid("ee"), projectId: "p1", equipmentId: "e1", date: "2026-07-27", enteredBy: "u4", status: "approved", values: { f_qty: 1, f_rate: "" } },
  { id: uid("ee"), projectId: "p1", equipmentId: "e5", date: "2026-07-29", enteredBy: "u3", status: "pending", values: { f_qty: 2, f_rate: "" } },
];

const seedMaterialEntries = [
  { id: uid("mt"), projectId: "p1", materialId: "m2", date: "2026-07-27", enteredBy: "u4", status: "approved", values: { f_mqty: 6 } },
  { id: uid("mt"), projectId: "p1", materialId: "m1", date: "2026-07-29", enteredBy: "u3", status: "pending", values: { f_mqty: 12 } },
];

const seedWageSettlements = [
  { id: uid("ws"), teamId: "t1", weekLabel: "18\u201324 Jul 2026", mastriCount: 4, helperCount: 54, foodCount: 58, mastriRate: 1100, helperRate: 800, foodRate: 300, advance: 0, deduct: 0, tds: 650, total: 64350 },
];

/* ============================== SMALL UI PARTS ============================== */

function Badge({ children, tone = "grey" }) {
  const tones = {
    grey: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    navy: "bg-[#EAF1F8] text-[#1F3A5F]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === "approved") return <Badge tone="green"><CheckCircle2 size={12} /> Approved</Badge>;
  if (status === "sent_back") return <Badge tone="red"><XCircle size={12} /> Sent back</Badge>;
  return <Badge tone="amber"><Clock3 size={12} /> Pending</Badge>;
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={19} color={NAVY} />}
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-colors ${className}`}
      style={{ backgroundColor: NAVY }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = NAVY_DK)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, tone = "slate" }) {
  const toneClasses = {
    slate: "text-slate-600 hover:bg-slate-100 border-slate-200",
    green: "text-emerald-700 hover:bg-emerald-50 border-emerald-200",
    red: "text-rose-700 hover:bg-rose-50 border-rose-200",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${toneClasses[tone]}`}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]/30 focus:border-[#1F3A5F]";

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold" style={{ color: NAVY }}>{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ============================== ROLE PICKER ============================== */

function RolePicker({ users, onPick }) {
  const roleMeta = {
    admin: { label: "Contractor / Admin", desc: "Full company view \u00b7 projects, rates, users, reports", icon: ShieldCheck },
    manager: { label: "Manager", desc: "Reviews & approves entries \u00b7 wage settlement", icon: ClipboardCheck },
    supervisor: { label: "Supervisor", desc: "Enters today's site data from the field", icon: HardHat },
  };
  const order = ["admin", "manager", "supervisor"];
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BG }}>
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Building2 size={22} color={GOLD} />
            <span className="text-sm font-semibold tracking-wide" style={{ color: GOLD }}>KUMAR &amp; CO.</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Project &amp; Labour Management \u2014 Demo</h1>
          <p className="text-slate-500 text-sm mt-1">This is a working preview. Pick a login to see what that person sees.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {order.map((role) => {
            const meta = roleMeta[role];
            const roleUsers = users.filter((u) => u.role === role && u.active);
            return (
              <Card key={role} className="p-5 flex flex-col">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "#EAF1F8" }}>
                  <meta.icon size={19} color={NAVY} />
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{meta.label}</h3>
                <p className="text-xs text-slate-500 mb-4 flex-1">{meta.desc}</p>
                <div className="space-y-2">
                  {roleUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onPick(u)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 hover:border-[#B8862B] hover:bg-amber-50/40 text-sm transition-colors"
                    >
                      <span className="font-medium text-slate-700">{u.name}</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== APP SHELL ============================== */

const NAV = {
  admin: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "rates", label: "Projects & Rates", icon: IndianRupee },
    { key: "fields", label: "Field Settings", icon: Settings2 },
    { key: "team", label: "Team & Access", icon: Users },
    { key: "approvals", label: "Approvals Snapshot", icon: ListChecks },
  ],
  manager: [
    { key: "queue", label: "Approvals Queue", icon: ClipboardCheck },
    { key: "wages", label: "Wage Settlement", icon: Wallet },
    { key: "progress", label: "Project Progress", icon: TrendingUp },
  ],
  supervisor: [
    { key: "entry", label: "New Entry", icon: ClipboardList },
    { key: "mine", label: "My Entries", icon: ListChecks },
  ],
};

function Shell({ user, onLogout, children, active, setActive }) {
  const items = NAV[user.role];
  const roleLabel = { admin: "Contractor / Admin", manager: "Manager", supervisor: "Supervisor" }[user.role];
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG }}>
      <aside className="w-60 shrink-0 hidden md:flex flex-col text-white" style={{ backgroundColor: NAVY }}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Building2 size={18} color={GOLD_LT} />
            <span className="font-semibold text-sm tracking-wide">KUMAR &amp; CO.</span>
          </div>
          <p className="text-[11px] text-white/50 mt-1">KTTRL \u2013 Section 1</p>
        </div>
        <nav className="flex-1 py-4">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setActive(it.key)}
              className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-left transition-colors ${
                active === it.key ? "bg-white/10 border-r-2" : "text-white/70 hover:bg-white/5"
              }`}
              style={active === it.key ? { borderColor: GOLD } : {}}
            >
              <it.icon size={15} />
              {it.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs font-medium">{user.name}</p>
          <p className="text-[11px] text-white/50 mb-2">{roleLabel}</p>
          <button onClick={onLogout} className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-white">
            <ArrowLeft size={12} /> Switch login
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <Building2 size={16} color={NAVY} />
            <span className="font-semibold text-sm" style={{ color: NAVY }}>Kumar &amp; Co.</span>
          </div>
          <button onClick={onLogout} className="text-xs text-slate-500 flex items-center gap-1">
            <LogOut size={13} /> Switch
          </button>
        </div>
        <div className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 bg-white border-b">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setActive(it.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                active === it.key ? "text-white" : "bg-slate-100 text-slate-600"
              }`}
              style={active === it.key ? { backgroundColor: NAVY } : {}}
            >
              {it.label}
            </button>
          ))}
        </div>
        <main className="p-4 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}

/* ============================== DYNAMIC FIELD RENDERING ============================== */

function DynamicFields({ fields, values, setValues }) {
  return (
    <>
      {fields.map((f) => (
        <Field key={f.id} label={f.label} required={f.required}>
          <input
            type={f.type === "number" ? "number" : "text"}
            className={inputCls}
            value={values[f.id] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            placeholder={f.type === "number" ? "0" : ""}
          />
        </Field>
      ))}
    </>
  );
}

/* ============================== ADMIN VIEWS ============================== */

function computeIncome(project, measurementEntries) {
  const approvedByItem = {};
  measurementEntries
    .filter((e) => e.status === "approved" && e.projectId === project.id)
    .forEach((e) => {
      const v = e.values;
      const qty = (Number(v.f_no) || 1) * (Number(v.f_len) || 0) * (Number(v.f_brd) || 1) * (Number(v.f_hgt) || 1);
      approvedByItem[e.boqItemId] = (approvedByItem[e.boqItemId] || 0) + qty;
    });
  let income = 0;
  const perItem = project.boqItems.map((it) => {
    const extra = approvedByItem[it.id] || 0;
    const totalQty = it.qtyToDate + extra;
    const amount = totalQty * it.rate;
    income += amount;
    return { ...it, totalQty, amount };
  });
  return { income, perItem };
}

function computeExpense({ equipmentEntries, materialEntries, wageSettlements, equipmentList, materialsList }) {
  const equipCost = equipmentEntries
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => {
      const eq = equipmentList.find((x) => x.id === e.equipmentId);
      const rate = Number(e.values.f_rate) || eq?.defaultRate || 0;
      return sum + (Number(e.values.f_qty) || 0) * rate;
    }, 0);
  const materialCost = materialEntries
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => {
      const mt = materialsList.find((x) => x.id === e.materialId);
      return sum + (Number(e.values.f_mqty) || 0) * (mt?.defaultUnitCost || 0);
    }, 0);
  const wageCost = wageSettlements.reduce((sum, w) => sum + w.total, 0);
  return { equipCost, materialCost, wageCost, total: equipCost + materialCost + wageCost };
}

function AdminOverview({ project, data }) {
  const { income, perItem } = computeIncome(project, data.measurementEntries);
  const expense = computeExpense(data);
  const profit = income - expense.total;
  return (
    <div>
      <SectionTitle icon={LayoutDashboard} title="Overview" subtitle="Live figures for KTTRL \u2013 Section 1, based on approved entries only." />
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2"><TrendingUp size={14} className="text-emerald-600" /> INCOME (BILLED)</div>
          <p className="text-2xl font-bold" style={{ color: NAVY }}>{fmtINR(income)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2"><TrendingDown size={14} className="text-rose-600" /> EXPENSE (APPROVED)</div>
          <p className="text-2xl font-bold" style={{ color: NAVY }}>{fmtINR(expense.total)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Wages {fmtINR(expense.wageCost)} \u00b7 Equipment {fmtINR(expense.equipCost)} \u00b7 Materials {fmtINR(expense.materialCost)}</p>
        </Card>
        <Card className="p-5" style={{ borderColor: GOLD }}>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2"><IndianRupee size={14} style={{ color: GOLD }} /> PROFIT</div>
          <p className="text-2xl font-bold" style={{ color: GOLD }}>{fmtINR(profit)}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Progress by contract item</h3>
        <div className="space-y-3">
          {perItem.map((it) => {
            const pct = Math.min(100, Math.round((it.totalQty / it.contractQty) * 100));
            return (
              <div key={it.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{it.code} \u00b7 {it.desc}</span>
                  <span className="text-slate-500">{it.totalQty.toFixed(1)} / {it.contractQty} {it.unit} \u00b7 {pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full" style={{ width: pct + "%", backgroundColor: NAVY }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <p className="text-xs text-slate-400 mt-4">Demo data \u2014 figures update live as entries are approved. Not a real project record.</p>
    </div>
  );
}

function AdminRates({ project, setProject }) {
  const updateItem = (id, field, val) => {
    setProject((p) => ({
      ...p,
      boqItems: p.boqItems.map((it) => (it.id === id ? { ...it, [field]: field === "desc" || field === "unit" || field === "code" ? val : Number(val) } : it)),
    }));
  };
  return (
    <div>
      <SectionTitle icon={IndianRupee} title="Projects & Rates" subtitle="The official rate list for this project. Edit rates here \u2014 supervisors and managers never see or edit this." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Rate (\u20b9)</th>
              <th className="px-4 py-3">Contract qty</th>
              <th className="px-4 py-3">Done to date</th>
            </tr>
          </thead>
          <tbody>
            {project.boqItems.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 text-slate-500">{it.code}</td>
                <td className="px-4 py-2.5">
                  <input className="w-full border-0 focus:ring-1 focus:ring-[#1F3A5F]/30 rounded px-1 py-0.5" value={it.desc} onChange={(e) => updateItem(it.id, "desc", e.target.value)} />
                </td>
                <td className="px-4 py-2.5 text-slate-500">{it.unit}</td>
                <td className="px-4 py-2.5">
                  <input type="number" className="w-24 border border-slate-200 rounded px-2 py-1" value={it.rate} onChange={(e) => updateItem(it.id, "rate", e.target.value)} />
                </td>
                <td className="px-4 py-2.5">
                  <input type="number" className="w-24 border border-slate-200 rounded px-2 py-1" value={it.contractQty} onChange={(e) => updateItem(it.id, "contractQty", e.target.value)} />
                </td>
                <td className="px-4 py-2.5 text-slate-500">{it.qtyToDate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function FieldSettingsPanel({ moduleKey, title, fields, setFieldConfig }) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("number");

  const updateField = (id, patch) => {
    setFieldConfig((cfg) => ({ ...cfg, [moduleKey]: cfg[moduleKey].map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  };
  const removeField = (id) => {
    setFieldConfig((cfg) => ({ ...cfg, [moduleKey]: cfg[moduleKey].filter((f) => f.id !== id) }));
  };
  const addField = () => {
    if (!newLabel.trim()) return;
    setFieldConfig((cfg) => ({
      ...cfg,
      [moduleKey]: [...cfg[moduleKey], { id: uid("f"), label: newLabel.trim(), type: newType, required: false, core: false }],
    }));
    setNewLabel("");
    setNewType("number");
    setAdding(false);
  };

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</h3>
      <p className="text-xs text-slate-500 mb-4">These are the fields the Supervisor fills for this module. Rename them to match this project's terms, or add fields for a project type that needs something extra.</p>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.id} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
            <input
              className="flex-1 text-sm border-0 focus:ring-1 focus:ring-[#1F3A5F]/30 rounded px-1 py-0.5"
              value={f.label}
              onChange={(e) => updateField(f.id, { label: e.target.value })}
            />
            <Badge tone="grey">{f.type}</Badge>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} />
              Required
            </label>
            {!f.core && (
              <button onClick={() => removeField(f.id)} className="text-slate-400 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-3 py-2">
          <input className={inputCls + " flex-1"} placeholder="New field label, e.g. Diameter" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <select className={inputCls + " w-28"} value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="number">Number</option>
            <option value="text">Text</option>
          </select>
          <GhostButton onClick={addField} tone="green" icon={CheckCircle2}>Add</GhostButton>
          <GhostButton onClick={() => setAdding(false)}>Cancel</GhostButton>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-3 inline-flex items-center gap-1 text-xs font-medium" style={{ color: GOLD }}>
          <Plus size={14} /> Add field
        </button>
      )}
    </Card>
  );
}

function AdminFieldSettings({ fieldConfig, setFieldConfig }) {
  return (
    <div>
      <SectionTitle icon={Settings2} title="Field Settings" subtitle="Different projects use different terms. Edit what Supervisors and Managers see on each entry form \u2014 changes apply immediately." />
      <div className="grid md:grid-cols-2 gap-4">
        <FieldSettingsPanel moduleKey="measurement" title="Site Measurement fields" fields={fieldConfig.measurement} setFieldConfig={setFieldConfig} />
        <FieldSettingsPanel moduleKey="labour" title="Labour Attendance fields" fields={fieldConfig.labour} setFieldConfig={setFieldConfig} />
        <FieldSettingsPanel moduleKey="equipment" title="Equipment / Vehicle fields" fields={fieldConfig.equipment} setFieldConfig={setFieldConfig} />
        <FieldSettingsPanel moduleKey="material" title="Material fields" fields={fieldConfig.material} setFieldConfig={setFieldConfig} />
      </div>
    </div>
  );
}

function AddEmployeeModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", role: "supervisor", phone: "", username: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal title="Add new employee" onClose={onClose}>
      <Field label="Full name" required>
        <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Karthik" />
      </Field>
      <Field label="Role" required>
        <select className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="supervisor">Supervisor</option>
          <option value="manager">Manager</option>
        </select>
      </Field>
      <Field label="Phone number">
        <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98xxx xxxxx" />
      </Field>
      <Field label="Login username" required>
        <input className={inputCls} value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="e.g. karthik" />
      </Field>
      <p className="text-xs text-slate-400 mb-4">Assigned to KTTRL \u2013 Section 1 by default. A temporary password would be sent by SMS in the real system.</p>
      <div className="flex justify-end gap-2">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton
          icon={Plus}
          onClick={() => {
            if (!form.name.trim() || !form.username.trim()) return;
            onSave(form);
          }}
        >
          Add employee
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function AdminTeam({ users, setUsers }) {
  const [showAdd, setShowAdd] = useState(false);
  const toggleActive = (id) => setUsers((us) => us.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  const addUser = (form) => {
    setUsers((us) => [
      ...us,
      { id: uid("u"), name: form.name, role: form.role, username: form.username, phone: form.phone, active: true, projectIds: ["p1"], teamId: form.role === "supervisor" ? "t1" : undefined },
    ]);
    setShowAdd(false);
  };
  const roleLabel = { admin: "Admin", manager: "Manager", supervisor: "Supervisor" };
  return (
    <div>
      <SectionTitle icon={Users} title="Team & Access" subtitle="Everyone who can log in, and what they can access. Labourers are never added here \u2014 they're just numbers Supervisors enter." />
      <div className="flex justify-end mb-3">
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>Add employee</PrimaryButton>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-700">{u.name}</td>
                <td className="px-4 py-2.5"><Badge tone="navy">{roleLabel[u.role]}</Badge></td>
                <td className="px-4 py-2.5 text-slate-500">{u.username}</td>
                <td className="px-4 py-2.5 text-slate-500">{u.phone || "\u2014"}</td>
                <td className="px-4 py-2.5 text-slate-500">KTTRL \u2013 Section 1</td>
                <td className="px-4 py-2.5">
                  <Badge tone={u.active ? "green" : "red"}>{u.active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  {u.role !== "admin" && (
                    <GhostButton tone={u.active ? "red" : "green"} onClick={() => toggleActive(u.id)}>
                      {u.active ? "Deactivate" : "Reactivate"}
                    </GhostButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onSave={addUser} />}
    </div>
  );
}

function AdminApprovalsSnapshot({ data }) {
  const counts = (arr) => ({
    pending: arr.filter((e) => e.status === "pending").length,
    approved: arr.filter((e) => e.status === "approved").length,
    sent_back: arr.filter((e) => e.status === "sent_back").length,
  });
  const rows = [
    { label: "Site measurements", c: counts(data.measurementEntries), icon: Ruler },
    { label: "Labour attendance", c: counts(data.labourEntries), icon: HardHat },
    { label: "Equipment / vehicles", c: counts(data.equipmentEntries), icon: Truck },
    { label: "Materials", c: counts(data.materialEntries), icon: Package },
  ];
  return (
    <div>
      <SectionTitle icon={ListChecks} title="Approvals Snapshot" subtitle="Read-only view \u2014 your Manager handles the actual approving." />
      <Card className="divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <r.icon size={16} color={NAVY} />
              <span className="text-sm font-medium text-slate-700">{r.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="amber">{r.c.pending} pending</Badge>
              <Badge tone="green">{r.c.approved} approved</Badge>
              <Badge tone="red">{r.c.sent_back} sent back</Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================== MANAGER VIEWS ============================== */

function entrySummary(kind, e, ctx) {
  if (kind === "measurement") {
    const item = ctx.project.boqItems.find((b) => b.id === e.boqItemId);
    return `${item?.code} \u00b7 ${item?.desc} \u2014 L${e.values.f_len || 0} \u00d7 B${e.values.f_brd || 0}${e.values.f_hgt ? " \u00d7 H" + e.values.f_hgt : ""}`;
  }
  if (kind === "labour") {
    const team = ctx.teams.find((t) => t.id === e.teamId);
    return `${team?.name} \u2014 Mastri ${e.values.f_mastri || 0}, Helper ${e.values.f_helper || 0}${e.values.f_ot ? ", OT " + e.values.f_ot + "h" : ""}`;
  }
  if (kind === "equipment") {
    const eq = ctx.equipmentList.find((x) => x.id === e.equipmentId);
    return `${eq?.name} \u2014 ${e.values.f_qty || 0} used`;
  }
  if (kind === "material") {
    const mt = ctx.materialsList.find((x) => x.id === e.materialId);
    return `${mt?.name} \u2014 ${e.values.f_mqty || 0} used`;
  }
  return "";
}

function ApprovalRow({ kind, entry, ctx, onApprove, onSendBack, users }) {
  const enteredByUser = users.find((u) => u.id === entry.enteredBy);
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-slate-700 truncate">{entrySummary(kind, entry, ctx)}</p>
        <p className="text-xs text-slate-400">{entry.date} \u00b7 by {enteredByUser?.name}</p>
      </div>
      {entry.status === "pending" ? (
        <div className="flex gap-2 shrink-0">
          <GhostButton tone="green" icon={CheckCircle2} onClick={() => onApprove(kind, entry.id)}>Approve</GhostButton>
          <GhostButton tone="red" icon={XCircle} onClick={() => onSendBack(kind, entry.id)}>Send back</GhostButton>
        </div>
      ) : (
        <StatusBadge status={entry.status} />
      )}
    </div>
  );
}

function ManagerQueue({ data, users, setData, ctx }) {
  const setStatus = (kind, id, status) => {
    const keyMap = { measurement: "measurementEntries", labour: "labourEntries", equipment: "equipmentEntries", material: "materialEntries" };
    setData((d) => ({ ...d, [keyMap[kind]]: d[keyMap[kind]].map((e) => (e.id === id ? { ...e, status } : e)) }));
  };
  const groups = [
    { kind: "measurement", label: "Site measurements", icon: Ruler, list: data.measurementEntries },
    { kind: "labour", label: "Labour attendance", icon: HardHat, list: data.labourEntries },
    { kind: "equipment", label: "Equipment / vehicles", icon: Truck, list: data.equipmentEntries },
    { kind: "material", label: "Materials", icon: Package, list: data.materialEntries },
  ];
  const anyPending = groups.some((g) => g.list.some((e) => e.status === "pending"));
  return (
    <div>
      <SectionTitle icon={ClipboardCheck} title="Approvals Queue" subtitle="Review each Supervisor's entries before they count toward billing or wages." />
      {!anyPending && (
        <Card className="p-6 text-center text-sm text-slate-500 mb-4">All caught up \u2014 nothing waiting on you right now.</Card>
      )}
      <div className="space-y-4">
        {groups.map((g) => {
          const pending = g.list.filter((e) => e.status === "pending");
          const rest = g.list.filter((e) => e.status !== "pending");
          if (g.list.length === 0) return null;
          return (
            <Card key={g.kind}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <g.icon size={15} color={NAVY} />
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>{g.label}</h3>
                {pending.length > 0 && <Badge tone="amber">{pending.length} pending</Badge>}
              </div>
              {[...pending, ...rest].map((e) => (
                <ApprovalRow key={e.id} kind={g.kind} entry={e} ctx={ctx} users={users} onApprove={(k, id) => setStatus(k, id, "approved")} onSendBack={(k, id) => setStatus(k, id, "sent_back")} />
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ManagerWages({ data, setData, teams }) {
  const team = teams[0];
  const [form, setForm] = useState({ weekLabel: "25\u201331 Jul 2026", mastriRate: 1100, helperRate: 800, foodRate: 300, advance: 0, deduct: 0, tds: 0 });

  const approvedThisWeek = data.labourEntries.filter((e) => e.status === "approved" && e.teamId === team.id);
  const mastriCount = approvedThisWeek.reduce((s, e) => s + (Number(e.values.f_mastri) || 0), 0);
  const helperCount = approvedThisWeek.reduce((s, e) => s + (Number(e.values.f_helper) || 0), 0);
  const foodCount = approvedThisWeek.reduce((s, e) => s + (Number(e.values.f_food) || 0), 0);

  const mastriAmt = mastriCount * form.mastriRate;
  const helperAmt = helperCount * form.helperRate;
  const foodAmt = foodCount * form.foodRate;
  const total = mastriAmt + helperAmt + foodAmt;
  const balance = total - Number(form.advance) - Number(form.deduct);
  const finalPayment = balance - Number(form.tds);

  const save = () => {
    setData((d) => ({
      ...d,
      wageSettlements: [
        ...d.wageSettlements,
        { id: uid("ws"), teamId: team.id, weekLabel: form.weekLabel, mastriCount, helperCount, foodCount, mastriRate: form.mastriRate, helperRate: form.helperRate, foodRate: form.foodRate, advance: Number(form.advance), deduct: Number(form.deduct), tds: Number(form.tds), total: finalPayment },
      ],
    }));
  };

  return (
    <div>
      <SectionTitle icon={Wallet} title="Wage Settlement" subtitle="Approved attendance for the week, totalled automatically \u2014 the same layout as your current labour sheet." />
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>{team.name} \u2014 approved attendance</h3>
          <table className="w-full text-sm mb-4">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">Mastri count</td><td className="py-1.5 text-right font-medium">{mastriCount}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">Helper count</td><td className="py-1.5 text-right font-medium">{helperCount}</td></tr>
              <tr><td className="py-1.5 text-slate-500">Food count</td><td className="py-1.5 text-right font-medium">{foodCount}</td></tr>
            </tbody>
          </table>
          <Field label="Week"><input className={inputCls} value={form.weekLabel} onChange={(e) => setForm((f) => ({ ...f, weekLabel: e.target.value }))} /></Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Mastri rate"><input type="number" className={inputCls} value={form.mastriRate} onChange={(e) => setForm((f) => ({ ...f, mastriRate: Number(e.target.value) }))} /></Field>
            <Field label="Helper rate"><input type="number" className={inputCls} value={form.helperRate} onChange={(e) => setForm((f) => ({ ...f, helperRate: Number(e.target.value) }))} /></Field>
            <Field label="Food rate"><input type="number" className={inputCls} value={form.foodRate} onChange={(e) => setForm((f) => ({ ...f, foodRate: Number(e.target.value) }))} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Advance"><input type="number" className={inputCls} value={form.advance} onChange={(e) => setForm((f) => ({ ...f, advance: e.target.value }))} /></Field>
            <Field label="Deduct"><input type="number" className={inputCls} value={form.deduct} onChange={(e) => setForm((f) => ({ ...f, deduct: e.target.value }))} /></Field>
            <Field label="TDS"><input type="number" className={inputCls} value={form.tds} onChange={(e) => setForm((f) => ({ ...f, tds: e.target.value }))} /></Field>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Computed settlement</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">Mastri ({mastriCount} \u00d7 {fmtINR(form.mastriRate)})</td><td className="py-1.5 text-right">{fmtINR(mastriAmt)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">Helper ({helperCount} \u00d7 {fmtINR(form.helperRate)})</td><td className="py-1.5 text-right">{fmtINR(helperAmt)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">Food ({foodCount} \u00d7 {fmtINR(form.foodRate)})</td><td className="py-1.5 text-right">{fmtINR(foodAmt)}</td></tr>
              <tr className="border-b border-slate-100 font-medium"><td className="py-1.5">Total</td><td className="py-1.5 text-right">{fmtINR(total)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">\u2212 Advance</td><td className="py-1.5 text-right">{fmtINR(form.advance)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">\u2212 Deduct</td><td className="py-1.5 text-right">{fmtINR(form.deduct)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5 text-slate-500">\u2212 TDS</td><td className="py-1.5 text-right">{fmtINR(form.tds)}</td></tr>
              <tr><td className="py-2 font-semibold" style={{ color: NAVY }}>Total payment</td><td className="py-2 text-right font-bold" style={{ color: GOLD }}>{fmtINR(finalPayment)}</td></tr>
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <PrimaryButton icon={CheckCircle2} onClick={save}>Save settlement</PrimaryButton>
          </div>
        </Card>
      </div>

      {data.wageSettlements.length > 0 && (
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="px-4 py-2.5">Week</th><th className="px-4 py-2.5">Mastri</th><th className="px-4 py-2.5">Helper</th><th className="px-4 py-2.5">TDS</th><th className="px-4 py-2.5">Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.wageSettlements.map((w) => (
                <tr key={w.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5">{w.weekLabel}</td>
                  <td className="px-4 py-2.5">{w.mastriCount}</td>
                  <td className="px-4 py-2.5">{w.helperCount}</td>
                  <td className="px-4 py-2.5">{fmtINR(w.tds)}</td>
                  <td className="px-4 py-2.5 font-medium">{fmtINR(w.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function ManagerProgress({ project, data }) {
  const { perItem } = computeIncome(project, data.measurementEntries);
  return (
    <div>
      <SectionTitle icon={TrendingUp} title="Project Progress" subtitle="Read-only view of contract completion for KTTRL \u2013 Section 1." />
      <Card className="p-5 space-y-3">
        {perItem.map((it) => {
          const pct = Math.min(100, Math.round((it.totalQty / it.contractQty) * 100));
          return (
            <div key={it.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{it.code} \u00b7 {it.desc}</span>
                <span className="text-slate-500">{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full" style={{ width: pct + "%", backgroundColor: NAVY }} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ============================== SUPERVISOR VIEWS ============================== */

function SupervisorEntry({ user, project, teams, equipmentList, materialsList, fieldConfig, setData }) {
  const [tab, setTab] = useState("measurement");
  const [boqItemId, setBoqItemId] = useState(project.boqItems[0].id);
  const [equipmentId, setEquipmentId] = useState(equipmentList[0].id);
  const [materialId, setMaterialId] = useState(materialsList[0].id);
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  const team = teams.find((t) => t.id === user.teamId);

  const tabs = [
    { key: "measurement", label: "Measurement", icon: Ruler },
    { key: "labour", label: "Labour", icon: HardHat },
    { key: "equipment", label: "Equipment", icon: Truck },
    { key: "material", label: "Material", icon: Package },
  ];

  const submit = () => {
    const base = { id: uid("e"), projectId: project.id, date: todayStr(), enteredBy: user.id, status: "pending", values };
    if (tab === "measurement") {
      setData((d) => ({ ...d, measurementEntries: [...d.measurementEntries, { ...base, boqItemId }] }));
    } else if (tab === "labour") {
      setData((d) => ({ ...d, labourEntries: [...d.labourEntries, { ...base, teamId: team.id }] }));
    } else if (tab === "equipment") {
      setData((d) => ({ ...d, equipmentEntries: [...d.equipmentEntries, { ...base, equipmentId }] }));
    } else {
      setData((d) => ({ ...d, materialEntries: [...d.materialEntries, { ...base, materialId }] }));
    }
    setValues({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <SectionTitle icon={ClipboardList} title="New Entry" subtitle={`Logging for KTTRL \u2013 Section 1, ${todayStr()}. Your Manager reviews this before it counts.`} />
      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setValues({}); }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium ${tab === t.key ? "text-white" : "bg-white border border-slate-200 text-slate-600"}`}
            style={tab === t.key ? { backgroundColor: NAVY } : {}}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <Card className="p-5 max-w-lg">
        {tab === "measurement" && (
          <>
            <Field label="Work item" required>
              <select className={inputCls} value={boqItemId} onChange={(e) => setBoqItemId(e.target.value)}>
                {project.boqItems.map((it) => (
                  <option key={it.id} value={it.id}>{it.code} \u2014 {it.desc}</option>
                ))}
              </select>
            </Field>
            <DynamicFields fields={fieldConfig.measurement} values={values} setValues={setValues} />
          </>
        )}
        {tab === "labour" && (
          <>
            <Field label="Team"><input className={inputCls} value={team?.name || ""} disabled /></Field>
            <DynamicFields fields={fieldConfig.labour} values={values} setValues={setValues} />
          </>
        )}
        {tab === "equipment" && (
          <>
            <Field label="Equipment / vehicle" required>
              <select className={inputCls} value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </Field>
            <DynamicFields fields={fieldConfig.equipment} values={values} setValues={setValues} />
          </>
        )}
        {tab === "material" && (
          <>
            <Field label="Material" required>
              <select className={inputCls} value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
                {materialsList.map((mt) => (
                  <option key={mt.id} value={mt.id}>{mt.name}</option>
                ))}
              </select>
            </Field>
            <DynamicFields fields={fieldConfig.material} values={values} setValues={setValues} />
          </>
        )}
        <div className="flex items-center gap-3 mt-2">
          <PrimaryButton icon={CheckCircle2} onClick={submit}>Submit for approval</PrimaryButton>
          {saved && <span className="text-xs text-emerald-600">Saved \u2014 waiting on Manager review</span>}
        </div>
      </Card>
    </div>
  );
}

function SupervisorMine({ user, data, ctx }) {
  const all = [
    ...data.measurementEntries.map((e) => ({ ...e, kind: "measurement" })),
    ...data.labourEntries.map((e) => ({ ...e, kind: "labour" })),
    ...data.equipmentEntries.map((e) => ({ ...e, kind: "equipment" })),
    ...data.materialEntries.map((e) => ({ ...e, kind: "material" })),
  ]
    .filter((e) => e.enteredBy === user.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const icons = { measurement: Ruler, labour: HardHat, equipment: Truck, material: Package };

  return (
    <div>
      <SectionTitle icon={ListChecks} title="My Entries" subtitle="Everything you've submitted, and whether your Manager has approved it yet." />
      <Card className="divide-y divide-slate-100">
        {all.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No entries yet \u2014 go to New Entry to log today's work.</p>}
        {all.map((e) => {
          const Icon = icons[e.kind];
          return (
            <div key={e.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={15} color={NAVY} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 truncate">{entrySummary(e.kind, e, ctx)}</p>
                  <p className="text-xs text-slate-400">{e.date}</p>
                </div>
              </div>
              <StatusBadge status={e.status} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ============================== ROOT ============================== */

export default function KumarCoDemo() {
  const [screen, setScreen] = useState("picker");
  const [currentUser, setCurrentUser] = useState(null);
  const [active, setActive] = useState(null);

  const [users, setUsers] = useState(seedUsers);
  const [project, setProject] = useState(seedProject);
  const [fieldConfig, setFieldConfig] = useState(seedFieldConfig);
  const [teams] = useState(seedTeams);
  const [equipmentList] = useState(seedEquipment);
  const [materialsList] = useState(seedMaterials);

  const [data, setData] = useState({
    measurementEntries: seedMeasurementEntries,
    labourEntries: seedLabourEntries,
    equipmentEntries: seedEquipmentEntries,
    materialEntries: seedMaterialEntries,
    wageSettlements: seedWageSettlements,
  });

  const ctx = useMemo(() => ({ project, teams, equipmentList, materialsList }), [project, teams, equipmentList, materialsList]);

  const login = (u) => {
    setCurrentUser(u);
    setActive(NAV[u.role][0].key);
    setScreen("app");
  };
  const logout = () => {
    setScreen("picker");
    setCurrentUser(null);
  };

  if (screen === "picker" || !currentUser) {
    return <RolePicker users={users} onPick={login} />;
  }

  const dataForExpense = { ...data, equipmentList, materialsList };

  return (
    <Shell user={currentUser} onLogout={logout} active={active} setActive={setActive}>
      {currentUser.role === "admin" && active === "overview" && <AdminOverview project={project} data={dataForExpense} />}
      {currentUser.role === "admin" && active === "rates" && <AdminRates project={project} setProject={setProject} />}
      {currentUser.role === "admin" && active === "fields" && <AdminFieldSettings fieldConfig={fieldConfig} setFieldConfig={setFieldConfig} />}
      {currentUser.role === "admin" && active === "team" && <AdminTeam users={users} setUsers={setUsers} />}
      {currentUser.role === "admin" && active === "approvals" && <AdminApprovalsSnapshot data={data} />}

      {currentUser.role === "manager" && active === "queue" && <ManagerQueue data={data} users={users} setData={setData} ctx={ctx} />}
      {currentUser.role === "manager" && active === "wages" && <ManagerWages data={data} setData={setData} teams={teams} />}
      {currentUser.role === "manager" && active === "progress" && <ManagerProgress project={project} data={data} />}

      {currentUser.role === "supervisor" && active === "entry" && (
        <SupervisorEntry user={currentUser} project={project} teams={teams} equipmentList={equipmentList} materialsList={materialsList} fieldConfig={fieldConfig} setData={setData} />
      )}
      {currentUser.role === "supervisor" && active === "mine" && <SupervisorMine user={currentUser} data={data} ctx={ctx} />}
    </Shell>
  );
}
