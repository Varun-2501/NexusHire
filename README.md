# NexusHire — AI-Powered Job Tracker

> An intelligent job tracking platform with LangChain-powered resume matching and a LangGraph-orchestrated AI assistant that controls UI filters in real time.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                                                                   │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ LoginPage│  │  JobFeed   │  │  Dashboard   │  │AIChatBubble│ │
│  └──────────┘  │ ┌────────┐ │  │(Applications)│  │(LangGraph) │ │
│                │ │JobCard │ │  └──────────────┘  └─────┬─────┘ │
│                │ └────────┘ │                           │        │
│                │ ┌────────┐ │   ┌──────────────────┐   │        │
│                │ │Filter  │ │   │  AuthContext      │   │        │
│                │ │Panel   │←────│  JobContext       │   │        │
│                │ └────────┘ │   │  (AI filter sync) │   │        │
│                └────────────┘   └──────────────────┘   │        │
└─────────────────────────────────────┬───────────────────┼────────┘
                                      │ REST API           │
                                      ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Fastify)                 │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ ┌─────────┐ │
│  │ /auth    │ │ /jobs    │ │ /resume  │ │ /apps │ │/assistant│ │
│  └──────────┘ └────┬─────┘ └────┬─────┘ └───────┘ └────┬────┘ │
│                    │             │                        │       │
│            ┌───────▼─────┐  ┌───▼──────┐        ┌───────▼────┐ │
│            │  jobService  │  │pdf-parse │        │LangGraph   │ │
│            │ (Remotive +  │  │(resume   │        │Assistant   │ │
│            │  mock data)  │  │ parsing) │        │Service     │ │
│            └───────┬──────┘  └──────────┘        └───────┬────┘ │
│                    │                                       │       │
│            ┌───────▼──────────────────────────────────────▼────┐ │
│            │              matchingService.js                     │ │
│            │         LangChain (ChatGroq + Prompt)              │ │
│            └────────────────────────────────────────────────────┘ │
│                                                                   │
│            ┌───────────────────────────────────────────────────┐ │
│            │               In-Memory Store                      │ │
│            │    users · resume text · applications · cache      │ │
│            └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                      │
                              ┌───────▼───────┐
                              │  External APIs │
                              │  Remotive Jobs │
                              │  Groq LLM API  │
                              └───────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Fastify |
| AI Matching | **LangChain** (ChatGroq + ChatPromptTemplate + RunnableSequence) |
| AI Assistant | **LangGraph** (StateGraph with intent routing nodes) |
| LLM Provider | Groq (llama-3.3-70b-versatile) |
| Job Data | Remotive API + rich mock fallback |
| Storage | In-memory (JSON) |
| Resume Parsing | pdf-parse |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/nexushire.git
cd nexushire
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:3001 (default)
npm run dev
```

### 4. Open the app
```
http://localhost:5173
```

**Test credentials:**
- Email: `test@gmail.com`
- Password: `test@123`

---

## Environment Variables

### Backend (`backend/.env`)
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001
```

---

## LangChain Usage — Job Matching

### How it works

LangChain is used in `matchingService.js` to score each job against the user's uploaded resume.

**Chain structure:**
```
ChatPromptTemplate → ChatGroq (llama-3.3-70b) → StringOutputParser
```

**Prompt design:**
The system prompt instructs the model to act as an expert recruiter and return structured JSON with:
- `score` (0–100)
- `matchingSkills` (array of matched skills)
- `relevantExperience` (1-2 sentence summary)
- `keywordsAlignment` (keyword overlap summary)
- `summary` (overall fit summary)

**Scoring approach:**
1. Resume text (truncated to 3000 chars for efficiency) is compared against job title, description, and required skills
2. The LLM evaluates semantic skill overlap, experience relevance, and keyword alignment
3. Results are cached in memory using a key of `resume-prefix + jobId` to avoid redundant API calls
4. Jobs are batch-processed in groups of 5 with 200ms delay between batches to respect rate limits

**Why it works:**
- LLMs understand semantic similarity (e.g. "machine learning" matches "ML engineer")
- The structured output ensures consistent scoring across all jobs
- Fallback keyword matching activates if the AI call fails, ensuring the app never breaks

```javascript
// LangChain chain (matchingService.js)
const matchChain = RunnableSequence.from([
  matchPrompt,   // ChatPromptTemplate
  model,         // ChatGroq
  outputParser,  // StringOutputParser → JSON
]);
```

---

## LangGraph Usage — AI Assistant

### Graph structure

The AI assistant uses a **LangGraph StateGraph** with 4 nodes and conditional routing:

```
START → detectIntent → [conditional edge] → buildFilterUpdates → END
                                          → buildSearchQuery   → END
                                          → provideHelp        → END
```

**Nodes:**
| Node | Purpose |
|------|---------|
| `detectIntent` | Classifies user message into: `filter`, `search`, or `help` |
| `buildFilterUpdates` | Extracts filter change commands and maps them to UI state |
| `buildSearchQuery` | Extracts job search parameters (title, skills, workMode, etc.) |
| `provideHelp` | Answers product questions about the app |

**State schema (Annotation.Root):**
```javascript
{
  messages: [],          // Full conversation history
  userMessage: '',       // Current user input
  intent: 'help',        // Detected intent
  filterUpdates: null,   // UI filter update commands
  searchQuery: null,     // Search parameters
  response: '',          // Final AI response text
}
```

**Tool/function calling for UI filter updates:**
When the `buildFilterUpdates` node runs, it returns a `filterUpdates` object like:
```json
{ "workMode": "remote", "datePosted": "24h" }
```
The frontend's `JobContext.applyAIFilters()` receives this and directly updates React state + re-fetches jobs. This is how the AI "controls" the UI without any manual user interaction.

