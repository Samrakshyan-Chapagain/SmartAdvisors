# SmartAdvisors

A UTA course recommendation and degree planning app. Upload your transcript, choose your college and degree, set preferences, and get personalized professor and course recommendations — or sign in with Google to generate a full semester-by-semester degree plan.

## Supported Degrees

### College of Engineering
- Computer Science (CSE)
- Civil Engineering (CE)
- Electrical Engineering (EE)
- Mechanical/Aerospace Engineering (MAE)
- Industrial Engineering (IE)

> More colleges coming soon (Business, Science, Nursing, Liberal Arts). See `client/src/config/colleges.ts` to add new ones.

---

## Project Structure

```
SmartAdvisors/
├── client/                          # React/TypeScript frontend (Vite)
│   ├── src/
│   │   ├── main.tsx                 # Entry point — wraps app in GoogleOAuthProvider
│   │   ├── App.tsx                  # Main app orchestrator (step flow + auth state)
│   │   ├── config/
│   │   │   └── colleges.ts          # Shared college/degree config (single source of truth)
│   │   └── components/
│   │       ├── WelcomePage.tsx       # Landing page (guest vs. sign in)
│   │       ├── LoginPage.tsx         # Google Sign-In + guest option
│   │       ├── DisclaimerModal.tsx   # Disclaimer shown on first load
│   │       ├── UploadScreen.tsx      # Transcript upload + college/degree dropdowns
│   │       ├── TranscriptReview.tsx  # Review parsed courses before continuing
│   │       ├── PreferenceForm.tsx    # Student preference toggles (both flows)
│   │       ├── RecommendationDashboard.tsx  # Professor + course recommendations (guest)
│   │       ├── DegreePlanSetup.tsx   # Course picker + elective selection + credit hours (signed-in)
│   │       ├── SemesterPlanView.tsx  # Full semester-by-semester plan (signed-in)
│   │       ├── WelcomeBack.tsx       # Returning user dashboard with plan summary
│   │       ├── ProcessingOverlay.tsx # Reusable loading overlay with animated steps
│   │       └── Layout.tsx           # Top navbar (logo, user profile, sign out)
│   ├── .env                         # Local only — NOT committed (see setup below)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Flask/Python backend
│   ├── run.py                       # Entry point — starts Flask on port 8000
│   ├── app/
│   │   ├── __init__.py              # Flask app factory
│   │   ├── routes.py                # API endpoints
│   │   ├── config.py                # Flask configuration
│   │   ├── models.py                # SQLAlchemy models (professors.db)
│   │   └── scripts/
│   │       ├── parse_transcript.py          # PDF transcript parser
│   │       ├── recommendation_engine.py     # Core algorithm + course equivalences
│   │       ├── load_degree_plan.py          # Loads CSV degree plans into classes.db
│   │       └── scrape_uta_catalog.py        # Tool to generate CSVs from UTA catalog
│   └── data/
│       ├── classes.db               # Degree plan tables (ClassesForCE, ClassesForCSE, etc.)
│       ├── grades.sqlite            # UTA grade distribution data
│       ├── professors.db            # RateMyProfessors data
│       └── *.csv                   # Degree plan CSVs (one per major)
│
├── requirements.txt                 # Python dependencies
└── .env.example                     # Template for environment variables
```

---

## Running Locally (Step-by-Step)

Follow these steps exactly. You need two terminals open — one for the frontend, one for the backend.

---

### Before You Start — Install These Once

If you don't have these already, install them first:

- **Git** — https://git-scm.com/downloads
- **Node.js 18+** — https://nodejs.org (choose the LTS version)
- **Python 3.10+** — https://www.python.org/downloads

To check if you have them, run:
```bash
git --version
node --version
python3 --version
```

---

### Step 1 — Clone the Repo

```bash
git clone https://github.com/acmuta/SmartAdvisors.git
cd SmartAdvisors
```

