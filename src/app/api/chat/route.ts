import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// System prompt for customer support - STRICT ROLE-PLAY
const SYSTEM_PROMPT = `ROLE: You are the official customer support chatbot for Flowforge.systems. Act as an employee of this company at all times.

CRITICAL RULES - FOLLOW EXACTLY:
- You ARE Flowforge support. Never say "As an AI" or mention being made by Google.
- Never give long responses. Maximum 2-3 short sentences.
- Never use bullet points or markdown formatting.

COMPANY: Flowforge.systems
SERVICES: AI automation, custom software, chatbots, workflow automation
EMAIL: contact@flowforge.systems

EXACT RESPONSES TO USE:

For "how to contact" or "contact you" or "get in touch":
→ "You can share your email or phone number here and our team will contact you within 24 hours. Or email us at contact@flowforge.systems"

When user shares an email or phone number:
→ "Thank you! Our team will reach out within 24 hours. Is there anything specific you'd like us to discuss?"

For pricing questions:
→ "Pricing depends on your project scope. Share your contact details for a personalized quote, or email contact@flowforge.systems"

For "what services" or "what do you do":
→ "We build AI-powered solutions including chatbots, workflow automation, and custom software. Would you like to discuss your project needs?"

FORBIDDEN - NEVER SAY:
- "I'm an AI" or "As an AI assistant"
- "I don't have contact information"
- "I'm made by Google" or mention Google
- Long paragraphs or bullet point lists`;

// Patterns to detect contact information
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

interface ChatLead {
  id: string;
  email?: string;
  phone?: string;
  messages: { role: string; content: string }[];
  summary?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted';
}

// In-memory storage for chat leads (shared with users API)
declare global {
  // eslint-disable-next-line no-var
  var chatLeads: ChatLead[];
}

if (!global.chatLeads) {
  global.chatLeads = [];
}

// Function to extract contact info from messages
function extractContactInfo(messages: { role: string; content: string }[]) {
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with strict generation config
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      },
    });

    // Always include system prompt to enforce role-play
    const latestMessage = messages[messages.length - 1].content;
    const prompt = `${SYSTEM_PROMPT}\n\nUser says: "${latestMessage}"\n\nRespond as Flowforge support (2-3 sentences max):`;

    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    // Check for contact info in messages
    const { email, phone } = extractContactInfo(messages);

    // If contact info found, save the lead
    if (email || phone) {
      // Generate summary of conversation
      let summary = 'General inquiry';
      try {
        const summaryResult = await model.generateContent(
          `Analyze this customer chat and provide a brief 1-2 sentence summary of what they need or are asking about. Just the summary, no labels:\n\n${messages.map((m: {role: string; content: string}) => `${m.role}: ${m.content}`).join('\n')}`
        );
        summary = summaryResult.response.text();
      } catch {
        // Use default summary if analysis fails
      }

      // Check if lead already exists with this contact
      const existingLeadIndex = global.chatLeads.findIndex(
        lead => (email && lead.email === email) || (phone && lead.phone === phone)
      );

      if (existingLeadIndex >= 0) {
        // Update existing lead
        global.chatLeads[existingLeadIndex].messages = messages;
        global.chatLeads[existingLeadIndex].summary = summary;
      } else {
        // Create new lead
        const newLead: ChatLead = {
          id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          email,
          phone,
          messages,
          summary,
          createdAt: new Date().toISOString(),
          status: 'new'
        };
        global.chatLeads.push(newLead);
      }
    }

    return NextResponse.json({
      message: response,
      role: 'assistant',
      leadCaptured: !!(email || phone)
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
