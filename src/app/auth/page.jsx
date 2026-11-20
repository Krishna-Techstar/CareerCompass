"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signin, signup } = useAuth();
  const { isDark } = useTheme();

  const [mode, setMode] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync mode with query param ?mode=signin or ?mode=signup if provided
  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "signin" || qMode === "signup") {
      setMode(qMode);
    }
  }, [searchParams]);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signin(signInEmail, signInPassword);
      setSuccessMsg("Welcome back! Redirecting to your profile...");
      setTimeout(() => {
        router.push("/profile");
      }, 500);
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (signUpForm.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: signUpForm.email,
        password: signUpForm.password,
        name: signUpForm.name,
        age: signUpForm.age ? Number(signUpForm.age) : null,
        classLevel: signUpForm.classLevel,
        highestEducation: signUpForm.highestEducation,
        institution: signUpForm.institution,
        stream: signUpForm.stream,
        city: signUpForm.city,
        state: signUpForm.state,
        pincode: signUpForm.pincode,
        country: signUpForm.country,
        aspirations: signUpForm.aspirations,
      };

      await signup(payload);
      setSuccessMsg("Account created! Redirecting to customize your journey...");
      setTimeout(() => {
        router.push("/onboarding");
      }, 600);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen py-10 px-4 sm:px-8 transition-colors duration-200 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-black"
      }`}
    >
      <div className="mx-auto max-w-2xl">
        {/* Header sticker */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border-2 border-black bg-lime-400 px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-lime-300 transition-all"
          >
            ← Back to Home
          </Link>
          <span className="rounded-lg border-2 border-black bg-purple-300 px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            🔒 Secure Profile Vault
          </span>
        </div>

        {/* Card Container */}
        <div
          className={`rounded-3xl p-6 sm:p-10 transition-all ${
            isDark
              ? "border-2 border-neutral-700 bg-[#121212] shadow-[8px_8px_0px_#000]"
              : "border-3 border-black bg-white shadow-[8px_8px_0px_#000]"
          }`}
        >
          {/* Title */}
          <div className="mb-6 text-center sm:text-left">
            <h1
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {mode === "signin" ? "Sign In to Career Compass" : "Create Student Account"}
            </h1>
            <p
              className={`mt-2 text-xs sm:text-sm font-bold ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              {mode === "signin"
                ? "Access your saved Indian career discovery profile and RIASEC results."
                : "Register to save your educational background, location, and career aspirations."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className={`mb-8 grid grid-cols-2 gap-2 rounded-2xl border-2 p-1.5 shadow-[3px_3px_0px_#000] ${
              isDark
                ? "border-neutral-700 bg-neutral-900"
                : "border-black bg-neutral-100"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                mode === "signup"
                  ? "border-2 border-black bg-lime-400 text-black shadow-[2px_2px_0px_#000]"
                  : isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              ✨ Sign Up & Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                mode === "signin"
                  ? "border-2 border-black bg-lime-400 text-black shadow-[2px_2px_0px_#000]"
                  : isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              🔑 Sign In
            </button>
          </div>

          {/* Error & Success Feedback */}
          {error && (
            <div className="mb-6 rounded-2xl border-2 border-black bg-rose-400 p-4 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-black">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-2xl border-2 border-black bg-emerald-400 p-4 text-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs font-black">
              <span className="text-base">✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= SIGN IN FORM ================= */}
          {mode === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-5">
              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@college.edu.in"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="input-brutal w-full"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="input-brutal w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border-2 border-black bg-lime-400 py-4 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000] hover:bg-lime-300 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Signing In..." : "Sign In to Account →"}
              </button>
            </form>
          ) : (
            /* ================= SIGN UP & PROFILE FORM ================= */
            <form onSubmit={handleSignUpSubmit} className="space-y-6">
              {/* Step 1: Account Credentials */}
              <div
                className={`rounded-2xl border-2 p-4 sm:p-5 shadow-[3px_3px_0px_#000] ${
                  isDark
                    ? "border-neutral-700 bg-[#161616]"
                    : "border-black bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md border-2 border-black bg-purple-300 px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000]">
                    Step 1
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Account Credentials
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder="student@example.com"
                      value={signUpForm.email}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      name="password"
                      placeholder="••••••••"
                      value={signUpForm.password}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={signUpForm.confirmPassword}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Student Profile & Education */}
              <div
                className={`rounded-2xl border-2 p-4 sm:p-5 shadow-[3px_3px_0px_#000] ${
                  isDark
                    ? "border-neutral-700 bg-[#161616]"
                    : "border-black bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md border-2 border-black bg-lime-400 px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000]">
                    Step 2
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Student Background & Education
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      placeholder="e.g. Aarav Mehta"
                      value={signUpForm.name}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
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
                      placeholder="e.g. 20"
                      value={signUpForm.age}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Current Class / Year
                    </label>
                    <select
                      name="classLevel"
                      value={signUpForm.classLevel}
                      onChange={handleSignUpChange}
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
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Highest Education
                    </label>
                    <select
                      name="highestEducation"
                      value={signUpForm.highestEducation}
                      onChange={handleSignUpChange}
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
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      College / School Name
                    </label>
                    <input
                      type="text"
                      name="institution"
                      placeholder="e.g. Delhi University / IIT Delhi"
                      value={signUpForm.institution}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Major / Academic Stream
                    </label>
                    <input
                      type="text"
                      name="stream"
                      placeholder="e.g. Computer Science / Commerce / Bio"
                      value={signUpForm.stream}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Location / Address */}
              <div
                className={`rounded-2xl border-2 p-4 sm:p-5 shadow-[3px_3px_0px_#000] ${
                  isDark
                    ? "border-neutral-700 bg-[#161616]"
                    : "border-black bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md border-2 border-black bg-sky-300 px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000]">
                    Step 3
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Address & Location
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      City / Town
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai / Pune"
                      value={signUpForm.city}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      State / UT
                    </label>
                    <select
                      name="state"
                      value={signUpForm.state}
                      onChange={handleSignUpChange}
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
                      className={`block text-xs font-black uppercase tracking-wider mb-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="e.g. 400001"
                      value={signUpForm.pincode}
                      onChange={handleSignUpChange}
                      className="input-brutal w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Career Goals / Aspirations */}
              <div
                className={`rounded-2xl border-2 p-4 sm:p-5 shadow-[3px_3px_0px_#000] ${
                  isDark
                    ? "border-neutral-700 bg-[#161616]"
                    : "border-black bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md border-2 border-black bg-orange-300 px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000]">
                    Step 4
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    Career Aspirations & Ambition
                  </span>
                </div>

                <div>
                  <label
                    className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    What are your dream career paths or questions you want answered?
                  </label>
                  <textarea
                    rows={3}
                    name="aspirations"
                    placeholder="e.g. Exploring Product Management, AI startups, or preparing for CAT/UPSC."
                    value={signUpForm.aspirations}
                    onChange={handleSignUpChange}
                    className="input-brutal w-full"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border-2 border-black bg-lime-400 py-4 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000] hover:bg-lime-300 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving Profile & Creating Account..." : "Create Account & Save Profile →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white font-bold text-sm">
          <div className="flex items-center gap-2">
            <span className="animate-spin text-xl">🧭</span> Loading Career Compass Auth...
          </div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
