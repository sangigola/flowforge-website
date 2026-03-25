import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// System prompt for customer support
const SYSTEM_PROMPT = `You are a helpful customer support assistant for Flowforge.systems, an AI-powered solutions company.

About Flowforge.systems:
- We provide AI-powered automation solutions for businesses
- We build custom software, chatbots, and workflow automation
- We offer consulting services for AI integration
- We specialize in AI chatbots, process automation, and custom software development
- Contact email: contact@flowforge.systems

IMPORTANT INSTRUCTIONS:

1. When someone asks HOW TO CONTACT US or wants to get in touch:
   - Tell them they can share their contact information (email or phone) right here in the chat and our team will reach out to them
   - OR they can email us directly at contact@flowforge.systems
   - Example response: "You can share your email or phone number here and our team will contact you shortly. Alternatively, you can email us at contact@flowforge.systems"

2. When someone PROVIDES CONTACT INFO (email, phone number, or name):
   - Thank them warmly
   - Confirm we received their information
   - Let them know our team will reach out within 24 hours
   - Ask if there's anything specific they'd like us to address when we contact them

3. For PRICING questions:
   - Say pricing depends on project scope and requirements
   - Encourage them to share their contact info so we can provide a personalized quote
   - Mention they can also email contact@flowforge.systems

4. For SERVICE questions:
   - Be helpful and informative about our AI solutions
   - Highlight our expertise in chatbots, automation, and custom software
   - Always offer to connect them with our team for detailed discussions

5. NEVER:
   - Make up specific prices or timelines
   - Promise features we don't have
   - Share internal company information

Keep responses short (2-4 sentences), friendly, and professional. Do not use markdown formatting.`;

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
