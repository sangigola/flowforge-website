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
  title?: string;
  createdAt: string;
  lastActive: string;
}

// GET - List all sessions for a user (by fingerprint prefix)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
    }

    // Get all session IDs for this visitor
    const sessionIds = await kv.lrange(`visitor:${visitorId}:sessions`, 0, -1);

    if (!sessionIds || sessionIds.length === 0) {
      return NextResponse.json({ sessions: [] });
    }

    // Fetch session summaries
    const sessions: { id: string; title: string; lastActive: string; messageCount: number }[] = [];

    for (const sessionId of sessionIds) {
      const session = await kv.get<ChatSession>(`chat:${sessionId}`);
      if (session && session.messages.length > 0) {
        // Generate title from first user message
        const firstUserMessage = session.messages.find(m => m.role === 'user');
        const title = firstUserMessage
          ? firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '')
          : 'New Chat';

        sessions.push({
          id: session.id,
          title,
          lastActive: session.lastActive,
          messageCount: session.messages.length
        });
      }
    }

    // Sort by lastActive (newest first)
    sessions.sort((a, b) =>
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    return NextResponse.json({ sessions });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Sessions API error:', err?.message);
    return NextResponse.json({ error: 'Failed to retrieve sessions' }, { status: 500 });
  }
}

// POST - Create a new session
export async function POST(request: NextRequest) {
  try {
    const { visitorId } = await request.json();

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 });
    }

    // Generate new session ID
    const sessionId = `${visitorId}_${Date.now()}`;

    // Create empty session
    const session: ChatSession = {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    // Save session
    await kv.set(`chat:${sessionId}`, session, { ex: 60 * 60 * 24 * 30 }); // 30 days

    // Add to visitor's session list
    await kv.lpush(`visitor:${visitorId}:sessions`, sessionId);

    return NextResponse.json({ sessionId, session });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Create session error:', err?.message);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
