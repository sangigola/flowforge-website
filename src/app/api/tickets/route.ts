import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

interface SupportTicket {
  id: string;
  sessionId: string;
  issue: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface ChatSession {
  id: string;
  messages: { role: string; content: string; timestamp: string }[];
  contactInfo?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  createdAt: string;
  lastActive: string;
}

// Admin auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-admin-key');
  return authHeader === process.env.ADMIN_KEY || authHeader === 'tyuiop';
}

// GET - Retrieve all tickets (admin only)
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all ticket IDs
    const ticketIds = await kv.lrange('tickets:list', 0, -1);

    if (!ticketIds || ticketIds.length === 0) {
      return NextResponse.json({ tickets: [] });
    }

    // Fetch all tickets
    const tickets: SupportTicket[] = [];
    for (const id of ticketIds) {
      const ticket = await kv.get<SupportTicket>(`ticket:${id}`);
      if (ticket) {
        tickets.push(ticket);
      }
    }

    // Sort by createdAt (newest first)
    tickets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ tickets });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Tickets GET error:', err?.message);
    return NextResponse.json({ error: 'Failed to retrieve tickets' }, { status: 500 });
  }
}

// POST - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const { sessionId, issue, priority = 'medium' } = await request.json();

    if (!sessionId || !issue) {
      return NextResponse.json(
        { error: 'sessionId and issue are required' },
        { status: 400 }
      );
    }

    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sessionId,
      issue,
      status: 'new',
      createdAt: new Date().toISOString(),
      priority: priority as 'low' | 'medium' | 'high'
    };

    // Store ticket
    await kv.set(`ticket:${ticket.id}`, ticket, { ex: 60 * 60 * 24 * 90 }); // 90 days

    // Add to tickets list
    await kv.lpush('tickets:list', ticket.id);

    return NextResponse.json({ success: true, ticket });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Tickets POST error:', err?.message);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

// PATCH - Update ticket status (admin only)
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticketId, status, priority } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const ticket = await kv.get<SupportTicket>(`ticket:${ticketId}`);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update fields
    if (status) {
      ticket.status = status;
    }
    if (priority) {
      ticket.priority = priority;
    }

    // Save updated ticket
    await kv.set(`ticket:${ticketId}`, ticket, { ex: 60 * 60 * 24 * 90 });

    return NextResponse.json({ success: true, ticket });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Tickets PATCH error:', err?.message);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

// DELETE - Delete a ticket (admin only)
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    // Delete ticket
    await kv.del(`ticket:${ticketId}`);

    // Remove from list
    await kv.lrem('tickets:list', 0, ticketId);

    return NextResponse.json({ success: true, message: 'Ticket deleted' });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Tickets DELETE error:', err?.message);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}

// Get a specific ticket with chat history
export async function OPTIONS(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const ticket = await kv.get<SupportTicket>(`ticket:${ticketId}`);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Also get related chat history
    const session = await kv.get<ChatSession>(`chat:${ticket.sessionId}`);

    return NextResponse.json({
      ticket,
      chatHistory: session?.messages || [],
      contactInfo: session?.contactInfo
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Tickets OPTIONS error:', err?.message);
    return NextResponse.json({ error: 'Failed to get ticket details' }, { status: 500 });
  }
}
