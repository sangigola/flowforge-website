import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  messages: Message[];
  contactInfo?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  createdAt: string;
  lastActive: string;
}

// GET - Retrieve chat history for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Get session from KV
    const session = await kv.get<ChatSession>(`chat:${sessionId}`);

    if (!session) {
      return NextResponse.json({
        messages: [],
        sessionId,
        isNewSession: true
      });
    }

    return NextResponse.json({
      messages: session.messages,
      sessionId: session.id,
      contactInfo: session.contactInfo,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
      isNewSession: false
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('History API error:', err?.message);

    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}

// DELETE - Clear chat history for a session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Delete session from KV
    await kv.del(`chat:${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('History DELETE error:', err?.message);

    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    );
  }
}