> If you already cloned it before, just pull the latest:
> ```bash
> git pull
> ```

---

### Step 2 — Create the Frontend `.env` File

This file holds the Google Sign-In key. It is **not** in the repo (for security), so you have to create it manually. **You only do this once.**

**Mac/Linux:**
```bash
echo "VITE_GOOGLE_CLIENT_ID=24693373849-lj8avjqbcppv05125st5kj3q29k1u6jn.apps.googleusercontent.com" > client/.env
```

**Windows** (Command Prompt):
```cmd
echo VITE_GOOGLE_CLIENT_ID=24693373849-lj8avjqbcppv05125st5kj3q29k1u6jn.apps.googleusercontent.com > client\.env
```

Or manually create `client/.env` and paste:
```
VITE_GOOGLE_CLIENT_ID=24693373849-lj8avjqbcppv05125st5kj3q29k1u6jn.apps.googleusercontent.com
```

> **Note:** Without this file, the guest flow still works — but Google Sign-In won't.

---

### Step 3 — Start the Frontend

Open **Terminal 1** and run:

```bash
cd client
npm install
npm run dev
```

You should see something like:
```
  VITE v5.x.x  ready in ...ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. Leave this terminal running.

---

### Step 4 — Start the Backend

Open **Terminal 2** and run:

**Mac/Linux:**
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
python3 run.py
```

**Windows:**
```cmd
cd server
python -m venv venv
venv\Scripts\activate
pip install -r ..\requirements.txt
python run.py
```

You should see:
```
 * Running on http://127.0.0.1:8000
```

Leave this terminal running too.

---

### Step 5 — You're Done

With both terminals running, go to **http://localhost:5173** in your browser. The app should be fully working.

> **Note:** You need both the frontend (port 5173) and backend (port 8000) running at the same time for the app to work.

---

### Next Time You Work on It

You don't need to redo everything. Just:

**Terminal 1:**
```bash
cd client
npm run dev
```

**Terminal 2:**
```bash
cd server
source venv/bin/activate     # Windows: venv\Scripts\activate
python3 run.py
```

---

## Deploying

The app has two parts to deploy: a **React frontend** (static files) and a **Flask backend** (Python server).

A `Procfile` is already included for platforms like Render/Heroku:
```
web: cd server && gunicorn run:app
```

---

### Databases — No Keys or Credentials Needed

All three databases are **plain SQLite files** included in the repo under `server/data/`. There are no database passwords, connection strings, or keys to configure. They just work.

| Database | What it holds |
|---|---|
| `professors.db` | RateMyProfessors ratings and tags |
| `classes.db` | Degree plan tables (one per major) |
| `grades.sqlite` | UTA grade distribution data |

The backend auto-detects these files from `server/data/` — no environment variable needed.

> **Optional:** If you want to use a cloud PostgreSQL database instead of SQLite, set the `DATABASE_URL` env var on your hosting platform. The app will use it automatically.

---

### Environment Variables for Deployment