**Conversation state:**
The last 6 messages are sent with each request so the assistant maintains context across turns.

**Example flows:**
- "Show only remote jobs" → `filter` intent → `{ workMode: "remote" }` → JobContext updates
- "Find React engineers in NYC" → `search` intent → `{ title: "React", location: "NYC" }` → filter update
- "How does matching work?" → `help` intent → natural language explanation

---

## AI Matching Logic

### Scoring (0–100%)

1. **Resume parsing**: User uploads PDF/TXT → backend extracts raw text via `pdf-parse`
2. **Prompt injection**: Resume text + job description sent to Groq LLM via LangChain
3. **Semantic scoring**: LLM evaluates skill match, experience relevance, keyword alignment
4. **Color coding**:
   - 🟢 **>70%** — Strong match (green badge)
   - 🟡 **40–70%** — Partial match (amber badge)
   - ⚪ **<40%** — Weak match (gray badge)
5. **Caching**: Scores cached per `(resume, jobId)` pair to avoid repeated API calls
6. **Sorting**: Jobs sorted by match score descending; Best Matches (top 8) shown in dedicated section

### Performance considerations
- Batch size of 5 jobs per LangChain call with 200ms throttle
- 3000-char resume truncation keeps tokens low
- Match cache persists in-memory for the session lifetime
- Fallback keyword matching if Groq API is unavailable

---

## Smart Apply Popup Flow

### Design rationale

When a user clicks **Apply**, they're sent to the external job listing in a new tab. After 1.5 seconds, the app shows a popup asking: _"Did you apply to [Job] at [Company]?"_

**Why this timing?**
- Immediate popup would interrupt the user before they've read the job posting
- 1.5s delay feels natural — enough time for the tab to open, but short enough to catch intent while it's fresh

**Three options presented:**
| Option | Action | UX Reasoning |
|--------|--------|-------------|
| Yes, I applied! | Saves with status=applied + timestamp | Most common path — one click to track |
| Applied Earlier | Also saves as applied | Users may have applied before discovering this app |
| No, just browsing | Dismisses without saving | Respects user intent — not every click is an application |

**Edge cases handled:**
- Duplicate applications return HTTP 409 — user sees "Already tracked!" toast
- Popup auto-dismisses if user ignores it (no forced interaction)
- Applications include full timeline for status progression: Applied → Interview → Offer/Rejected

---

## AI Assistant UI Choice

**Selected: Floating chat bubble (bottom-right, expandable)**

**Reasoning:**
- Doesn't steal screen real estate from the job feed (primary content)
- Universally understood UX pattern (WhatsApp, Intercom, etc.)
- Expandable/collapsible means power users can keep it open; casual users ignore it
- Bottom-right avoids conflict with left-side filter panel
- Framer Motion slide-in animation feels native and polished

---

## Scalability Considerations

### 100+ jobs
- Client-side filter application is O(n) — handles 500+ jobs without lag
- Match scoring batched in groups of 5 with caching — linear scale with cache hits
- Virtual scrolling could be added for 1000+ jobs (react-window)

### 10,000 users
| Concern | Current | Production Solution |
|---------|---------|---------------------|
| Storage | In-memory | PostgreSQL / Redis |
| Match cache | Per-process | Redis with TTL |
| LLM calls | Per request | Queue (BullMQ) + batch |
| Auth | Hardcoded | JWT + bcrypt |
| Job data | Remotive API | Job aggregator DB |

---

## Known Limitations & Improvements

| Limitation | Improvement |
|-----------|-------------|
| In-memory storage resets on restart | Add PostgreSQL or SQLite |
| Single hardcoded user | Full auth system with JWT |
| Match scoring on every page load | Background job queue + persistent cache |
| No pagination | Cursor-based pagination |
| PDF parsing quality varies | Better parser (pdfjs-dist) or OCR fallback |
| No mobile filter panel toggle | Add bottom sheet drawer for mobile |

---

## Folder Structure

```
nexushire/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js                 # Fastify entry point
│       ├── routes/
│       │   ├── auth.js               # POST /api/auth/login
│       │   ├── jobs.js               # GET /api/jobs
│       │   ├── resume.js             # GET/POST /api/resume
│       │   ├── applications.js       # CRUD /api/applications
│       │   └── assistant.js          # POST /api/assistant
│       ├── services/
│       │   ├── jobService.js         # Remotive API + mock data
│       │   ├── matchingService.js    # LangChain job scoring
│       │   └── assistantService.js   # LangGraph AI assistant
│       └── store/
│           └── index.js              # In-memory data store
└── frontend/
    ├── .env
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/index.js              # All API calls
        ├── context/
        │   ├── AuthContext.jsx       # User session
        │   └── JobContext.jsx        # Jobs + AI filter sync
        └── components/
            ├── Layout.jsx            # Navbar + shell
            ├── Auth/LoginPage.jsx
            ├── Resume/ResumeUpload.jsx
            ├── Jobs/
            │   ├── JobFeed.jsx
            │   ├── JobCard.jsx
            │   ├── FilterPanel.jsx
            │   └── ApplyPopup.jsx
            ├── Applications/
            │   ├── Dashboard.jsx
            │   └── ApplicationCard.jsx
            └── AI/AIChatBubble.jsx
```

---

## Submission

**Email:** info@tcconsultingservices.in
**Subject:** AI-Powered Job Tracker Assignment — Your Full Name

Include:
- ✅ Live Application URL
- ✅ Public GitHub Repository Link
- ✅ Brief note on stack choices and assumptions
