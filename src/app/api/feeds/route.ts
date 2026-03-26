import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RegulatoryIntelligenceBot/1.0)',
  },
});

// RSS Feed sources for Caucasus region
const RSS_SOURCES = {
  // Georgia - Major News Sources
  georgia: [
    {
      name: 'Civil.ge',
      url: 'https://civil.ge/feed',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'Agenda.ge',
      url: 'https://agenda.ge/en/rss',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'Georgia Today',
      url: 'https://georgiatoday.ge/feed/',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'National Bank of Georgia',
      url: 'https://nbg.gov.ge/en/rss',
      country: 'Georgia',
      type: 'government',
    },
    // Popular Georgian news sources (from mediamonitoring.ge research)
    {
      name: 'Interpressnews',
      url: 'https://www.interpressnews.ge/en/rss',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'Ambebi.ge',
      url: 'https://ambebi.ge/rss',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'Netgazeti',
      url: 'https://netgazeti.ge/feed/',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'On.ge',
      url: 'https://on.ge/feed',
      country: 'Georgia',
      type: 'news',
    },
    {
      name: 'Business Media Georgia',
      url: 'https://bm.ge/en/rss',
      country: 'Georgia',
      type: 'business',
    },
    {
      name: 'Commersant.ge',
      url: 'https://commersant.ge/feed',
      country: 'Georgia',
      type: 'business',
    },
  ],
  // Armenia
  armenia: [
    {
      name: 'Armenpress',
      url: 'https://armenpress.am/eng/rss/',
      country: 'Armenia',
      type: 'news',
    },
    {
      name: 'News.am',
      url: 'https://news.am/eng/rss/',
      country: 'Armenia',
      type: 'news',
    },
    {
      name: 'Arka News',
      url: 'https://arka.am/en/rss/',
      country: 'Armenia',
      type: 'news',
    },
  ],
  // Azerbaijan
  azerbaijan: [
    {
      name: 'Azertag',
      url: 'https://azertag.az/rss',
      country: 'Azerbaijan',
      type: 'news',
    },
    {
      name: 'Trend.az',
      url: 'https://en.trend.az/rss/',
      country: 'Azerbaijan',
      type: 'news',
    },
    {
      name: 'Report.az',
      url: 'https://report.az/en/rss/',
      country: 'Azerbaijan',
      type: 'news',
    },
  ],
  // International sources covering the region
  international: [
    {
      name: 'Reuters Emerging Markets',
      url: 'https://www.reutersagency.com/feed/',
      country: 'International',
      type: 'financial',
    },
    {
      name: 'Eurasianet',
      url: 'https://eurasianet.org/feed',
      country: 'International',
      type: 'news',
    },
    {
      name: 'JAM News',
      url: 'https://jam-news.net/feed/',
      country: 'International',
      type: 'news',
    },
  ],
};

// Keywords for filtering relevant content
const TOBACCO_KEYWORDS = [
  // Direct tobacco terms
  'tobacco', 'cigarette', 'cigarettes', 'smoking', 'smoker', 'nicotine',
  'vape', 'vaping', 'e-cigarette', 'heated tobacco', 'iqos', 'heets',
  // Tax and regulation
  'excise', 'excise tax', 'tax', 'duty', 'customs', 'tariff',
  'regulation', 'legislation', 'parliament', 'law', 'amendment', 'ban',
  // Trade
  'trade', 'import', 'export', 'smuggling', 'illicit', 'contraband',
  'price', 'retail', 'wholesale',
  // Market
  'fmcg', 'consumer', 'market', 'economy', 'inflation', 'currency',
  'exchange rate',
  // Logistics
  'logistics', 'transport', 'border', 'sanctions', 'distribution',
  // Companies
  'philip morris', 'bat', 'jti', 'imperial', 'PMI', 'british american tobacco',
  'japan tobacco', 'altria', 'reynolds',
  // Georgian specific
  'თამბაქო', 'სიგარეტი', 'აქციზი' // Georgian: tobacco, cigarette, excise
];

const REGULATORY_KEYWORDS = [
  'regulation', 'law', 'legislation', 'parliament', 'government',
  'ministry', 'decree', 'amendment', 'policy', 'ban', 'restriction',
  'compliance', 'license', 'permit', 'tax', 'excise', 'duty'
];

interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
  country: string;
  type: string;
  category: 'regulatory' | 'market' | 'competitor' | 'logistics' | 'general';
  relevanceScore: number;
}

function categorizeItem(title: string, description: string): FeedItem['category'] {
  const text = `${title} ${description}`.toLowerCase();

  if (REGULATORY_KEYWORDS.some(kw => text.includes(kw))) {
    return 'regulatory';
  }
  if (text.includes('price') || text.includes('market') || text.includes('trade') || text.includes('retail')) {
    return 'market';
  }
  if (text.includes('philip morris') || text.includes('bat') || text.includes('jti') || text.includes('competitor')) {
    return 'competitor';
  }
  if (text.includes('transport') || text.includes('logistics') || text.includes('border') || text.includes('customs')) {
    return 'logistics';
  }
  return 'general';
}

function calculateRelevance(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  TOBACCO_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });

  // Boost for regulatory content
  REGULATORY_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 5;
    }
  });

  return Math.min(score, 100);
}

async function fetchFeed(source: typeof RSS_SOURCES.georgia[0]): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return (feed.items || []).slice(0, 20).map((item, index) => ({
      id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
      title: item.title || 'No title',
      description: item.contentSnippet || item.content || item.summary || '',
      link: item.link || source.url,
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: source.name,
      sourceUrl: source.url.replace(/\/feed.*$|\/rss.*$/i, ''),
      country: source.country,
      type: source.type,
      category: categorizeItem(item.title || '', item.contentSnippet || ''),
      relevanceScore: calculateRelevance(item.title || '', item.contentSnippet || ''),
    }));
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const allSources = [
      ...RSS_SOURCES.georgia,
      ...RSS_SOURCES.armenia,
      ...RSS_SOURCES.azerbaijan,
      ...RSS_SOURCES.international,
    ];

    // Fetch all feeds in parallel
    const feedPromises = allSources.map(source => fetchFeed(source));
    const feedResults = await Promise.allSettled(feedPromises);

    const allItems: FeedItem[] = [];

    feedResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    });

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Filter and categorize
    const regulatory = allItems.filter(item => item.category === 'regulatory' || item.relevanceScore > 30);
    const market = allItems.filter(item => item.category === 'market');
    const competitor = allItems.filter(item => item.category === 'competitor');
    const logistics = allItems.filter(item => item.category === 'logistics');
    const general = allItems.filter(item => item.relevanceScore > 10);

    const response = {
      lastUpdated: new Date().toISOString(),
      totalItems: allItems.length,
      feeds: {
        all: allItems.slice(0, 100),
        regulatory: regulatory.slice(0, 30),
        market: market.slice(0, 30),
        competitor: competitor.slice(0, 20),
        logistics: logistics.slice(0, 20),
        general: general.slice(0, 50),
      },
      byCountry: {
        georgia: allItems.filter(item => item.country === 'Georgia').slice(0, 30),
        armenia: allItems.filter(item => item.country === 'Armenia').slice(0, 30),
        azerbaijan: allItems.filter(item => item.country === 'Azerbaijan').slice(0, 30),
        international: allItems.filter(item => item.country === 'International').slice(0, 20),
      },
      sources: allSources.map(s => ({ name: s.name, country: s.country, type: s.type })),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Feed aggregation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeds', message: String(error) },
      { status: 500 }
    );
  }
}
