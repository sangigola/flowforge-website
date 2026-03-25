import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Format messages for Claude
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    });

    // Extract text from response
    const textContent = response.content.find(block => block.type === 'text');
    const message = textContent?.type === 'text' ? textContent.text : 'Sorry, I could not generate a response.';

    return NextResponse.json({
      message,
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
