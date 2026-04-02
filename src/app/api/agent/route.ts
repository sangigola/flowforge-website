import { kv } from '@vercel/kv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { buildKnowledgeContext } from '@/lib/knowledge-base';

// Types
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

interface Lead {
  id: string;
  sessionId: string;
  email?: string;
  phone?: string;
  name?: string;
  summary: string;
  messages: Message[];
  createdAt: string;
  status: 'new' | 'contacted' | 'converted';
}

interface SupportTicket {
  id: string;
  sessionId: string;
  issue: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

// Patterns to detect contact information
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

// System prompt for the AI agent
const SYSTEM_PROMPT = `ROLE: You are the official AI assistant for Flowforge.systems. You represent the company and help potential clients understand our services.

${buildKnowledgeContext()}

CONVERSATION RULES:
- Keep responses concise (2-4 sentences max)
- Be helpful and knowledgeable about our services
- Guide users toward sharing contact info for detailed discussions
- Never mention being AI, Google, or any technical details about yourself
- Sound like a friendly, professional team member

LANGUAGE SUPPORT:
- Respond in the same language the user writes in
- If user writes in Georgian (ქართული), respond in Georgian
- If user writes in English, respond in English
- Maintain the same professional, helpful tone in both languages

GEORGIAN TRANSLATIONS (for reference):
- "Share your contact" = "გაგვიზიარეთ თქვენი საკონტაქტო ინფორმაცია"
- "Our team will contact you" = "ჩვენი გუნდი დაგიკავშირდებათ"
- "Within 24 hours" = "24 საათის განმავლობაში"

LEAD CAPTURE (VERY IMPORTANT):
- EVERY response must end with a request for contact info
- Always ask for phone number or email at the end of your message
- When user provides email/phone, thank them warmly and confirm follow-up

SUPPORT TICKET DETECTION:
- If user mentions issues, problems, or needs help with something specific, offer to create a support ticket
- Phrases like "I need help with", "I'm having trouble", "there's a problem" should trigger ticket offer

FORBIDDEN:
- Never say "I'm an AI" or "As an AI"
- Never mention Google, Gemini, or any AI provider
- Never give exact prices without knowing project details
- Never use bullet points or markdown in responses`;

// Helper function to sleep for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;
      const errorMessage = lastError?.message || '';

      const isRetryable =
        errorMessage.includes('429') ||
        errorMessage.includes('503') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('rate') ||
        errorMessage.includes('quota');

      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`API rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }

  throw lastError;
}

// Extract contact info from messages
function extractContactInfo(messages: Message[]): { email?: string; phone?: string } {
  let email: string | undefined;
  let phone: string | undefined;

  for (const msg of messages) {
    if (msg.role === 'user') {
      const emailMatch = msg.content.match(EMAIL_PATTERN);
      const phoneMatch = msg.content.match(PHONE_PATTERN);

      if (emailMatch) email = emailMatch[0];
      if (phoneMatch) phone = phoneMatch[0];
    }
  }

  return { email, phone };
}

// Detect if user is requesting help/support
function detectTicketRequest(message: string): { needsTicket: boolean; issue: string } {
  const ticketKeywords = [
    'help with', 'having trouble', 'problem with', 'issue with',
    'not working', 'broken', 'error', 'bug', 'fix',
    'need support', 'technical issue', 'urgent'
  ];

  const messageLower = message.toLowerCase();
  const needsTicket = ticketKeywords.some(keyword => messageLower.includes(keyword));

  return {
    needsTicket,
    issue: needsTicket ? message : ''
  };
}

// Build conversation context for the AI
function buildConversationContext(messages: Message[]): string {
  // Include last 10 messages for context
  const recentMessages = messages.slice(-10);
  return recentMessages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
}

// Save or update lead in KV storage
async function saveLeadToKV(session: ChatSession, summary: string): Promise<void> {
  const lead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    sessionId: session.id,
    email: session.contactInfo?.email,
    phone: session.contactInfo?.phone,
    name: session.contactInfo?.name,
    summary,
    messages: session.messages,
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  // Store lead
  await kv.set(`lead:${lead.id}`, lead, { ex: 60 * 60 * 24 * 90 }); // 90 days

  // Add to leads list
  await kv.lpush('leads:list', lead.id);
}

// Create support ticket
async function createTicketInKV(sessionId: string, issue: string): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    sessionId,
    issue,
    status: 'new',
    createdAt: new Date().toISOString(),
    priority: issue.toLowerCase().includes('urgent') ? 'high' : 'medium'
  };

  // Store ticket
  await kv.set(`ticket:${ticket.id}`, ticket, { ex: 60 * 60 * 24 * 90 }); // 90 days

  // Add to tickets list
  await kv.lpush('tickets:list', ticket.id);

  return ticket;
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, visitorId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 1. Load or create chat session
    let session = await kv.get<ChatSession>(`chat:${sessionId}`);
    const isNewSession = !session;
    if (!session) {
      session = {
        id: sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
    }

    // Track session in visitor's list (for new sessions)
    if (isNewSession && visitorId) {
      await kv.lpush(`visitor:${visitorId}:sessions`, sessionId);
    }

    // 2. Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMessage);

    // 3. Extract contact info from all messages
    const contactInfo = extractContactInfo(session.messages);
    if (contactInfo.email || contactInfo.phone) {
      session.contactInfo = {
        ...session.contactInfo,
        ...contactInfo
      };
    }

    // 4. Detect if this might be a ticket request
    const ticketDetection = detectTicketRequest(message);

    // 5. Build context and call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const conversationContext = buildConversationContext(session.messages);
    const prompt = `${SYSTEM_PROMPT}

CONVERSATION HISTORY:
${conversationContext}

LATEST USER MESSAGE: "${message}"

Respond as Flowforge support (2-3 sentences max):`;

    const result = await withRetry(() =>
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.5,
        }
      })
    );

    const responseText = result.response.text();

    // 6. Add assistant message
    const assistantMessage: Message = {
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString()
    };
    session.messages.push(assistantMessage);
    session.lastActive = new Date().toISOString();

    // 7. Save session to KV
    await kv.set(`chat:${sessionId}`, session, { ex: 60 * 60 * 24 * 30 }); // 30 days

    // 8. Handle actions
    const actions: { leadCaptured?: boolean; ticketCreated?: SupportTicket } = {};

    // Save lead if contact info was captured
    if (contactInfo.email || contactInfo.phone) {
      try {
        // Generate summary of conversation
        let summary = 'General inquiry';
        try {
          const summaryResult = await withRetry(
            () => model.generateContent(
              `Analyze this customer chat and provide a brief 1-2 sentence summary of what they need. Just the summary, no labels:\n\n${session.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
            ),
            2,
            500
          );
          summary = summaryResult.response.text();
        } catch {
          // Use default summary
        }

        await saveLeadToKV(session, summary);
        actions.leadCaptured = true;
      } catch (error) {
        console.error('Error saving lead:', error);
      }
    }

    // Create ticket if requested
    if (ticketDetection.needsTicket) {
      try {
        const ticket = await createTicketInKV(sessionId, ticketDetection.issue);
        actions.ticketCreated = ticket;
      } catch (error) {
        console.error('Error creating ticket:', error);
      }
    }

    return NextResponse.json({
      message: responseText,
      role: 'assistant',
      actions,
      sessionId
    });

  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err?.message || 'Unknown error';
    console.error('Agent API error:', errorMessage);

    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'Our chat service is busy right now. Please try again in a moment.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('API_KEY') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        { error: 'Chat service configuration error.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Chat error: ${errorMessage.substring(0, 100)}` },
      { status: 500 }
    );
  }
}
