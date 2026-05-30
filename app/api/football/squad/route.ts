import { NextRequest, NextResponse } from 'next/server';
import type { Position } from '@/lib/data/mockData';

const BASE = 'https://v3.football.api-sports.io';

function apfHeaders() {
  return { 'x-apisports-key': process.env.API_FOOTBALL_KEY ?? '' };
}

// ── Position mapping ──────────────────────────────────────────────────────
// API-Football gives broad positions. We slot them into our Position type.
// When stats are available we use the player's typical number/role to refine.

const BROAD_TO_POSITION: Record<string, Position> = {
  Goalkeeper: 'GK',
  Defender: 'CB',
  Midfielder: 'CM',
  Attacker: 'ST',
};

function mapPosition(apfPos: string): Position {
  return BROAD_TO_POSITION[apfPos] ?? 'CM';
}

// ── Stat helpers ──────────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 99) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

// Build a rough FIFA-style attribute set from real season stats.
// We interpolate against known top-player benchmarks so values feel sensible.
function buildStats(stats: ApiPlayerStats | null, broadPos: string) {
  const base = { pace: 72, shooting: 68, passing: 72, dribbling: 70, defending: 55, physical: 72 };

  if (!broadPos) return defaults();

  // Positional base adjustments
  if (broadPos === 'Goalkeeper') {
    Object.assign(base, { pace: 55, shooting: 20, passing: 72, dribbling: 28, defending: 84, physical: 74 });
  } else if (broadPos === 'Defender') {
    Object.assign(base, { pace: 70, shooting: 48, passing: 68, dribbling: 58, defending: 82, physical: 80 });
  } else if (broadPos === 'Midfielder') {
    Object.assign(base, { pace: 72, shooting: 68, passing: 80, dribbling: 76, defending: 68, physical: 74 });
  } else if (broadPos === 'Attacker') {
    Object.assign(base, { pace: 82, shooting: 82, passing: 72, dribbling: 82, defending: 38, physical: 72 });
  }

  if (!stats) return defaults(base);

  const g = stats.games;
  const goals = stats.goals?.total ?? 0;
  const assists = stats.goals?.assists ?? 0;
  const passAcc = stats.passes?.accuracy ?? base.passing;
  const tackles = stats.tackles?.total ?? 0;
  const dribbles = stats.dribbles?.success ?? 0;
  const minutes = g?.minutes ?? 0;
  const rating = parseFloat(String(g?.rating ?? '0')) || 0;
  const xG = parseFloat(String(stats.goals?.total ?? 0)); // API doesn't give xG directly

  // Nudge attributes based on real performance
  if (goals > 20) base.shooting = clamp(base.shooting + 8);
  else if (goals > 10) base.shooting = clamp(base.shooting + 4);

  if (dribbles > 100) base.dribbling = clamp(base.dribbling + 6);
  else if (dribbles > 50) base.dribbling = clamp(base.dribbling + 3);

  if (tackles > 80) base.defending = clamp(base.defending + 6);
  else if (tackles > 40) base.defending = clamp(base.defending + 3);

  if (passAcc > 90) base.passing = clamp(base.passing + 6);
  else if (passAcc > 85) base.passing = clamp(base.passing + 3);

  if (rating > 8.0) { base.pace += 2; base.shooting += 2; base.passing += 2; }

  return {
    pace: clamp(base.pace),
    shooting: clamp(base.shooting),
    passing: clamp(base.passing),
    dribbling: clamp(base.dribbling),
    defending: clamp(base.defending),
    physical: clamp(base.physical),
    goals,
    assists,
    matchRating: rating > 0 ? Math.round(rating * 10) / 10 : 7.0,
    passAccuracy: clamp(passAcc, 50, 99),
    sprintSpeed: broadPos === 'Attacker' ? 33 : broadPos === 'Midfielder' ? 30 : 28,
    tackles,
    dribbles,
    xG: Math.round(xG * 10) / 10,
  };
}

function defaults(base = { pace: 72, shooting: 68, passing: 72, dribbling: 70, defending: 55, physical: 72 }) {
  return {
    ...base,
    goals: 0, assists: 0, matchRating: 7.0, passAccuracy: 78,
    sprintSpeed: 30, tackles: 30, dribbles: 40, xG: 0,
  };
}

