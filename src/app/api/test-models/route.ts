import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key found in environment' }, { status: 500 });
  }

  // List available models
  try {
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listResponse.json();

    if (!listResponse.ok) {
      return NextResponse.json({ error: 'Failed to list models', details: listData });
    }

    // Get model names that support generateContent
    const availableModels = listData.models
      ?.filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes('generateContent')
      )
      .map((m: { name: string }) => m.name)
      .slice(0, 10); // First 10

    return NextResponse.json({
      availableModels,
      totalModels: listData.models?.length || 0
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message });
  }
}
