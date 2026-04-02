// Structured knowledge base for the AI agent
// This data is used to provide accurate, consistent responses

export const KNOWLEDGE_BASE = {
  company: {
    name: "Flowforge.systems",
    email: "contact@flowforge.systems",
    description: "AI-powered business automation solutions",
    location: "Georgia",
    languages: ["English", "Georgian"],
    supportHours: "24/7 via chat, business hours for calls",
    responseTime: "Within 24 hours for email inquiries"
  },

  services: [
    {
      id: "crm",
      name: "AI-Powered CRM",
      shortDescription: "Smart customer relationship management with AI-driven insights",
      description: "Our AI-Powered CRM transforms how you manage customer relationships. It automatically scores and qualifies leads, creates personalized follow-up sequences, and provides deep customer behavior analytics.",
      features: [
        "Automated lead scoring and qualification",
        "Personalized follow-up sequences",
        "Customer behavior analytics",
        "Real-time sales pipeline insights",
        "Integration with email, calendar, and existing tools",
        "Predictive sales forecasting",
        "Automated data entry and enrichment"
      ],
      integrations: ["Gmail", "Outlook", "Google Calendar", "Slack", "Zapier", "HubSpot", "Salesforce"],
      timeline: "4-8 weeks",
      priceRange: "$3,000 - $15,000",
      startingPrice: "$3,000",
      bestFor: ["Sales teams", "B2B companies", "Growing businesses with multiple customer touchpoints"]
    },
    {
      id: "chatbots",
      name: "Custom Chatbots",
      shortDescription: "24/7 AI-powered customer support and lead capture",
      description: "Build intelligent chatbots that handle customer inquiries around the clock, capture and qualify leads automatically, and seamlessly hand off to human agents when needed.",
      features: [
        "24/7 automated customer support",
        "Intelligent lead capture and qualification",
        "Multi-language support (including Georgian)",
        "Natural conversation flow with context awareness",
        "Human agent handoff capability",
        "Analytics and conversation insights",
        "Custom training on your business data"
      ],
      platforms: ["Website", "WhatsApp", "Telegram", "Facebook Messenger", "Instagram DM"],
      timeline: "2-4 weeks",
      priceRange: "$1,500 - $8,000",
      startingPrice: "$1,500",
      bestFor: ["E-commerce", "Customer service teams", "Lead generation", "Appointment booking"]
    },
    {
      id: "automation",
      name: "Workflow Automation",
      shortDescription: "Automate repetitive tasks and connect your business apps",
      description: "Streamline your operations by automating repetitive tasks, connecting different apps and services, and creating efficient workflows that save time and reduce errors.",
      features: [
        "Task and process automation",
        "App-to-app integrations (1000+ apps)",
        "Automated data entry and syncing",
        "Report generation and distribution",
        "Email and notification workflows",
        "Approval process automation",
        "Custom trigger-based actions"
      ],
      integrations: ["Google Workspace", "Microsoft 365", "Slack", "Notion", "Airtable", "Shopify", "QuickBooks", "and 1000+ more via APIs"],
      timeline: "2-6 weeks",
      priceRange: "$2,000 - $10,000",
      startingPrice: "$2,000",
      bestFor: ["Operations teams", "Small businesses", "Anyone doing repetitive digital tasks"]
    },
    {
      id: "apps",
      name: "Web & Mobile Apps",
      shortDescription: "Custom web and mobile applications tailored to your needs",
      description: "Full-stack development of custom web and mobile applications. From e-commerce platforms to internal tools, we build scalable, modern applications using cutting-edge technology.",
      features: [
        "Custom web applications",
        "Mobile apps (iOS & Android)",
        "E-commerce solutions",
        "Admin dashboards and portals",
        "API development and integration",
        "Responsive design",
        "Cloud hosting and deployment"
      ],
      technologies: ["React", "Next.js", "React Native", "Node.js", "TypeScript", "PostgreSQL", "MongoDB"],
      timeline: "6-12 weeks",
      priceRange: "$5,000 - $50,000+",
      startingPrice: "$5,000",
      bestFor: ["Startups", "Businesses needing custom solutions", "Digital transformation projects"]
    }
  ],

  faqs: [
    {
      question: "How do I get started?",
      answer: "Getting started is easy! Just share your requirements with us through chat or email, and we'll schedule a free consultation to understand your needs. After that, we'll provide a detailed proposal with timeline and pricing.",
      keywords: ["start", "begin", "get started", "how to start", "first step"]
    },
    {
      question: "Do you offer support after project completion?",
      answer: "Yes! All projects include 30 days of free support after launch. We also offer ongoing maintenance and support packages for long-term partnership.",
      keywords: ["support", "maintenance", "after", "post-launch", "help"]
    },
    {
      question: "Can you integrate with my existing tools?",
      answer: "Absolutely! We specialize in integrations. Whether it's CRM systems, email platforms, accounting software, or custom APIs, we can connect your tools seamlessly.",
      keywords: ["integrate", "integration", "connect", "existing tools", "api"]
    },
    {
      question: "What is your development process?",
      answer: "Our process follows 5 stages: 1) Discovery - understanding your needs, 2) Design - creating wireframes and prototypes, 3) Development - building the solution, 4) Testing - ensuring quality, 5) Launch - deploying and training your team.",
      keywords: ["process", "how do you work", "methodology", "stages", "steps"]
    },
    {
      question: "Do you work with startups?",
      answer: "Yes, we love working with startups! We offer flexible packages and can work within startup budgets. We understand the need for speed and iteration in the startup environment.",
      keywords: ["startup", "new business", "early stage", "small business"]
    },
    {
      question: "How much does it cost?",
      answer: "Pricing depends on project scope, complexity, and timeline. Our projects typically range from $1,500 for simple chatbots to $50,000+ for complex applications. Share your requirements for a personalized quote.",
      keywords: ["cost", "price", "pricing", "how much", "budget", "expensive"]
    },
    {
      question: "How long does a project take?",
      answer: "Timelines vary by project type: Chatbots take 2-4 weeks, Workflow Automation 2-6 weeks, CRM systems 4-8 weeks, and Custom Apps 6-12 weeks. We'll provide a detailed timeline in our proposal.",
      keywords: ["time", "how long", "timeline", "duration", "when", "deadline"]
    },
    {
      question: "Do you offer free consultations?",
      answer: "Yes! We offer free initial consultations to understand your needs and determine how we can help. No commitment required - just share your contact info and we'll reach out.",
      keywords: ["free", "consultation", "meeting", "call", "discuss"]
    },
    {
      question: "What makes Flowforge different?",
      answer: "We combine AI expertise with practical business knowledge. Our solutions aren't just technically sound - they're designed to solve real business problems and deliver measurable ROI.",
      keywords: ["different", "unique", "why you", "why flowforge", "special"]
    },
    {
      question: "Do you provide training?",
      answer: "Yes, training is included with every project. We ensure your team knows how to use and maintain the solution effectively. We also provide documentation and video guides.",
      keywords: ["training", "learn", "teach", "documentation", "guide"]
    }
  ],

  pricing: {
    factors: [
      "Project complexity and scope",
      "Number of features and integrations",
      "Timeline requirements",
      "Custom design requirements",
      "Ongoing support needs"
    ],
    note: "All prices are estimates. We provide detailed, fixed-price quotes after understanding your specific requirements.",
    paymentTerms: "Typically 50% upfront, 50% on completion. Flexible terms available for larger projects.",
    guarantee: "We offer a satisfaction guarantee - we'll work with you until you're happy with the result."
  },

  processSteps: [
    {
      step: 1,
      name: "Discovery",
      description: "We learn about your business, goals, and challenges through a detailed consultation."
    },
    {
      step: 2,
      name: "Proposal",
      description: "You receive a detailed proposal with scope, timeline, and pricing."
    },
    {
      step: 3,
      name: "Design",
      description: "We create wireframes and prototypes for your approval."
    },
    {
      step: 4,
      name: "Development",
      description: "Our team builds your solution with regular progress updates."
    },
    {
      step: 5,
      name: "Testing",
      description: "Thorough testing ensures everything works perfectly."
    },
    {
      step: 6,
      name: "Launch",
      description: "We deploy your solution and train your team."
    }
  ]
};

