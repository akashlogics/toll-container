import React, { useState } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { signIn } from "./lib/api";

const NAVY = "#1F3A5F";
const GOLD = "#B8862B";
const GOLD_LT = "#E7C77E";
const BG = "#F4F6F8";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // No further action needed here -- App.jsx listens for the auth
      // state change and takes over once the session exists.
    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Wrong email or password." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BG }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Building2 size={22} color={GOLD} />
            <span className="text-sm font-semibold tracking-wide" style={{ color: GOLD }}>KUMAR &amp; CO.</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>Project &amp; Labour Management</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in with the email your admin set up for you.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="block mb-3">
            <span className="block text-xs font-medium text-slate-600 mb-1">Email</span>
            <input
              type="email"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]/30 focus:border-[#1F3A5F]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-xs font-medium text-slate-600 mb-1">Password</span>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]/30 focus:border-[#1F3A5F]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            />
          </label>
          {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: NAVY }}
          >
            <ShieldCheck size={15} />
            {loading ? "Signing in\u2026" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4">Forgot your password? Ask your admin to reset it from Team &amp; Access.</p>
      </div>
    </div>
  );
}
