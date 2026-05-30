import { NextRequest, NextResponse } from 'next/server';
import { Position } from '@/lib/data/mockData';

export const dynamic = 'force-dynamic';

export type ImportedPlayer = {
  externalId: number;
  name: string;
  shortName: string;
  position: Position;
  jerseyNumber: number;
  nationality: string;
};

type AIPlayer = {
  id: number;
  name: string;
  position: string;
  jerseyNumber: number;
  nationality: string;
};

const VALID_POSITIONS: Position[] = [
  'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF',
];

function isValidPosition(p: string): p is Position {
  return VALID_POSITIONS.includes(p as Position);
}

function parsePlayersFromModelOutput(text: string): AIPlayer[] {
  const cleaned = text.replace(/```json|```/g, '').trim();
  if (!cleaned) {
    throw new Error('Empty model output');
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected top-level JSON array');
    }
    return parsed as AIPlayer[];
  } catch {
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      const arraySlice = cleaned.slice(start, end + 1);
      const parsed = JSON.parse(arraySlice);
      if (!Array.isArray(parsed)) {
        throw new Error('Expected top-level JSON array');
      }
      return parsed as AIPlayer[];
    }
    throw new Error('Model did not return valid JSON array');
  }
}

export async function GET(req: NextRequest) {
  const teamName = req.nextUrl.searchParams.get('teamName');
  if (!teamName) {
    return NextResponse.json({ error: 'teamName required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 });
  }

  const prompt = `You are a football data expert. Return the most up-to-date 2024-25 season first-team squad for ${teamName}. Use your most recent training knowledge — include any notable signings or transfers up to your knowledge cutoff. Include 25-30 players.

Each player object must have exactly these fields:
- id: unique integer starting from 1
- name: full name string (most commonly used full name)
- position: one of exactly: GK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF
- jerseyNumber: current squad number (0 if unknown)
- nationality: country name string

Important: Use the LATEST known squad — include recent transfers and exclude departed players based on the most recent information you have.

Respond with ONLY a raw JSON array — no markdown, no explanation, no code fences. Example:
[{"id":1,"name":"Alisson Becker","position":"GK","jerseyNumber":1,"nationality":"Brazil"}]`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        max_completion_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const upstream = await res.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${res.status}`, details: upstream.slice(0, 1000) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const text: string = choice?.message?.content ?? '';
    const finishReason: string | undefined = choice?.finish_reason;

    let raw: AIPlayer[];
    try {
      raw = parsePlayersFromModelOutput(text);
    } catch {
      return NextResponse.json(
        {
          error: 'Model returned incomplete or invalid JSON. Please retry.',
          finishReason,
          preview: text.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const squad: ImportedPlayer[] = raw
      .filter((p) => isValidPosition(p.position))
      .map((p) => ({
        externalId: p.id,
        name: p.name,
        shortName: p.name.split(' ').slice(-1)[0],
        position: p.position as Position,
        jerseyNumber: p.jerseyNumber ?? 0,
        nationality: p.nationality ?? '',
      }));

    return NextResponse.json({ teamName, squad });
  } catch (err) {
    console.error('[lineup route]', err);
    return NextResponse.json({ error: 'Failed to generate lineup' }, { status: 500 });
  }
}
