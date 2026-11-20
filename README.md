# 🧭 Career Compass (Indian College Student Edition)

> **"Not a career test. A journey of discovery."**  
> An adaptive, RIASEC-informed AI career discovery engine tailored specifically for Indian undergraduate students navigating real academic, financial, and societal trade-offs.

---

## ⚡ What is Career Compass?

Most career assessments subject students to 50 repetitive, static multiple-choice questions and predictably advise every STEM student to become a software engineer.

**Career Compass re-architects this experience:**
- **Dynamic Adaptive Probing:** Powered by **Google Gemini AI (`gemini-1.5-flash`)** and a deterministic selection engine, each question is chosen in real time based on your previous answers to test depth, explore cross-domain intersections (e.g., Tech + Business, Biology + Psychology), and probe real situational dilemmas.
- **100% Deterministic Engine:** The LLM **never** decides your scores. Profile scoring and career matching rely on an 18-dimensional vector cosine similarity engine ($0.40$ Interests, $0.25$ Workstyle, $0.25$ Values, $0.10$ Aptitude baseline).
- **Curated for India:** 25 realistic Indian career paths complete with required degrees, entrance exams (**JEE, CAT, UPSC CSE, GATE, NEET, CLAT, NIFT**), Tier-1/2 placement realities, and honest career downsides.
- **Fail-Safe & Fast:** Gemini calls have a 15-second timeout, native JSON mode (`responseMimeType: "application/json"`), and Zod schema validation; if Gemini is offline or rate-limited, the system falls back seamlessly to deterministic heuristics.
- **Neo-Brutalist UI:** A distinctive, high-energy Neo-Brutalist interface with subtle pastel accents, bold black borders, hard drop shadows, and accessible keyboard navigation.
- **Zero Database, Zero Tracking:** 100% private. Session state lives strictly in the student's browser `localStorage`.

---

## 📐 Architecture & Methodology

```
┌────────────────────────────────────────────────────────┐
│                   Student Browser                      │
│      (Client State in localStorage, Zero DB/Auth)      │
└───────────────────────┬────────────────────────────────┘
                        │ POST { profile, lastAnswer }
                        ▼
┌────────────────────────────────────────────────────────┐
│           Next.js 14 API Route Handler                 │
│      - Sliding Window In-Memory Rate Limiting          │
│      - Max Body Size Safeguard (100 KB)                │
└───────────────────────┬────────────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
┌──────────────────────────┐    ┌─────────────────────────┐
│   Deterministic Engine   │    │     Gemini LLM API      │
│  - applyAnswer()         │    │  (Google Gemini Flash)  │
│  - normalizedProfile()   │    │  - 15s strict timeout   │
│  - getCandidates() (8)   │    │  - Native JSON output   │
│  - shouldStop() (20)     │    │  - Picks 1 candidate    │
│  - fallbackPick()        │    │  - 1-line reason        │
└──────────────┬───────────┘    └────────────┬────────────┘
               │                             │
               └──────────────┬──────────────┘
                              │ Validated via Zod
                              ▼
┌────────────────────────────────────────────────────────┐
│                  Next Question + Probe                 │
│         (Deep, Cross-Domain, or Challenge)             │
└────────────────────────────────────────────────────────┘
```

### The 18-Dimensional Profile Vector
1. **6 RIASEC Interest Dimensions:**
   - `R` (Realistic — Practical, hands-on, mechanical)
   - `I` (Investigative — Analytical, scientific, research)
   - `A` (Artistic — Creative, expressive, design)
   - `S` (Social — Empathetic, teaching, human connection)
   - `E` (Enterprising — Leadership, persuasion, business)
   - `C` (Conventional — Structured, operational, data accuracy)
2. **4 Bipolar Workstyle Spectrums ($-1.0$ to $+1.0$):**
   - Independent focus vs. Collaborative team work
   - Structured SOPs vs. Flexible agility
   - Practical execution vs. Conceptual theory
   - Leadership direction vs. Specialist contribution
3. **8 Motivating Values ($0.0$ to $10.0$):**
   - High Salary, Job Security, Work-Life Balance, Societal Impact, Autonomy, Fast Growth, Prestige, Creative Freedom.

---

## 🛠️ Project Structure (Pure JavaScript)

