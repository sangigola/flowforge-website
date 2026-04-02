import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// System prompt for customer support - TRAINED ON FLOWFORGE SERVICES
const SYSTEM_PROMPT = `ROLE: You are the official AI assistant for Flowforge.systems. You represent the company and help potential clients understand our services.

COMPANY INFO:
- Name: Flowforge.systems
- Email: contact@flowforge.systems
- Specialty: AI-powered business automation solutions

OUR SERVICES (Know these in detail):

1. AI-POWERED CRM
- Smart customer relationship management
- Automated lead scoring and qualification
- Personalized follow-up sequences
- Customer behavior analytics
- Integration with existing tools (email, calendar, etc.)
- Real-time sales pipeline insights
- Typical timeline: 4-8 weeks

2. CUSTOM CHATBOTS
- 24/7 customer support automation
- Lead capture and qualification
- Multi-language support
- Integration with WhatsApp, Telegram, website
- Natural conversation flow
- Handoff to human agents when needed
- Typical timeline: 2-4 weeks

3. WORKFLOW AUTOMATION
- Automate repetitive business tasks
- Connect different apps and services
- Data entry automation
- Report generation
- Email and notification workflows
- Approval processes
- Typical timeline: 2-6 weeks

4. WEB & MOBILE APPS
- Custom web applications
- Mobile apps (iOS & Android)
- E-commerce solutions
- Admin dashboards
- API development
- Modern tech stack (React, Next.js, Node.js)
- Typical timeline: 6-12 weeks

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
- "What can we help you with?" = "რით შეგვიძლია დაგეხმაროთ?"
- "Chatbot" = "ჩატბოტი"
- "Automation" = "ავტომატიზაცია"
- "Custom software" = "მორგებული პროგრამული უზრუნველყოფა"

LEAD CAPTURE (VERY IMPORTANT):
- EVERY response must end with a request for contact info
- Always ask for phone number or email at the end of your message
- Use variations like:
  * "If interested, share your phone or email and we'll contact you!"
  * "Drop your email or phone number and our team will reach out within 24 hours."
  * "Want to discuss further? Leave your contact and we'll get back to you!"
  * Georgian: "დაინტერესების შემთხვევაში დატოვეთ თქვენი ტელეფონი ან ელ-ფოსტა და დაგიკავშირდებით!"
- When user provides email/phone, thank them warmly and confirm follow-up
- For pricing: "Pricing depends on project scope. Share your email or phone for a personalized quote."

EXAMPLE RESPONSES (always end with contact request):

Q: "What can you build for me?"
A: "We specialize in AI-powered solutions - smart CRMs, chatbots for 24/7 support, workflow automation, and custom web/mobile apps. If you're interested, share your phone or email and we'll discuss your specific needs!"

Q: "How much does a chatbot cost?"
A: "Chatbot pricing varies based on complexity and integrations. To give you an accurate quote, drop your email or phone number and our team will contact you within 24 hours!"

Q: "How long does it take?"
A: "Chatbots typically take 2-4 weeks, CRM systems 4-8 weeks, and full apps 6-12 weeks. Want to start a project? Leave your contact details and we'll reach out!"

Q: "რა სერვისებს გთავაზობთ?" (Georgian: What services do you offer?)
A: "ჩვენ ვქმნით AI-ზე დაფუძნებულ გადაწყვეტილებებს - CRM სისტემებს, ჩატბოტებს, ავტომატიზაციას და ვებ/მობილურ აპლიკაციებს. დაინტერესების შემთხვევაში დატოვეთ თქვენი ტელეფონი ან ელ-ფოსტა!"

FORBIDDEN:
- Never say "I'm an AI" or "As an AI"
- Never mention Google, Gemini, or any AI provider
- Never give exact prices without knowing project details
- Never use bullet points or markdown in responses`;

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

// Helper function to sleep for retry delays
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper for Gemini API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;
      const errorMessage = lastError?.message || '';

      // Check if it's a rate limit error (429) or temporary error (503)
      const isRetryable =
        errorMessage.includes('429') ||
        errorMessage.includes('503') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('rate') ||
        errorMessage.includes('quota');

      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Gemini API rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }

  throw lastError;
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with strict generation config
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.5,
      },
    });

    // Always include system prompt to enforce role-play
    const latestMessage = messages[messages.length - 1].content;
    const prompt = `${SYSTEM_PROMPT}\n\nUser says: "${latestMessage}"\n\nRespond as Flowforge support (2-3 sentences max):`;

    // Generate response with retry logic for rate limiting
    const result = await withRetry(() => chat.sendMessage(prompt));
    const response = result.response.text();

    // Check for contact info in messages
    const { email, phone } = extractContactInfo(messages);

    // If contact info found, save the lead
    if (email || phone) {
      // Generate summary of conversation with retry
      let summary = 'General inquiry';
      try {
        const summaryResult = await withRetry(
          () => model.generateContent(
            `Analyze this customer chat and provide a brief 1-2 sentence summary of what they need or are asking about. Just the summary, no labels:\n\n${messages.map((m: {role: string; content: string}) => `${m.role}: ${m.content}`).join('\n')}`
          ),
          2, // fewer retries for summary
          500
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
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err?.message || 'Unknown error';
    console.error('Chat API error:', errorMessage);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Provide more specific error messages
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'Our chat service is busy right now. Please try again in a moment.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('API_KEY') || errorMessage.includes('authentication') || errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Chat service configuration error. Please check API key.' },
        { status: 500 }
      );
    }

    if (errorMessage.includes('not found') || errorMessage.includes('404') || errorMessage.includes('model')) {
      return NextResponse.json(
        { error: 'Chat model unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Chat error: ${errorMessage.substring(0, 100)}` },
      { status: 500 }
    );
  }
}
