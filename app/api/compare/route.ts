import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { player1, player2, stats1, stats2 } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI analysis is not configured. Please add an OpenAI API key to enable this feature.' },
        { status: 503 }
      );
    }

    const prompt = `You are an elite football scout and data analyst. Compare these two players based on their stats and provide a concise, insightful tactical analysis.

Player 1: ${player1}
Stats: Goals: ${stats1.goals}, Assists: ${stats1.assists}, Pace: ${stats1.pace}, Shooting: ${stats1.shooting}, Passing: ${stats1.passing}, Dribbling: ${stats1.dribbling}, Defending: ${stats1.defending}, Physical: ${stats1.physical}, xG: ${stats1.xG}, Pass Accuracy: ${stats1.passAccuracy}%, Sprint Speed: ${stats1.sprintSpeed}km/h

Player 2: ${player2}
Stats: Goals: ${stats2.goals}, Assists: ${stats2.assists}, Pace: ${stats2.pace}, Shooting: ${stats2.shooting}, Passing: ${stats2.passing}, Dribbling: ${stats2.dribbling}, Defending: ${stats2.defending}, Physical: ${stats2.physical}, xG: ${stats2.xG}, Pass Accuracy: ${stats2.passAccuracy}%, Sprint Speed: ${stats2.sprintSpeed}km/h

Provide a 3-4 paragraph analysis covering:
1. Key strengths of each player
2. Where each player excels tactically
3. Which player is better suited for specific systems
4. Overall verdict

Keep it concise, data-driven, and insightful. No bullet points — write in flowing paragraphs.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        max_completion_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const upstream = await response.text();
      return NextResponse.json(
        {
          error: 'Unable to generate analysis right now. Please try again in a moment.',
          details: upstream.slice(0, 1000),
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;
    if (!analysis) {
      return NextResponse.json(
        { error: 'Received an empty response from the AI. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json(
      { error: 'Analysis service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
