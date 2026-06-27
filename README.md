# Tactix

A football tactical analysis platform built for coaches, analysts, and fans. Create lineups from scratch, arrange players on a live pitch, manage your squad zones, and compare player stats side by side.

---

## Features

### Build Lineup from Scratch
A guided 4-step wizard at `/dashboard/lineups/build`:
- **Step 1 — Setup**: Name your lineup, pick a formation (7 options), and configure squad capacity (Starting XI, Bench/Subs, Reserves)
- **Step 2 — Roster**: Add players with name, jersey number, position, and photo upload
- **Step 3 — Arrange**: Click-to-assign players onto pitch slots, move between zones (XI ↔ Bench ↔ Reserves), and freely drag to reposition on the pitch
- **Step 4 — Compare**: Paste player stats in plain text and get an instant visual comparison

### Lineup Editor
Full tactical editor at `/dashboard/lineups/[id]`:
- Drag-and-drop player tokens freely across the pitch
- Switch between Pitch, Squad Manager, Players, and Tactics views
- Draw tactical movement arrows in multiple colors
- Substitution flow — click bench player → click pitch slot to swap
- Formation switcher with 7 formations

### Player Comparison
At `/dashboard/compare`:
- Compare up to 2 players side by side with a radar chart and stat bars
- Search from the squad or create a custom player manually
- Upload photos, edit stats with sliders, add strengths/weaknesses tags
- AI-powered scouting report (requires OpenAI key)

### Text-Based Multi-Player Comparison
Inside the Build wizard (Step 4) and as a standalone component:
- Paste stats in any natural language format:
  - `42 goals 31 assists 2 red cards`
  - `goals: 42, assists: 31, red cards: 2`
- Auto-parsed on type — no manual entry
- Radar chart for up to 6 players
- Shared stats and unique stats shown separately with animated bars

### Squad Management
- Zustand-powered global state for XI, bench, and reserves
- Player photo upload (local preview or Supabase storage)
- Position-color coded tokens and badges

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom glassmorphism utilities |
| Animation | Framer Motion |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | Zustand |
| Charts | Recharts + D3.js |
| Database | Supabase (optional) |
| AI | OpenAI API (squad generation, player lookup, scout analysis) |
| Icons | Lucide React |
| Export | html2canvas |

---

## Getting Started

### Prerequisites
- Node.js `22.11.0` (use `.nvmrc` — run `nvm use`)
- npm `10+`

### Install

```bash
git clone https://github.com/sabihullahsaleh/tactix.git
cd tactix
npm install
```

### Environment Variables

```bash
cp .env.sample .env.local
```

Open `.env.local` and fill in your values:

```env
# OpenAI — for AI squad generation, player lookup, scout analysis
OPENAI_API_KEY=sk-...

# API-Football (api-sports.io) — for real squad data
API_FOOTBALL_KEY=...

# Supabase — optional, for persistent player photo storage
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> All keys are optional. The app runs fully without them — AI features show a graceful error, and photos use local blob URLs instead of Supabase.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
tactix/
├── app/
│   ├── api/                    # API routes (lineup gen, player lookup, photo upload)
│   ├── dashboard/
│   │   ├── lineups/
│   │   │   ├── build/          # Build from scratch wizard
│   │   │   ├── new/            # Quick new lineup form
│   │   │   └── [id]/           # Lineup editor
│   │   ├── compare/            # Player comparison page
│   │   ├── players/            # Player grid + detail
│   │   ├── teams/              # Teams view
│   │   └── matches/            # Match logs
│   └── globals.css             # Global styles, glassmorphism utilities, neon colors
├── components/
│   ├── pitch/                  # Pitch, PlayerToken, TacticalArrows, BenchRail
│   ├── lineup/                 # BuildPitch, LineupImportModal
│   ├── comparison/             # PlayerDetailPanel, RadarChart, TextStatsCompare
│   ├── squad/                  # SquadManager, PlayerQuickView
│   ├── cards/                  # PlayerCard (full / compact / bench variants)
│   └── ui/                     # GlassCard, StatBadge
├── lib/
│   ├── data/mockData.ts        # Types, formations, mock players/teams/lineups
│   ├── store/lineupStore.ts    # Zustand store
│   └── supabase/client.ts      # Supabase client
```

---

## Formations Supported

`4-3-3` · `4-2-3-1` · `4-4-2` · `3-5-2` · `3-4-3` · `5-3-2` · `4-1-4-1`

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/lineup` | GET | Generate a squad from a team name using AI |
| `/api/player-lookup` | POST | Fetch player info and stats from AI |
| `/api/compare` | POST | AI scouting report comparing two players |
| `/api/upload-photo` | POST | Upload player photo to Supabase Storage |
| `/api/football/teams` | GET | Fetch teams from Football-Data API |
| `/api/football/squad` | GET | Fetch real squad data |

---

## Design System

- **Dark background**: `#07070d`
- **Neon accents**: Cyan `#00f5ff` · Green `#39ff14` · Pink `#ff006e` · Purple `#bf5fff`
- **Glassmorphism**: `.glass`, `.glass-card`, `.glass-strong` utility classes
- **Glow effects**: `.glow-cyan`, `.border-glow-*` utilities
- **Pitch color**: `#1a472a` → `#1e5230`

---

## License

MIT