| Variable | Where to set | Required? | Notes |
|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Frontend build env | Yes (for Google login) | Same Client ID as local dev, but you must add your production domain to **Authorized JavaScript Origins** in [Google Cloud Console](https://console.cloud.google.com) |
| `SECRET_KEY` | Backend env | Yes for production | Any random string — set it in your hosting platform's env var settings |
| `DATABASE_URL` | Backend env | Only if using PostgreSQL | Not needed when using the included SQLite files |

---

### Deploy the Frontend

```bash
cd client
echo "VITE_GOOGLE_CLIENT_ID=24693373849-lj8avjqbcppv05125st5kj3q29k1u6jn.apps.googleusercontent.com" > .env
npm install
npm run build
```

This creates a `dist/` folder with static files. Deploy that folder to **Vercel**, **Netlify**, **Render**, or any static hosting.

> **Google Sign-In will NOT work until you do this:**
> 1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth Client ID
> 2. Under **Authorized JavaScript Origins**, add your production URL (e.g., `https://smartadvisors.onrender.com`) — no trailing slash
> 3. Leave **Authorized redirect URIs** empty (the app uses popup flow, not redirects)
> 4. Save and wait a few minutes for changes to propagate
>
> If you see `Error 400: redirect_uri_mismatch`, this is the fix.

---

### Deploy the Backend (Render Example)

1. Connect your GitHub repo on [Render](https://render.com)
2. Create a new **Web Service**
3. Set **Root Directory** to `server`
4. **Build Command:** `pip install -r ../requirements.txt`
5. **Start Command:** `gunicorn run:app`
6. Add environment variable: `SECRET_KEY` = any random string
7. Deploy — the SQLite databases are included in the repo, so no database add-on is needed

---

### Gotcha: Hardcoded API URL

The frontend currently has the backend URL hardcoded to `http://127.0.0.1:8000` in two files:
- `client/src/App.tsx` (line 15)
- `client/src/components/DegreePlanSetup.tsx` (line 34)

**Before deploying**, change these to your production backend URL:
```typescript
const API_URL = 'https://your-backend-url.onrender.com';
```

Or make it dynamic with an environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
```
Then set `VITE_API_URL` in your frontend `.env` or hosting platform.

---

### CORS

The backend currently allows all origins (`CORS(app)`), which is fine for development. For production, you can restrict it in `server/app/__init__.py`:
```python
CORS(app, origins=["https://your-frontend-domain.com"])
```

---

## App Flow

```
WelcomePage
├── Continue as Guest
│   └── UploadScreen → TranscriptReview → PreferenceForm → RecommendationDashboard
└── Sign In (Google) → LoginPage
    ├── New User
    │   └── UploadScreen → TranscriptReview → PreferenceForm → DegreePlanSetup → SemesterPlanView
    └── Returning User
        └── WelcomeBack (shows saved plan summary, progress bar, quick actions)
```

### Guest Mode
1. Upload transcript PDF
2. Select college → select degree (two cascading dropdowns)
3. Review parsed courses
4. Set professor preferences (extra credit, clear grading, etc.)
5. Get recommended courses + ranked professors

### Signed-In Mode (Google)
1. Sign in with Google
2. Upload transcript PDF
3. Select college → select degree
4. Review parsed courses
5. Set professor preferences
6. Choose elective focus areas (security, AI/ML, etc.) and pick courses for next semester
7. Set credit hour target and semester start
8. Get a full semester-by-semester degree plan to graduation
9. Plan is saved — returning users see a dashboard with progress and quick actions

---

## How It Works

### Algorithm Overview
- Parses transcript PDF to extract completed courses
- Expands completed set with transitive prerequisites and course equivalences (e.g., MATH 3313 ↔ IE 3301)
- Filters degree plan to find courses with all prerequisites satisfied
- Looks up professors from grade distribution and RateMyProfessors data
- Scores professors based on student preferences (extra credit, difficulty, tags, etc.)
- For degree plans: uses greedy topological scheduling to generate semester-by-semester plans

### Scoring Signals
- `quality_rating` — primary base score (0–5)
- `would_take_again` — strong trust signal, boosts/dampens base score
- `total_ratings` — confidence multiplier (fewer reviews = regress toward neutral)
- `difficulty_rating` — used when `clearGrading` preference is set
- `tags` — matched against actual RateMyProfessors tag strings

---

## Databases

All databases are included in the repo under `server/data/`. No external database setup needed.

| Database | Contents |
|---|---|
| `classes.db` | Degree plan tables for each major (ClassesForCE, ClassesForCSE, etc.) |
| `grades.sqlite` | UTA grade distribution data (course offerings, GPAs, instructor names) |
| `professors.db` | RateMyProfessors data (ratings, difficulty, tags) |

### Updating Degree Plans

To reload a specific degree plan from its CSV:
```bash
cd server
source venv/bin/activate
python3 app/scripts/load_degree_plan.py CSE   # or CE, EE, IE, MAE
```

To reload all degree plans:
```bash
python3 app/scripts/load_degree_plan.py
```

CSV format:
```
Formal Name,Course Name,Prerequisites,Corequisites,Requirement
CSE 1310,Introduction to Computers and Programming,[None],[None],required
CSE 4303,Computer Graphics,"CSE 3380, CSE 3318",[None],elective
```

### Adding a New Degree
1. Add the college/degree entry in `client/src/config/colleges.ts`
2. Create a CSV in `server/data/` (e.g., `ACCT Degree Plan CSV.csv`)
3. Run `python3 app/scripts/load_degree_plan.py ACCT`
4. The rest of the app picks it up automatically

---

## API Endpoints

### POST `/api/parse-transcript`
Upload a transcript PDF to extract completed courses.

**Request:** `multipart/form-data` with `transcript` field (PDF file)

**Response:**
```json
{
  "success": true,
  "courses": ["CSE 1310", "CSE 1320", "MATH 1426"]
}
```

### POST `/api/recommendations`
Get course and professor recommendations (guest flow).

**Request:** `multipart/form-data`
- `completed_courses` — JSON array of course codes
- `department` — major code (CE, CSE, EE, MAE, IE)
- `preferences` — JSON object of preference flags

**Response:**
```json
{
  "success": true,
  "recommendations": [...],
  "electiveRecommendations": [...],
  "stats": {
    "totalRequiredCourses": 30,
    "completedRequiredCourses": 12,
    "totalElectiveSlots": 7,
    "remainingElectiveSlots": 7
  }
}
```

### POST `/api/degree-plan`
Generate a full semester-by-semester degree plan (signed-in flow).

**Request:** `application/json`
```json
{
  "completed_courses": ["CSE 1310", "CSE 1320"],
  "department": "CSE",
  "credits_per_semester": 15,
  "selected_next_semester": ["CSE 2312", "CSE 2315"],
  "chosen_electives": ["CSE 4308", "CSE 4380"],
  "preferences": { "extraCredit": true },
  "start_semester": "Fall",
  "start_year": 2025,
  "include_summer": false
}
```

**Response:**
```json
{
  "success": true,
  "plan": [...],
  "totalSemesters": 6,
  "totalRemainingHours": 78,
  "eligibleCourses": [...],
  "allElectives": [...],
  "requiredElectiveCount": 7,
  "stats": {
    "totalCourses": 43,
    "completedCourses": 12,
    "totalHours": 128,
    "completedHours": 38
  }
}
```

---

## Google Sign-In Setup (for contributors)

Google Sign-In uses `@react-oauth/google`. The Client ID is free and requires no billing.

To create your own Client ID for local development:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → OAuth consent screen → External
3. APIs & Services → Credentials → Create OAuth Client ID → Web application
4. Add `http://localhost:5173` to Authorized JavaScript Origins
5. Copy the Client ID into `client/.env` as `VITE_GOOGLE_CLIENT_ID=...`

---

## Repo Conventions

### Commits
Use Conventional Commits:
- `feat(ui): add dark mode toggle`
- `fix(api): handle null user_id on login`
- `docs(readme): clarify quickstart`

### Pull Requests
- Small, focused PRs preferred
- Link issues with `Fixes #123`
- Include testing steps and screenshots for UI changes

### Secrets
- Never commit `.env` files or credentials
- Keep `.env.example` updated when adding new env vars

---

## Status & Links
- **Phase:** In Development
- **Communication:** Discord #smart-advisors
- **Open issues:** Use repo Issues tab

## Maintainers
- Kanishkar Manoj ([@kanishkarmanoj](https://github.com/kanishkarmanoj))
- Directors / Contacts: Tobi and Prajit Viswanadha — DM on Discord
