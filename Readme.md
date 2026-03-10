# SmartAdvisors

A UTA course recommendation and degree planning app. Upload your transcript, choose your major, set preferences, and get personalized professor and course recommendations — or sign in with Google to generate a full semester-by-semester degree plan.

## Supported Majors
- Computer Science and Engineering (CSE)
- Civil Engineering (CE)
- Electrical Engineering (EE)
- Mechanical/Aerospace Engineering (MAE)
- Industrial Engineering (IE)

---

## Project Structure

```
SmartAdvisors/
├── client/                          # React/TypeScript frontend (Vite)
│   ├── src/
│   │   ├── main.tsx                 # Entry point — wraps app in GoogleOAuthProvider
│   │   ├── App.tsx                  # Main app orchestrator (step flow + auth state)
│   │   └── components/
│   │       ├── WelcomePage.tsx       # Landing page (guest vs. sign in)
│   │       ├── LoginPage.tsx         # Google Sign-In + guest option
│   │       ├── DisclaimerModal.tsx   # Disclaimer shown on first load
│   │       ├── UploadScreen.tsx      # Transcript upload + major selection
│   │       ├── TranscriptReview.tsx  # Review parsed courses before continuing
│   │       ├── PreferenceForm.tsx    # Student preference toggles (guest flow)
│   │       ├── RecommendationDashboard.tsx  # Professor + course recommendations (guest)
│   │       ├── DegreePlanSetup.tsx   # Course picker + credit hours (signed-in flow)
│   │       └── SemesterPlanView.tsx  # Full semester-by-semester plan (signed-in flow)
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
│   │       ├── recommendation_engine.py     # Core algorithm
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

1. Go into the `client` folder
2. Create a new file called `.env` (exactly that name, with the dot)
3. Paste this exact line into it (ask the team lead on Discord for the Client ID):

```
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Mac/Linux shortcut** (replace the ID with the real one):
```bash
echo "VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com" > client/.env
```

**Windows shortcut** (in Command Prompt):
```cmd
echo VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com > client\.env
```

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

## App Flow

```
WelcomePage
├── Continue as Guest → UploadScreen → TranscriptReview → PreferenceForm → RecommendationDashboard
└── Sign In (Google) → LoginPage → UploadScreen → TranscriptReview → DegreePlanSetup → SemesterPlanView
```

### Guest Mode
1. Upload transcript PDF
2. Select major
3. Review parsed courses
4. Set preferences (extra credit, clear grading, etc.)
5. Get recommended courses + ranked professors

### Signed-In Mode (Google)
1. Sign in with Google
2. Upload transcript PDF
3. Select major
4. Review parsed courses
5. Pick courses for next semester and set credit hour target
6. Get a full semester-by-semester degree plan to graduation

---

## How It Works

### Algorithm Overview
- Parses transcript PDF to extract completed courses
- Expands completed set with transitive prerequisites
- Filters degree plan to find courses with all prerequisites satisfied
- Looks up professors from grade distribution and RateMyProfessors data
- Scores professors based on student preferences (extra credit, difficulty, tags, etc.)

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
| `classes.db` | Degree plan tables for each major |
| `grades.sqlite` | UTA grade distribution data (course offerings, GPAs, instructor names) |
| `professors.db` | RateMyProfessors data (ratings, difficulty, tags) |

### Updating Degree Plans

```bash
cd server
source venv/bin/activate
python3 -c "from app.scripts.load_degree_plan import load_all; load_all()"
```

CSV format:
```
Formal Name,Course Name,Prerequisites,Corequisites,Requirement
CSE 1310,Introduction to Computers and Programming,[None],[None],required
CSE 4303,Computer Graphics,"CSE 3380, CSE 3318, MATH 3330",[None],elective
```

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
  "selected_next_semester": ["CSE 2312", "CSE 2315"]
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
  "stats": {
    "totalCourses": 45,
    "completedCourses": 12,
    "totalHours": 130,
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
