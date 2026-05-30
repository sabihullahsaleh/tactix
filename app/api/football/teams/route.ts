import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://v3.football.api-sports.io';

function headers() {
  return { 'x-apisports-key': process.env.API_FOOTBALL_KEY ?? '' };
}

// GET /api/football/teams?q=Liverpool
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ teams: [] });

  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json({ error: 'NO_KEY' }, { status: 503 });

  try {
    const res = await fetch(`${BASE}/teams?name=${encodeURIComponent(q)}`, {
      headers: headers(),
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'API-Football request failed.' }, { status: 502 });
    }

    const data = await res.json();

    type ApiTeam = {
      team: { id: number; name: string; logo: string; country: string };
      venue?: { country?: string };
    };

    const teams = (data.response as ApiTeam[])?.map(r => ({
      id: r.team.id,
      name: r.team.name,
      logo: r.team.logo,
      country: r.team.country ?? r.venue?.country ?? '',
    })) ?? [];

    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ error: 'Team search failed.' }, { status: 503 });
  }
}