// Helper function to search the knowledge base for relevant information
export function searchKnowledgeBase(query: string): string {
  const queryLower = query.toLowerCase();
  const results: string[] = [];

  // Search services
  for (const service of KNOWLEDGE_BASE.services) {
    if (
      queryLower.includes(service.id) ||
      queryLower.includes(service.name.toLowerCase()) ||
      service.features.some(f => queryLower.includes(f.toLowerCase()))
    ) {
      results.push(`${service.name}: ${service.description} Timeline: ${service.timeline}. Starting at ${service.startingPrice}.`);
    }
  }

  // Search FAQs
  for (const faq of KNOWLEDGE_BASE.faqs) {
    if (faq.keywords.some(k => queryLower.includes(k))) {
      results.push(`Q: ${faq.question} A: ${faq.answer}`);
    }
  }

  // If no specific matches, return general company info
  if (results.length === 0) {
    return `${KNOWLEDGE_BASE.company.name} specializes in ${KNOWLEDGE_BASE.company.description}. Our services include: ${KNOWLEDGE_BASE.services.map(s => s.name).join(', ')}.`;
  }

  return results.join('\n\n');
}

// Build context string for the AI from the knowledge base
export function buildKnowledgeContext(): string {
  const services = KNOWLEDGE_BASE.services.map(s =>
    `- ${s.name}: ${s.shortDescription}. Timeline: ${s.timeline}. Starting at ${s.startingPrice}.`
  ).join('\n');

  const faqs = KNOWLEDGE_BASE.faqs.slice(0, 5).map(f =>
    `Q: ${f.question}\nA: ${f.answer}`
  ).join('\n\n');

  return `
COMPANY: ${KNOWLEDGE_BASE.company.name}
EMAIL: ${KNOWLEDGE_BASE.company.email}
LOCATION: ${KNOWLEDGE_BASE.company.location}

SERVICES:
${services}

KEY FAQs:
${faqs}

PRICING NOTE: ${KNOWLEDGE_BASE.pricing.note}
`;
}
