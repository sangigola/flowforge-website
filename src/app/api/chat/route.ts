import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// System prompt for customer support
const SYSTEM_PROMPT = `You are a helpful customer support assistant for Flowforge.systems, an AI-powered solutions company.

About Flowforge.systems:
- We provide AI-powered automation solutions for businesses
- We build custom software, chatbots, and workflow automation
- We offer consulting services for AI integration
- Contact email: contact@flowforge.systems

Your role:
- Answer questions about our services professionally and helpfully
- Be concise but informative (2-4 sentences typically)
- If asked about pricing or specific project details, encourage them to sign in or contact us
- Be friendly and professional
- If you don't know something specific about Flowforge, acknowledge it and offer to connect them with our team

Keep responses short and helpful. Do not use markdown formatting.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Get latest message with system prompt for first message
    const latestMessage = messages[messages.length - 1].content;
    const prompt = messages.length === 1
      ? `${SYSTEM_PROMPT}\n\nUser message: ${latestMessage}\n\nRespond helpfully:`
      : latestMessage;

    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    return NextResponse.json({
      message: response,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
