"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext.jsx";
import { useTheme } from "../../components/ThemeContext.jsx";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi NCR",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other",
];

const CLASS_OPTIONS = [
  "Class 11th",
  "Class 12th",
  "College 1st Year",
  "College 2nd Year",
  "College 3rd Year",
  "College 4th Year (Final Year)",
  "Postgraduate 1st Year",
  "Postgraduate 2nd Year",
  "Recent Graduate",
  "Working Professional",
];

const EDUCATION_OPTIONS = [
  "Secondary School (10th)",
  "Higher Secondary (12th / PUC)",
  "Polytechnic / Diploma",
  "Undergraduate (B.Tech / B.E.)",
  "Undergraduate (B.Sc / BCA)",
  "Undergraduate (B.Com / BBA)",
  "Undergraduate (B.A. / Law)",
  "Postgraduate (M.Tech / M.Sc / MCA)",
  "Postgraduate (MBA / PGDM)",
  "Doctorate / PhD",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signout } = useAuth();
  const { isDark } = useTheme();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    classLevel: "College 1st Year",
    highestEducation: "Higher Secondary (12th / PUC)",
    institution: "",
    stream: "",
    city: "",
    state: "Delhi NCR",
    pincode: "",
    country: "India",
    aspirations: "",
  });

  // Load user data into form on mount or when user changes
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user && user.profile) {
      const p = user.profile;
      setForm({
        name: p.name || "",
        age: p.age !== null && p.age !== undefined ? String(p.age) : "",
        classLevel: p.classLevel || "College 1st Year",
        highestEducation: p.highestEducation || "Higher Secondary (12th / PUC)",
        institution: p.institution || "",
        stream: p.stream || "",
        city: p.address?.city || p.city || "",
        state: p.address?.state || p.state || "Delhi NCR",
        pincode: p.address?.pincode || p.pincode || "",
        country: p.address?.country || p.country || "India",
        aspirations: p.aspirations || "",
      });
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name: form.name,
        age: form.age ? Number(form.age) : null,
        classLevel: form.classLevel,
        highestEducation: form.highestEducation,
        institution: form.institution,
        stream: form.stream,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
        aspirations: form.aspirations,
      };

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccessMsg("Profile saved to database! When you sign in next time, all your info is preserved.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div
        className={`min-h-screen py-16 px-4 flex items-center justify-center ${
          isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
        }`}
      >
        <div className="flex items-center gap-3 font-black text-lg">
          <span className="animate-spin text-2xl">🧭</span> Loading user profile...
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen py-10 px-4 sm:px-8 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        {/* Navigation & Actions Top Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-lime-400 px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]"
            >
              ← Home
            </Link>
            <span
              className={`text-xs font-bold ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Logged in as <strong className={isDark ? "text-white" : "text-black"}>{user?.email}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assess"
              className="rounded-xl border-2 border-black bg-lime-400 px-4 py-1.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:bg-lime-300 transition-all"
            >
              ⚡ Start Assessment →
            </Link>
            <button
              onClick={handleSignOut}
              className={`rounded-xl border-2 px-3 py-1.5 text-xs font-black uppercase transition-colors ${
                isDark
                  ? "border-neutral-700 bg-neutral-900 text-rose-300 hover:border-rose-400 hover:text-white"
                  : "border-black bg-white text-rose-600 hover:bg-rose-50 shadow-brutal-sm"
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div
          className={`mb-8 rounded-3xl p-6 sm:p-8 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[6px_6px_0px_#000]"
              : "border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-purple-300 font-black text-2xl text-black shadow-[3px_3px_0px_#000]">
                {form.name ? form.name.charAt(0).toUpperCase() : "👤"}
              </div>
              <div>
                <span className="rounded-md border border-black bg-lime-400 px-2 py-0.5 text-[10px] font-black uppercase text-black">
                  Verified Student Profile
                </span>
                <h1
                  className={`text-2xl sm:text-3xl font-black mt-1 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {form.name || "Student Profile"}
                </h1>
                <p
                  className={`text-xs font-bold mt-0.5 ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  {user?.email} • Account ID: {user?.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl border-2 border-black bg-sky-300 px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                🇮🇳 {form.state || "India"}
              </span>
            </div>
          </div>
        </div>

        {/* Success & Error Notifications */}
        {successMsg && (
          <div className="mb-6 rounded-2xl border-2 border-black bg-emerald-400 p-4 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-bold">
            <span className="text-base font-black">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-2xl border-2 border-black bg-rose-400 p-4 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-bold">
            <span className="text-base font-black">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div
            className={`rounded-3xl p-6 sm:p-8 transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[5px_5px_0px_#000]"
                : "border-3 border-black bg-white shadow-[5px_5px_0px_#000]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg font-black uppercase tracking-tight ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Personal & Academic Information
                </h2>
                <p
                  className={`text-xs font-bold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Stored securely in database for career matching calibrations.
                </p>
              </div>
              <span className="rounded-full border border-black bg-lime-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                Basic Info
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Aarav Mehta"
                  value={form.name}
                  onChange={handleChange}
                  className="input-brutal w-full"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Age
                </label>
                <input
                  type="number"
                  min={13}
                  max={65}
                  name="age"
                  placeholder="e.g. 21"
                  value={form.age}
                  onChange={handleChange}
                  className="input-brutal w-full"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Class / Current Year
                </label>
                <select
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleChange}
                  className="input-brutal w-full"
                >
                  {CLASS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Highest Education Level
                </label>
                <select
                  name="highestEducation"
                  value={form.highestEducation}
                  onChange={handleChange}
                  className="input-brutal w-full"
                >
                  {EDUCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  College / School / University
                </label>
                <input
                  type="text"
                  name="institution"
                  placeholder="e.g. BITS Pilani / St. Stephen's"
                  value={form.institution}
                  onChange={handleChange}
                  className="input-brutal w-full"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Major / Discipline / Stream
                </label>
                <input
                  type="text"
                  name="stream"
                  placeholder="e.g. Computer Science / Commerce / Bio"
                  value={form.stream}
                  onChange={handleChange}
                  className="input-brutal w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div
            className={`rounded-3xl p-6 sm:p-8 transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[5px_5px_0px_#000]"
                : "border-3 border-black bg-white shadow-[5px_5px_0px_#000]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg font-black uppercase tracking-tight ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Location & Address
                </h2>
                <p
                  className={`text-xs font-bold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Calibrates state-level entrance exams and regional opportunity hubs.
                </p>
              </div>
              <span className="rounded-full border border-black bg-sky-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                Location
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  City / Town
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru / Hyderabad"
                  value={form.city}
                  onChange={handleChange}
                  className="input-brutal w-full"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  State / Union Territory
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="input-brutal w-full"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="e.g. 560001"
                  value={form.pincode}
                  onChange={handleChange}
                  className="input-brutal w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Career Goals & Aspirations */}
          <div
            className={`rounded-3xl p-6 sm:p-8 transition-all ${
              isDark
                ? "border-2 border-neutral-700 bg-[#121212] shadow-[5px_5px_0px_#000]"
                : "border-3 border-black bg-white shadow-[5px_5px_0px_#000]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg font-black uppercase tracking-tight ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Career Aspirations & Ambitions
                </h2>
                <p
                  className={`text-xs font-bold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Describe what you want to achieve or explore.
                </p>
              </div>
              <span className="rounded-full border border-black bg-orange-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-black">
                Goals
              </span>
            </div>

            <textarea
              rows={3}
              name="aspirations"
              placeholder="e.g. Keen to break into venture capital, strategy consulting, or building high-scale consumer software."
              value={form.aspirations}
              onChange={handleChange}
              className="input-brutal w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl border-2 border-black bg-lime-400 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000] hover:bg-lime-300 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving to Database..." : "Save Profile Data 💾"}
            </button>

            <Link
              href="/assess"
              className="rounded-2xl border-2 border-black bg-purple-300 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000] hover:bg-purple-200 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              Launch Assessment →
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