```
CareerCompass/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.js         # Health check endpoint
│   │   │   ├── next-question/route.js  # Adaptive questioning loop with Gemini fallback
│   │   │   └── report/route.js         # Final 18D synthesis & narrative generation
│   │   ├── assess/page.jsx             # Adaptive interview screen (5 sections, stepper)
│   │   ├── results/page.jsx            # 6 matched careers/directions, PDF print
│   │   ├── auth/page.jsx               # Student registration & sign in with profile
│   │   ├── profile/page.jsx            # Student saved profile & RIASEC history
│   │   ├── layout.jsx                  # Root layout with dual brutalist themes
│   │   └── page.jsx                    # Landing page (Hero, 3-step workflow, adaptive info)
│   ├── data/
│   │   ├── questions.json              # 88 questions across 5 segments & 5 sections
│   │   └── careers.json                # 32 pathways (7 stream directions + 25 careers)
│   └── lib/
│       ├── types.js                    # Zod schemas for all domain entities
│       ├── profile.js                  # Pure vector updates & normalization
│       ├── matching.js                 # 18D weighted cosine similarity engine
│       ├── selector.js                 # 5 sections, segment filtering & mini-challenges
│       ├── gemini.js                   # Resilient Google Gemini API client
│       └── rateLimit.js                # Sliding-window in-memory IP rate limiter
├── scripts/
│   ├── sim.js                          # Multi-student simulation (Tech+Biz vs Psych+Bio)
│   └── generate_data.js                # Dataset generator for questions & careers
├── tests/
│   ├── selector.test.js                # Vitest unit tests for stopping & probe mix
│   ├── next_question.test.js           # Vitest unit tests for /api/next-question
│   └── report.test.js                  # Vitest unit tests for /api/report
├── vitest.config.js                    # Vitest configuration with @ alias
├── tailwind.config.js                  # Neo-Brutalist color palette & hard drop shadows
└── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.18.0 or newer (Node v20+ recommended)
- **npm** or **pnpm**

### 1. Clone & Install
```bash
git clone https://github.com/your-username/career-compass.git
cd career-compass
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Google Gemini API key:
```env
# Required for adaptive AI question selection and holistic report narrative
GEMINI_API_KEY=AIzaSy-your-gemini-api-key-here

# Optional: defaults to gemini-1.5-flash
GEMINI_MODEL=gemini-1.5-flash
```
> **Note:** If `GEMINI_API_KEY` is omitted or invalid, Career Compass automatically defaults to its built-in deterministic heuristics. The app remains 100% functional!

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests & Student Simulation
```bash
# Run all Vitest unit tests (deterministic selector, APIs, rate limiting)
npm run test

# Run student profile simulation across all 5 audience segments
npm run sim

# Verify production build
npm run build
```

---

## 🔒 Security, Reliability & Compliance

1. **In-Memory Rate Limiting:** Sliding-window rate limiter protects API endpoints (`45 req/min` for next-question, `20 req/min` for report generation) against abuse.
2. **Payload Size Guard:** Strict `100 KB` maximum body size enforced on all incoming API requests.
3. **No Sensitive Logging:** API keys and sensitive student traces are kept strictly server-side and never logged to stdout or client bundles.
4. **Resilient Timeouts & Retry:** 15-second timeout on all LLM requests with 1 automatic retry and graceful fallback to mathematical heuristics.
5. **AI Status Diagnostic Endpoint:** `/api/ai-status` allows real-time diagnostics of Gemini connectivity, latency, model status, and error traces without ever exposing the API key.
6. **Accessibility (a11y):** Formatted with WCAG AA compliance in mind—high-contrast text, full keyboard navigation with visible focus rings (`focus-visible`), ARIA progress bar semantics, and screen-reader labels.
7. **Framing Compliance:** Explicitly framed as **"exploratory and RIASEC-informed"**, never "scientifically validated" or a medical psychometric diagnosis.

---

## 🌐 Deploying to Vercel

Career Compass is architected to be 100% serverless, zero-database, and production-ready for instant Vercel deployment.

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "feat: Initial Career Compass commit"
   git remote add origin https://github.com/<your-username>/career-compass.git
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your `career-compass` repository from the list and click **"Import"**.
3. **Configure Project Settings**:
   - **Framework Preset:** `Next.js` (detected automatically).
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (or leave default).
   - **Output Directory:** `.next` (or leave default).
4. **Add Environment Variables**:
   In the **"Environment Variables"** section, select **Production, Preview, and Development**, then add:
   | Key | Value | Notes |
   |---|---|---|
   | `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key from [aistudio.google.com](https://aistudio.google.com/) |
   | `GEMINI_MODEL` | `gemini-1.5-flash` | *(Optional, default: `gemini-1.5-flash`)* |

   > **⚠️ CRITICAL: Always Redeploy After Setting Environment Variables**  
   > In Vercel, adding or editing environment variables **does not affect existing deployments automatically**. You MUST trigger a **Redeploy** (Deployments → click "..." next to latest build → "Redeploy") for new environment variables to take effect!

5. **Deploy / Redeploy**:
   - Click **"Deploy"** (or **"Redeploy"**). Vercel will install dependencies, build the Next.js bundle, and output a live URL (e.g., `https://career-compass.vercel.app`).
   - Visit `https://your-deployment.vercel.app/api/ai-status` to immediately verify Gemini connectivity.

---

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
2. **Log In to Vercel**:
   ```bash
   vercel login
   ```
3. **Link and Deploy**:
   ```bash
   # Link project
   vercel

   # Add environment variables
   vercel env add GEMINI_API_KEY production
   vercel env add GEMINI_MODEL production

   # Deploy to production
   vercel --prod
   ```

---

## 📄 License
MIT License. Built with ❤️ for Indian college students.
