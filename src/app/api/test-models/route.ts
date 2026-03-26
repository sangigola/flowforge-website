import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key found in environment' }, { status: 500 });
  }

  // Show masked key for debugging
  const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);

  // Test with direct API call to get full error
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello' }] }]
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        maskedKey,
        status: 'working',
        model: 'gemini-1.5-flash',
        response: data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 100)
      });
    } else {
      return NextResponse.json({
        maskedKey,
        status: 'failed',
        httpStatus: response.status,
        error: data.error
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      maskedKey,
      status: 'fetch_error',
      error: err.message
    });
  }
}