// ── API-Football types ────────────────────────────────────────────────────

type ApiSquadPlayer = {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
};

type ApiPlayerStats = {
  games?: { appearences?: number; minutes?: number; rating?: string | number };
  goals?: { total?: number; assists?: number };
  passes?: { accuracy?: number };
  tackles?: { total?: number };
  dribbles?: { success?: number };
};

type ApiPlayerResponse = {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    height?: string;
    weight?: string;
    photo: string;
  };
  statistics: ApiPlayerStats[];
};

// ── Route ─────────────────────────────────────────────────────────────────

// GET /api/football/squad?teamId=40&teamName=Liverpool&season=2024
export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('teamId') ?? '';
  const teamName = req.nextUrl.searchParams.get('teamName') ?? 'Team';
  const season = req.nextUrl.searchParams.get('season') ?? '2024';

  if (!teamId) return NextResponse.json({ error: 'teamId is required.' }, { status: 400 });

  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ error: 'NO_KEY' }, { status: 503 });

  try {
    // ── Step 1: fetch squad (names, photos, numbers) ──────────────────────
    const squadRes = await fetch(`${BASE}/players/squads?team=${teamId}`, {
      headers: apfHeaders(),
      next: { revalidate: 3600 },
    });
    if (!squadRes.ok) {
      return NextResponse.json({ error: 'Could not fetch squad.' }, { status: 502 });
    }
    const squadData = await squadRes.json();
    const rawSquad: ApiSquadPlayer[] = squadData.response?.[0]?.players ?? [];

    if (!rawSquad.length) {
      return NextResponse.json({ error: 'No players found for this team.' }, { status: 404 });
    }

    // ── Step 2: fetch season stats (page 1 ≈ 20 players) ─────────────────
    let statsMap: Record<number, ApiPlayerResponse> = {};
    try {
      const statsRes = await fetch(
        `${BASE}/players?team=${teamId}&season=${season}&page=1`,
        { headers: apfHeaders(), next: { revalidate: 3600 } }
      );
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        (statsData.response as ApiPlayerResponse[])?.forEach(r => {
          statsMap[r.player.id] = r;
        });
        // If squad is large, fetch page 2 as well
        if (statsData.paging?.total > 1) {
          const page2 = await fetch(
            `${BASE}/players?team=${teamId}&season=${season}&page=2`,
            { headers: apfHeaders(), next: { revalidate: 3600 } }
          );
          if (page2.ok) {
            const p2Data = await page2.json();
            (p2Data.response as ApiPlayerResponse[])?.forEach(r => {
              statsMap[r.player.id] = r;
            });
          }
        }
      }
    } catch {
      // stats fetch failed — continue with squad basics only
    }

    // ── Step 3: merge into our Player shape ───────────────────────────────
    const players = rawSquad.map(sp => {
      const detailed = statsMap[sp.id];
      const firstStats = detailed?.statistics?.[0] ?? null;
      const nat = detailed?.player.nationality ?? '';
      const heightStr = detailed?.player.height ?? '';
      const weightStr = detailed?.player.weight ?? '';
      const height = parseInt(heightStr) || 0;
      const weight = parseInt(weightStr) || 0;

      return {
        id: `apf-${sp.id}`,
        name: sp.name,
        shortName: sp.name.split(' ').slice(-1)[0],
        position: mapPosition(sp.position),
        nationality: nat,
        flagEmoji: '🌐',
        club: teamName,
        clubBadge: '⚽',
        age: sp.age,
        height,
        weight,
        foot: 'Right' as const,
        jerseyNumber: sp.number ?? 0,
        rating: 78,
        marketValue: '',
        imageUrl: sp.photo,
        stats: buildStats(firstStats, sp.position),
        // carry through the broad position for slot distribution
        _broadPos: sp.position,
      };
    });

    return NextResponse.json({ players, teamName, season });
  } catch {
    return NextResponse.json({ error: 'Squad fetch failed.' }, { status: 503 });
  }
}
