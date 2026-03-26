import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Try different model names
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'models/gemini-1.5-flash',
    'models/gemini-pro',
  ];

  const results: { model: string; status: string; error?: string }[] = [];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hi');
      const text = result.response.text();
      results.push({ model: modelName, status: 'working', error: text.substring(0, 50) });
    } catch (error: unknown) {
      const err = error as Error;
      results.push({ model: modelName, status: 'failed', error: err.message?.substring(0, 100) });
    }
  }

  return NextResponse.json({ results });
}
