import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for Flowforge.systems, a company that provides AI solutions and software development services.

You help visitors understand:
- Our AI/ML development services (custom models, NLP, computer vision, predictive analytics)
- Software development services (full-stack, API integrations, automation)
- How we can help their business with AI solutions
- Pricing inquiries (direct them to contact us for custom quotes)
- Technical questions about AI and software development

Be friendly, professional, and concise. If asked about specific pricing, encourage them to sign up or contact us for a personalized quote. Keep responses helpful but brief (2-4 sentences typically).`;

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured. Please add ANTHROPIC_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: messages.map((msg: { role: string; content: string }) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        });

        const assistantMessage = response.content[0].type === 'text'
            ? response.content[0].text
            : '';

        return NextResponse.json({ message: assistantMessage });

    } catch (error: unknown) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Our AI assistant is temporarily unavailable. Please try again later or contact us at contact@flowforge.systems' },
            { status: 500 }
        );
    }
}
