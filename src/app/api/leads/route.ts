import { NextRequest, NextResponse } from 'next/server';

interface ChatLead {
  id: string;
  email?: string;
  phone?: string;
  messages: { role: string; content: string }[];
  summary?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted';
}

// Access global chat leads
declare global {
  // eslint-disable-next-line no-var
  var chatLeads: ChatLead[];
}

if (!global.chatLeads) {
  global.chatLeads = [];
}

// GET - Retrieve all chat leads
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-key');

  if (authHeader !== 'tyuiop') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ leads: global.chatLeads });
}

// PATCH - Update lead status
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-key');

  if (authHeader !== 'tyuiop') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leadId, status } = await request.json();

    const leadIndex = global.chatLeads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    global.chatLeads[leadIndex].status = status;

    return NextResponse.json({ success: true, lead: global.chatLeads[leadIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
