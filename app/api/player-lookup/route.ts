import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { playerName } = await req.json();
  if (!playerName?.trim()) {
    return NextResponse.json({ error: 'Player name is required.' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'NO_API_KEY' },
      { status: 503 }
    );
  }

  const prompt = `You are a professional football data analyst with access to current season stats.
Return ONLY valid JSON (absolutely no markdown, no code blocks, no explanation — raw JSON only) for the player: "${playerName}".

Use this exact schema:
{
  "name": "Full Name",
  "shortName": "Short Name",
  "position": "GK|CB|LB|RB|CDM|CM|CAM|LM|RM|LW|RW|ST|CF",
  "club": "Current Club",
  "nationality": "Country",
  "age": 25,
  "height": 182,
  "weight": 78,
  "foot": "Right",
  "jerseyNumber": 9,
  "marketValue": "€80M",
  "stats": {
    "pace": 85,
    "shooting": 82,
    "passing": 78,
    "dribbling": 83,
    "defending": 35,
    "physical": 76,
    "goals": 20,
    "assists": 8,
    "matchRating": 7.8,
    "passAccuracy": 82,
    "sprintSpeed": 34,
    "tackles": 25,
    "dribbles": 90,
    "xG": 18.5
  },
  "characteristics": {
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "playingStyle": "One sentence describing how they play.",
    "bestRole": "e.g. Advanced Striker / Box-to-Box Midfielder",
    "tacticalNotes": "Two sentences on what system/setup they excel in."
  }
}

All stat values must be realistic integers based on their known 2024-25 season performance. Pace/shooting/passing/dribbling/defending/physical are FIFA-style ratings (1-99). If you don't know the exact player, use your best estimate and return the JSON anyway.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        max_tokens: 800,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned malformed data. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ player: parsed });
  } catch {
    return NextResponse.json({ error: 'Player lookup service is unavailable.' }, { status: 503 });
  }
}
