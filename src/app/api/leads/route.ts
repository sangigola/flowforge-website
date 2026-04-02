import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

interface Lead {
  id: string;
  sessionId?: string;
  email?: string;
  phone?: string;
  name?: string;
  messages: { role: string; content: string; timestamp?: string }[];
  summary?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted';
}

// Admin auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-admin-key');
  return authHeader === process.env.ADMIN_KEY || authHeader === 'tyuiop';
}

// GET - Retrieve all leads (admin only)
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all lead IDs
    const leadIds = await kv.lrange('leads:list', 0, -1);

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    // Fetch all leads
    const leads: Lead[] = [];
    for (const id of leadIds) {
      const lead = await kv.get<Lead>(`lead:${id}`);
      if (lead) {
        leads.push(lead);
      }
    }

    // Sort by createdAt (newest first)
    leads.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ leads });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Leads GET error:', err?.message);
    return NextResponse.json({ error: 'Failed to retrieve leads' }, { status: 500 });
  }
}

// POST - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, phone, name, messages, summary } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone is required' },
        { status: 400 }
      );
    }

    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sessionId,
      email,
      phone,
      name,
      messages: messages || [],
      summary: summary || 'General inquiry',
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    // Store lead
    await kv.set(`lead:${lead.id}`, lead, { ex: 60 * 60 * 24 * 90 }); // 90 days

    // Add to leads list
    await kv.lpush('leads:list', lead.id);

    return NextResponse.json({ success: true, lead });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Leads POST error:', err?.message);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

// PATCH - Update lead status (admin only)
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leadId, status } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const lead = await kv.get<Lead>(`lead:${leadId}`);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update status
    lead.status = status;

    // Save updated lead
    await kv.set(`lead:${leadId}`, lead, { ex: 60 * 60 * 24 * 90 });

    return NextResponse.json({ success: true, lead });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Leads PATCH error:', err?.message);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE - Delete a lead (admin only)
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // Delete lead
    await kv.del(`lead:${leadId}`);

    // Remove from list
    await kv.lrem('leads:list', 0, leadId);

    return NextResponse.json({ success: true, message: 'Lead deleted' });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Leads DELETE error:', err?.message);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
