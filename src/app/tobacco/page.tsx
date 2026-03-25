'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Bell,
  Calendar,
  Globe,
  Building2,
  DollarSign,
  Activity,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  Newspaper,
  Sun,
  Moon,
  ArrowRight,
  Zap,
  BarChart3,
  FileText,
  AlertOctagon,
  Info,
  ShieldAlert,
  ShieldCheck,
  Truck,
  ShoppingCart,
  MapPin,
  TrendingDown,
  Briefcase,
  Target
} from 'lucide-react';

import {
  fetchExchangeRates,
  fetchOilPrices,
  fetchTobaccoNews,
  fetchRegulationAlerts,
  fetchMarketData,
  fetchShipmentData,
  fetchTaxRates,
  fetchGovernmentContacts,
  fetchMacroeconomicData,
  fetchCompetitorActions,
  fetchLogisticsAlerts,
  fetchRetailUpdates,
  fetchConsumerTrends,
  fetchGeopoliticalRisks,
  fetchExecutiveBrief,
  fetchCrossMarketComparison,
  fetchLiveFeeds,
  refreshLiveFeeds,
  convertFeedToNews,
  refreshAllData,
  DATA_SOURCES,
  type ExchangeRates,
  type OilPrices,
  type NewsItem,
  type RegulationAlert,
  type MarketData,
  type ShipmentData,
  type TaxRates,
  type GovernmentContact,
  type MacroeconomicData,
  type CompetitorAction,
  type LogisticsAlert,
  type RetailUpdate,
  type ConsumerTrend,
  type GeopoliticalRisk,
  type ExecutiveBrief,
  type CrossMarketComparison,
  type LiveFeedResponse
} from '@/lib/data-service';

// Modal Component
function Modal({
  isOpen,
  onClose,
  title,
  children,
  theme
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme: 'dark' | 'light';
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative ${theme === 'dark' ? 'bg-zinc-900/95' : 'bg-white'} backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl ${theme === 'light' ? 'shadow-gray-200/50' : ''}`}>
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TobaccoHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'markets' | 'logistics' | 'competitors' | 'contacts' | 'sources'>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Modal states
  const [selectedAlert, setSelectedAlert] = useState<RegulationAlert | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<{ country: string; category: string; alert: RegulationAlert | null } | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorAction | null>(null);
  const [selectedLogistics, setSelectedLogistics] = useState<LogisticsAlert | null>(null);
  const [selectedRetail, setSelectedRetail] = useState<RetailUpdate | null>(null);
  const [selectedGeopolitical, setSelectedGeopolitical] = useState<GeopoliticalRisk | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentData | null>(null);
  const [showRiskInfo, setShowRiskInfo] = useState<'high' | 'medium' | 'low' | null>(null);

  // Data states - Core
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [oilPrices, setOilPrices] = useState<OilPrices | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<RegulationAlert[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [shipmentData, setShipmentData] = useState<ShipmentData[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRates[]>([]);
  const [contacts, setContacts] = useState<GovernmentContact[]>([]);

  // Data states - Extended
  const [macroData, setMacroData] = useState<MacroeconomicData[]>([]);
  const [competitorActions, setCompetitorActions] = useState<CompetitorAction[]>([]);
  const [logisticsAlerts, setLogisticsAlerts] = useState<LogisticsAlert[]>([]);
  const [retailUpdates, setRetailUpdates] = useState<RetailUpdate[]>([]);
  const [consumerTrends, setConsumerTrends] = useState<ConsumerTrend[]>([]);
  const [geopoliticalRisks, setGeopoliticalRisks] = useState<GeopoliticalRisk[]>([]);
  const [executiveBrief, setExecutiveBrief] = useState<ExecutiveBrief | null>(null);
  const [crossMarketData, setCrossMarketData] = useState<CrossMarketComparison[]>([]);

  // Live feed states
  const [liveFeeds, setLiveFeeds] = useState<LiveFeedResponse | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('tobacco_hub_theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tobacco_hub_theme', newTheme);
  };

  // Load data
  const loadData = useCallback(async () => {
    const [
      rates, oil, newsData, alertsData, market, shipments, taxes, govContacts,
      macro, competitors, logistics, retail, consumer, geopolitical, brief, crossMarket,
      liveFeedData
    ] = await Promise.all([
      fetchExchangeRates(),
      fetchOilPrices(),
      fetchTobaccoNews(),
      fetchRegulationAlerts(),
      fetchMarketData(),
      fetchShipmentData(),
      fetchTaxRates(),
      fetchGovernmentContacts(),
      fetchMacroeconomicData(),
      fetchCompetitorActions(),
      fetchLogisticsAlerts(),
      fetchRetailUpdates(),
      fetchConsumerTrends(),
      fetchGeopoliticalRisks(),
      fetchExecutiveBrief(),
      fetchCrossMarketComparison(),
      fetchLiveFeeds()
    ]);

    setExchangeRates(rates);
    setOilPrices(oil);

    // If we have live feeds, merge them with mock news
    if (liveFeedData && liveFeedData.feeds.all.length > 0) {
      const liveNews = convertFeedToNews(liveFeedData.feeds.all.slice(0, 30));
      setNews([...liveNews, ...newsData.slice(0, 5)]);
      setLiveFeeds(liveFeedData);
      setIsLive(true);
    } else {
      setNews(newsData);
      setIsLive(false);
    }

    setAlerts(alertsData);
    setMarketData(market);
    setShipmentData(shipments);
    setTaxRates(taxes);
    setMacroData(macro);
    setCompetitorActions(competitors);
    setLogisticsAlerts(logistics);
    setRetailUpdates(retail);
    setConsumerTrends(consumer);
    setGeopoliticalRisks(geopolitical);
    setExecutiveBrief(brief);
    setCrossMarketData(crossMarket);
    setContacts(govContacts);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllData();
    await refreshLiveFeeds();
    await loadData();
    setIsRefreshing(false);
  };

  // Theme classes - Modern minimalistic
  const bgMain = theme === 'dark'
    ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950'
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-50';
  const bgCard = theme === 'dark'
    ? 'bg-zinc-900/60 backdrop-blur-xl'
    : 'bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-100';
  const bgCardHover = theme === 'dark'
    ? 'hover:bg-zinc-800/80'
    : 'hover:bg-slate-50 hover:shadow-md hover:shadow-slate-100';
  const bgCardSolid = theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm shadow-slate-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-zinc-400' : 'text-slate-600';
  const textMuted = theme === 'dark' ? 'text-zinc-500' : 'text-slate-400';
  const cardInner = theme === 'dark' ? 'bg-zinc-800/50' : 'bg-slate-50/80';

  // Calculate days until deadline
  const getDaysUntil = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Get priority alerts for briefing
  const priorityAlerts = alerts.filter(a => a.status === 'Action Required' || a.priority === 'High').slice(0, 3);
  const upcomingDeadlines = alerts.filter(a => a.deadline).sort((a, b) =>
    new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
  ).slice(0, 5);

  // Risk heat map data
  const riskCategories = ['Tax', 'Licensing', 'Health Warning', 'RRP', 'Labeling'];
  const countries = ['Georgia', 'Armenia', 'Azerbaijan'];

  const getRiskLevel = (country: string, category: string): 'high' | 'medium' | 'low' => {
    const alert = alerts.find(a => a.country === country && a.category === category && a.status !== 'Resolved');
    if (!alert) return 'low';
    if (alert.priority === 'High' || alert.status === 'Action Required') return 'high';
    if (alert.priority === 'Medium') return 'medium';
    return 'low';
  };

  const getRiskAlert = (country: string, category: string): RegulationAlert | null => {
    return alerts.find(a => a.country === country && a.category === category && a.status !== 'Resolved') || null;
  };

  const riskDescriptions = {
    high: {
      label: 'High Risk',
      description: 'Immediate attention required. Active regulatory changes or deadlines within 30 days that may significantly impact operations.',
      icon: AlertOctagon,
      color: 'text-red-400',
      bg: 'bg-gradient-to-br from-red-500 to-orange-500'
    },
    medium: {
      label: 'Medium Risk',
      description: 'Monitoring recommended. Proposed changes or upcoming requirements that need preparation within 90 days.',
      icon: ShieldAlert,
      color: 'text-yellow-400',
      bg: 'bg-gradient-to-br from-yellow-500 to-orange-400'
    },
    low: {
      label: 'Low Risk',
      description: 'Stable environment. No significant regulatory changes expected. Continue routine compliance monitoring.',
      icon: ShieldCheck,
      color: 'text-green-400',
      bg: theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-200'
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Search results
  const searchResults = searchQuery ? [
    ...alerts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).map(a => ({ type: 'alert', item: a })),
    ...news.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map(n => ({ type: 'news', item: n }))
  ].slice(0, 8) : [];

  // Count risks
  const highRiskCount = countries.reduce((count, country) =>
    count + riskCategories.filter(cat => getRiskLevel(country, cat) === 'high').length, 0);
  const mediumRiskCount = countries.reduce((count, country) =>
    count + riskCategories.filter(cat => getRiskLevel(country, cat) === 'medium').length, 0);

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-500`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${bgCard} backdrop-blur-2xl`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center`}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className={`text-base font-bold ${textPrimary} whitespace-nowrap hidden sm:block`}>Regulatory Intelligence Hub</h1>
            </Link>
            {/* Live Indicator */}
            {isLive && (
              <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs font-semibold text-red-500">LIVE</span>
              </div>
            )}

            {/* Navigation Tabs - Center */}
            <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl mx-auto ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-slate-100/80'}`}>
              {[
                { id: 'overview', label: 'Overview', icon: Zap },
                { id: 'alerts', label: 'Alerts', icon: Bell },
                { id: 'markets', label: 'Markets', icon: TrendingUp },
                { id: 'logistics', label: 'Logistics', icon: Truck },
                { id: 'competitors', label: 'Competitors', icon: Target },
                { id: 'contacts', label: 'Contacts', icon: Building2 },
                { id: 'sources', label: 'Sources', icon: Globe }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : `${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Actions - Right */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50 hover:bg-zinc-800' : 'bg-slate-100 hover:bg-slate-200'} transition-all`}
                >
                  <Search className="w-5 h-5" />
                </button>

                {showSearch && (
                  <div className={`absolute right-0 top-14 w-96 ${bgCardSolid} rounded-2xl shadow-2xl overflow-hidden`}>
                    <div className="p-4">
                      <input
                        type="text"
                        placeholder="Search alerts, news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className={`w-full px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-100'} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className={`border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} max-h-80 overflow-y-auto`}>
                        {searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (result.type === 'alert') setSelectedAlert(result.item as RegulationAlert);
                              else setSelectedNews(result.item as NewsItem);
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className={`p-4 cursor-pointer ${bgCardHover} transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              {result.type === 'alert' ? <AlertCircle className="w-4 h-4 text-orange-400" /> : <Newspaper className="w-4 h-4 text-blue-400" />}
                              <span className="text-sm truncate">{(result.item as any).title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50 hover:bg-zinc-800' : 'bg-slate-100 hover:bg-slate-200'} transition-all`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50 hover:bg-zinc-800' : 'bg-slate-100 hover:bg-slate-200'} transition-all disabled:opacity-50`}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${bgCard} backdrop-blur-2xl`}>
        <div className="flex items-center justify-around py-3">
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'markets', label: 'Markets', icon: TrendingUp },
            { id: 'logistics', label: 'Logistics', icon: Truck },
            { id: 'competitors', label: 'Compete', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id ? 'text-blue-500' : textMuted
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24 md:pb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive Daily Brief */}
            {executiveBrief && (
              <section className={`${bgCard} rounded-3xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${textPrimary}`}>Executive Daily Brief</h2>
                    <p className={`text-sm ${textMuted}`}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Top Risks */}
                  <div>
                    <h3 className={`text-sm font-semibold ${textMuted} mb-3 flex items-center gap-2`}>
                      <AlertOctagon className="w-4 h-4 text-red-400" /> Top Risks
                    </h3>
                    <div className="space-y-2">
                      {executiveBrief.topRisks.map((risk, idx) => (
                        <a key={idx} href={risk.sourceUrl} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl ${cardInner} hover:scale-[1.02] transition-all`}>
                          <div className="flex items-start gap-2">
                            <span className={`text-xs mt-0.5 ${
                              risk.severity === 'High' ? 'text-red-400' : 'text-yellow-400'
                            }`}>●</span>
                            <div>
                              <p className={`text-sm ${textPrimary}`}>{risk.title}</p>
                              <p className={`text-xs ${textMuted} mt-1`}>{risk.country}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h3 className={`text-sm font-semibold ${textMuted} mb-3 flex items-center gap-2`}>
                      <TrendingUp className="w-4 h-4 text-green-400" /> Opportunities
                    </h3>
                    <div className="space-y-2">
                      {executiveBrief.opportunities.map((opp, idx) => (
                        <a key={idx} href={opp.sourceUrl} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl ${cardInner} hover:scale-[1.02] transition-all`}>
                          <div className="flex items-start gap-2">
                            <span className="text-xs mt-0.5 text-green-400">●</span>
                            <div>
                              <p className={`text-sm ${textPrimary}`}>{opp.title}</p>
                              <p className={`text-xs ${textMuted} mt-1`}>{opp.country}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Key Changes */}
                  <div>
                    <h3 className={`text-sm font-semibold ${textMuted} mb-3 flex items-center gap-2`}>
                      <Activity className="w-4 h-4 text-blue-400" /> Key Changes
                    </h3>
                    <div className="space-y-2">
                      {executiveBrief.keyChanges.map((change, idx) => (
                        <a key={idx} href={change.sourceUrl} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl ${cardInner} hover:scale-[1.02] transition-all`}>
                          <div className="flex items-start gap-2">
                            <span className="text-xs mt-0.5 text-blue-400">●</span>
                            <div>
                              <p className={`text-sm ${textPrimary}`}>{change.title}</p>
                              <p className={`text-xs ${textMuted} mt-1`}>{change.country}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Status Summary - Enhanced */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h3 className={`text-sm font-semibold ${textMuted} mb-4`}>Market Status Overview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { country: 'Georgia', flag: '🇬🇪', data: executiveBrief.marketSummary.georgia, macro: macroData.find(m => m.country === 'Georgia') },
                      { country: 'Armenia', flag: '🇦🇲', data: executiveBrief.marketSummary.armenia, macro: macroData.find(m => m.country === 'Armenia') },
                      { country: 'Azerbaijan', flag: '🇦🇿', data: executiveBrief.marketSummary.azerbaijan, macro: macroData.find(m => m.country === 'Azerbaijan') }
                    ].map((item) => (
                      <div key={item.country} className={`p-4 rounded-xl ${cardInner}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{item.flag}</span>
                          <span className={`text-sm font-medium ${textPrimary}`}>{item.country}</span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg mb-3 ${
                          item.data.status === 'Improving' ? 'bg-green-500/20' :
                          item.data.status === 'Declining' ? 'bg-red-500/20' : 'bg-blue-500/20'
                        }`}>
                          {item.data.status === 'Improving' ? <TrendingUp className="w-3 h-3 text-green-400" /> :
                           item.data.status === 'Declining' ? <TrendingDown className="w-3 h-3 text-red-400" /> :
                           <Activity className="w-3 h-3 text-blue-400" />}
                          <span className={`text-xs font-medium ${
                            item.data.status === 'Improving' ? 'text-green-400' :
                            item.data.status === 'Declining' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {item.data.status === 'Improving' ? 'Growth Trend' :
                             item.data.status === 'Declining' ? 'Declining' : 'Stable Market'}
                          </span>
                        </div>
                        <p className={`text-xs ${textMuted} mb-2`}>{item.data.note}</p>
                        {item.macro && (
                          <div className={`text-xs ${textMuted} pt-2 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <div className="flex justify-between">
                              <span>Inflation:</span>
                              <span className={item.macro.inflation > 3.5 ? 'text-orange-400' : 'text-green-400'}>{item.macro.inflation}%</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Currency:</span>
                              <span className={item.macro.exchangeRateChange < 0 ? 'text-red-400' : 'text-green-400'}>
                                {item.macro.exchangeRateChange > 0 ? '+' : ''}{item.macro.exchangeRateChange}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Priority Alerts */}
            <section className={`${bgCard} rounded-3xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary}`}>Priority Alerts</h2>
                  <p className={`text-sm ${textMuted}`}>Items requiring immediate attention</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priorityAlerts.length > 0 ? priorityAlerts.map((alert, idx) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      idx === 0
                        ? 'bg-gradient-to-br from-red-500/20 to-orange-500/10'
                        : cardInner
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        alert.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {alert.priority}
                      </span>
                      {alert.deadline && (
                        <span className={`text-xs ${textMuted}`}>
                          {getDaysUntil(alert.deadline)}d left
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium ${textPrimary} line-clamp-2`}>{alert.title}</p>
                    <p className={`text-xs ${textMuted} mt-2`}>{alert.country} • {alert.category}</p>
                  </div>
                )) : (
                  <div className={`col-span-3 text-center py-8 ${textMuted}`}>
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p>All clear! No high priority alerts today.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'USD/GEL',
                  value: exchangeRates?.USD_GEL.toFixed(2) || '...',
                  icon: DollarSign,
                  color: 'from-emerald-500 to-teal-500',
                  link: DATA_SOURCES.georgiaCentralBank.url,
                  source: 'National Bank of Georgia'
                },
                {
                  label: 'Brent Crude',
                  value: `$${oilPrices?.brent.toFixed(0) || '...'}`,
                  icon: Activity,
                  color: 'from-purple-500 to-pink-500',
                  change: oilPrices?.change,
                  link: DATA_SOURCES.oilPrices.url,
                  source: 'Trading Economics'
                },
                {
                  label: 'Active Alerts',
                  value: alerts.filter(a => a.status !== 'Resolved').length.toString(),
                  icon: AlertTriangle,
                  color: 'from-orange-500 to-red-500',
                  sub: `${highRiskCount} high risk`
                },
                {
                  label: 'Countries',
                  value: '3',
                  icon: Globe,
                  color: 'from-blue-500 to-indigo-500',
                  sub: 'GE, AM, AZ'
                }
              ].map((stat) => (
                <a
                  key={stat.label}
                  href={stat.link}
                  target={stat.link ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`${bgCard} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] ${stat.link ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-sm ${textMuted}`}>{stat.label}</p>
                    {stat.change !== undefined && (
                      <span className={`text-xs ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {stat.source && (
                    <p className={`text-xs ${textMuted} mt-1 flex items-center gap-1`}>
                      <ExternalLink className="w-3 h-3" /> {stat.source}
                    </p>
                  )}
                  {stat.sub && <p className={`text-xs ${textMuted} mt-1`}>{stat.sub}</p>}
                </a>
              ))}
            </div>

            {/* Macroeconomic Indicators */}
            <section className={`${bgCard} rounded-3xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>Macroeconomic Indicators</h2>
                  <p className={`text-xs ${textMuted}`}>Currency, inflation, and interest rates</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {macroData.map((data) => (
                  <a
                    key={data.countryCode}
                    href={data.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-2xl ${cardInner} hover:scale-[1.02] transition-all`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-lg font-medium ${textPrimary}`}>
                        {data.country === 'Georgia' ? '🇬🇪' : data.country === 'Armenia' ? '🇦🇲' : '🇦🇿'} {data.country}
                      </span>
                      <span className={`text-xs ${textMuted}`}>{data.currency}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-xs ${textMuted}`}>Exchange Rate (USD)</span>
                        <span className={`text-sm ${data.exchangeRateChange < 0 ? 'text-red-400' : data.exchangeRateChange > 0 ? 'text-green-400' : textPrimary}`}>
                          {data.exchangeRate.toFixed(2)} {data.exchangeRateChange !== 0 && `(${data.exchangeRateChange > 0 ? '+' : ''}${data.exchangeRateChange.toFixed(1)}%)`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-xs ${textMuted}`}>Inflation (YoY)</span>
                        <span className={`text-sm ${data.inflation > data.inflationPrevious ? 'text-orange-400' : 'text-green-400'}`}>
                          {data.inflation.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-xs ${textMuted}`}>Interest Rate</span>
                        <span className={`text-sm ${textPrimary}`}>{data.interestRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-xs ${textMuted}`}>GDP Growth</span>
                        <span className={`text-sm text-green-400`}>{data.gdpGrowth.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className={`text-xs ${textMuted} mt-3 flex items-center gap-1`}>
                      <ExternalLink className="w-3 h-3" /> {data.source.name}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            {/* Timeline & Risk Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Deadlines Timeline */}
              <section className={`${bgCard} rounded-3xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>Upcoming Deadlines</h2>
                </div>

                <div className="relative">
                  <div className={`absolute left-5 top-0 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`} />

                  <div className="space-y-4">
                    {upcomingDeadlines.map((alert) => {
                      const days = getDaysUntil(alert.deadline!);
                      return (
                        <div
                          key={alert.id}
                          onClick={() => setSelectedAlert(alert)}
                          className="relative pl-12 cursor-pointer group"
                        >
                          <div className={`absolute left-3 w-4 h-4 rounded-full ${
                            days <= 7 ? 'bg-red-500' :
                            days <= 30 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />

                          <div className={`p-4 rounded-2xl transition-all ${cardInner} ${bgCardHover}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-medium ${
                                days <= 7 ? 'text-red-400' :
                                days <= 30 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {days <= 0 ? 'Overdue' : `${days} days left`}
                              </span>
                              <span className={`text-xs ${textMuted}`}>{alert.deadline}</span>
                            </div>
                            <p className={`text-sm font-medium ${textPrimary} line-clamp-1`}>{alert.title}</p>
                            <p className={`text-xs ${textMuted} mt-1`}>{alert.country}</p>
                          </div>
                        </div>
                      );
                    })}
                    {upcomingDeadlines.length === 0 && (
                      <p className={`text-center py-8 ${textMuted}`}>No upcoming deadlines</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Cross-Market Comparison */}
              <section className={`${bgCard} rounded-3xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${textPrimary}`}>Cross-Market Comparison</h2>
                    <p className={`text-xs ${textMuted}`}>Key indicators across Caucasus region</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 text-sm font-medium ${textMuted}`}>Indicator</th>
                        <th className={`text-center py-3 px-4 text-sm font-medium ${textMuted}`}>🇬🇪 Georgia</th>
                        <th className={`text-center py-3 px-4 text-sm font-medium ${textMuted}`}>🇦🇲 Armenia</th>
                        <th className={`text-center py-3 px-4 text-sm font-medium ${textMuted}`}>🇦🇿 Azerbaijan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crossMarketData.map((row, idx) => (
                        <tr key={idx} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                          <td className={`py-3 px-4 text-sm font-medium ${textPrimary}`}>{row.indicator}</td>
                          <td className="py-3 px-4 text-center">
                            <a href={row.georgia.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                              <span className={`text-sm ${
                                row.georgia.trend === 'Up' ? 'text-green-400' :
                                row.georgia.trend === 'Down' ? 'text-red-400' : 'text-blue-400'
                              }`}>
                                {row.georgia.trend === 'Up' ? '↑' : row.georgia.trend === 'Down' ? '↓' : '→'} {row.georgia.value}
                              </span>
                            </a>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <a href={row.armenia.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                              <span className={`text-sm ${
                                row.armenia.trend === 'Up' ? 'text-green-400' :
                                row.armenia.trend === 'Down' ? 'text-red-400' : 'text-blue-400'
                              }`}>
                                {row.armenia.trend === 'Up' ? '↑' : row.armenia.trend === 'Down' ? '↓' : '→'} {row.armenia.value}
                              </span>
                            </a>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <a href={row.azerbaijan.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                              <span className={`text-sm ${
                                row.azerbaijan.trend === 'Up' ? 'text-green-400' :
                                row.azerbaijan.trend === 'Down' ? 'text-red-400' : 'text-blue-400'
                              }`}>
                                {row.azerbaijan.trend === 'Up' ? '↑' : row.azerbaijan.trend === 'Down' ? '↓' : '→'} {row.azerbaijan.value}
                              </span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {crossMarketData.length > 0 && crossMarketData[0].insight && (
                  <div className={`mt-4 p-3 rounded-xl ${cardInner}`}>
                    <p className={`text-sm ${textMuted}`}>
                      <strong className={textSecondary}>Insight:</strong> {crossMarketData[0].insight}
                    </p>
                  </div>
                )}
              </section>

              {/* Risk Heat Map - Enhanced */}
              <section className={`${bgCard} rounded-3xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${textPrimary}`}>Risk Overview</h2>
                    <p className={`text-xs ${textMuted}`}>Click any cell for details</p>
                  </div>
                </div>

                {/* Risk Legend */}
                <div className="flex items-center gap-4 mb-6">
                  {Object.entries(riskDescriptions).map(([level, desc]) => (
                    <button
                      key={level}
                      onClick={() => setShowRiskInfo(level as 'high' | 'medium' | 'low')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cardInner} hover:scale-105 transition-all`}
                    >
                      <div className={`w-5 h-5 rounded-lg ${desc.bg} flex items-center justify-center`}>
                        <desc.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-xs font-medium ${desc.color}`}>{desc.label}</span>
                      <Info className={`w-3 h-3 ${textMuted}`} />
                    </button>
                  ))}
                </div>

                {/* Risk Matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={`text-left text-xs font-medium ${textMuted} pb-3`}></th>
                        {countries.map(country => (
                          <th key={country} className={`text-center text-xs font-medium ${textMuted} pb-3 px-2`}>
                            {country}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {riskCategories.map(category => (
                        <tr key={category}>
                          <td className={`text-xs ${textSecondary} py-2 pr-4`}>{category}</td>
                          {countries.map(country => {
                            const risk = getRiskLevel(country, category);
                            const alert = getRiskAlert(country, category);
                            return (
                              <td key={country} className="text-center py-2 px-2">
                                <button
                                  onClick={() => setSelectedRisk({ country, category, alert })}
                                  className={`w-10 h-10 mx-auto rounded-xl transition-all hover:scale-110 cursor-pointer flex items-center justify-center ${riskDescriptions[risk].bg} ${
                                    risk !== 'low' ? 'shadow-lg' : ''
                                  } ${risk === 'high' ? 'shadow-red-500/30' : risk === 'medium' ? 'shadow-yellow-500/30' : ''}`}
                                >
                                  {React.createElement(riskDescriptions[risk].icon, { className: 'w-4 h-4 text-white' })}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Risk Stats */}
                <div className={`flex items-center justify-center gap-6 mt-6 pt-4 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-slate-100'}`}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{highRiskCount}</p>
                    <p className={`text-xs ${textMuted}`}>High Risk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{mediumRiskCount}</p>
                    <p className={`text-xs ${textMuted}`}>Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{15 - highRiskCount - mediumRiskCount}</p>
                    <p className={`text-xs ${textMuted}`}>Low</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Government Updates */}
            <section className={`${bgCard} rounded-3xl p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>Government Updates</h2>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`text-sm ${textMuted} hover:text-blue-400 flex items-center gap-1 transition-colors`}
                >
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.filter(n => n.isMinistryNews).slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${cardInner} ${bgCardHover}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        item.country === 'Georgia' ? 'bg-red-500/20 text-red-400' :
                        item.country === 'Armenia' ? 'bg-orange-500/20 text-orange-400' :
                        item.country === 'Azerbaijan' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.country}
                      </span>
                      <span className={`text-xs ${textMuted}`}>{formatTimeAgo(item.publishedAt)}</span>
                    </div>
                    <p className={`text-sm font-medium ${textPrimary} line-clamp-2`}>{item.title}</p>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`flex items-center gap-1 mt-3 text-xs text-blue-400 hover:underline`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {item.source}
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Market Overview - General for all companies */}
            <section className={`${bgCard} rounded-3xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-lg font-bold ${textPrimary}`}>Market Overview</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketData.map((market) => (
                  <div
                    key={market.country}
                    onClick={() => setSelectedMarket(market)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${cardInner} ${bgCardHover}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${textPrimary}`}>{market.country}</h3>
                      <span className={`text-xs px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-200'}`}>
                        {market.countryCode}
                      </span>
                    </div>

                    {/* All companies market share */}
                    <div className="space-y-3">
                      {market.competitors.slice(0, 4).map((c) => (
                        <div key={c.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={textSecondary}>{c.name}</span>
                            <span className={textPrimary}>{c.share}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-200'}`}>
                            <div
                              className={`h-1.5 rounded-full ${
                                c.name === 'PMI' ? 'bg-red-500' :
                                c.name === 'BAT' ? 'bg-yellow-500' :
                                c.name === 'JTI' ? 'bg-blue-500' :
                                c.name === 'Imperial' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${c.share}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-slate-200'}`}>
                      <div className="flex justify-between text-sm">
                        <span className={textMuted}>Total Volume</span>
                        <span className={textSecondary}>{(market.volume / 1000000).toFixed(1)}M units</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className={textMuted}>Tax Burden</span>
                        <span className={textSecondary}>~{taxRates.find(t => t.country === market.country)?.totalBurden || 0}%</span>
                      </div>
                    </div>

                    <a
                      href={market.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`flex items-center gap-1 mt-4 text-xs text-blue-400 hover:underline`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {market.source.name}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Regulatory Alerts</h2>
              <span className={`text-sm ${textMuted}`}>{alerts.length} total</span>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`${bgCard} rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      alert.priority === 'High' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                      alert.priority === 'Medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-400' :
                      'bg-gradient-to-br from-green-500 to-teal-500'
                    }`}>
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`font-semibold ${textPrimary}`}>{alert.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          alert.status === 'Action Required' ? 'bg-red-500/20 text-red-400' :
                          alert.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                          alert.status === 'In Review' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className={`text-sm ${textSecondary} line-clamp-2`}>{alert.summary}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className={`text-xs ${textMuted} flex items-center gap-1`}>
                          <Globe className="w-3 h-3" /> {alert.country}
                        </span>
                        <span className={`text-xs ${textMuted} flex items-center gap-1`}>
                          <FileText className="w-3 h-3" /> {alert.category}
                        </span>
                        {alert.deadline && (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {alert.deadline}
                          </span>
                        )}
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> {alert.source}
                        </a>
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 ${textMuted} flex-shrink-0`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Market Intelligence</h2>

            {/* Tax Comparison */}
            <div className={`${bgCard} rounded-3xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-6`}>Tax Burden by Country</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {taxRates.map((tax) => (
                  <div key={tax.country} className={`p-5 rounded-2xl ${cardInner}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-semibold ${textPrimary}`}>{tax.country}</h4>
                      <span className="text-2xl font-bold text-blue-400">~{tax.totalBurden}%</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={textMuted}>Excise</span>
                        <span className={textSecondary}>{tax.excisePerThousand.toLocaleString()} {tax.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>VAT</span>
                        <span className={textSecondary}>{tax.vatRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>Import Duty</span>
                        <span className={textSecondary}>{tax.importDuty}%</span>
                      </div>
                    </div>
                    {tax.nextChange && (
                      <div className="mt-4 p-3 rounded-xl bg-yellow-500/10">
                        <p className="text-xs text-yellow-400">
                          ⚠️ +{tax.nextChange.change}% effective {tax.nextChange.date}
                        </p>
                      </div>
                    )}
                    <a
                      href={tax.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 mt-4 text-xs text-blue-400 hover:underline`}
                    >
                      <ExternalLink className="w-3 h-3" /> {tax.source.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* All News */}
            <div className={`${bgCard} rounded-3xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-6`}>Industry News</h3>
              <div className="space-y-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${bgCardHover}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.isMinistryNews ? 'bg-blue-500/20' : 'bg-gray-500/20'
                      }`}>
                        {item.isMinistryNews ? <Building2 className="w-5 h-5 text-blue-400" /> : <Newspaper className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${cardInner}`}>{item.country}</span>
                          <span className={`text-xs ${textMuted}`}>{formatTimeAgo(item.publishedAt)}</span>
                        </div>
                        <p className={`font-medium ${textPrimary}`}>{item.title}</p>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-400 mt-1 inline-flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> {item.source}
                        </a>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${textMuted}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Government Contacts</h2>
              <p className={`${textMuted} mt-2`}>Key regulatory authorities and government contacts for the Caucasus region.</p>
            </div>

            {['Georgia', 'Armenia', 'Azerbaijan'].map((country) => {
              const countryContacts = contacts.filter(c => c.country === country);
              const countryColors = {
                Georgia: 'from-red-500 to-rose-600',
                Armenia: 'from-orange-500 to-amber-600',
                Azerbaijan: 'from-emerald-500 to-teal-600'
              };

              return (
                <div key={country} className={`${bgCard} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${countryColors[country as keyof typeof countryColors]} flex items-center justify-center`}>
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>{country}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {countryContacts.map((contact, idx) => (
                      <div key={idx} className={`p-4 rounded-xl ${cardInner}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            contact.status === 'Active' ? 'bg-green-500/20' :
                            contact.status === 'Pending' ? 'bg-yellow-500/20' :
                            'bg-gray-500/20'
                          }`}>
                            <Building2 className={`w-4 h-4 ${
                              contact.status === 'Active' ? 'text-green-400' :
                              contact.status === 'Pending' ? 'text-yellow-400' :
                              'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${textPrimary} text-sm`}>{contact.name}</p>
                            <p className={`text-xs ${textMuted} mt-0.5`}>{contact.organization}</p>
                            <p className={`text-xs ${textMuted}`}>{contact.department} • {contact.role}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                contact.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                                contact.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {contact.status}
                              </span>
                              <a
                                href={contact.organizationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 inline-flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> Website
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Shipment Tracking Info */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>Recent Shipment Activity</h3>
                  <p className={`text-xs ${textMuted}`}>Customs and logistics updates</p>
                </div>
              </div>

              <div className="space-y-3">
                {shipmentData.slice(0, 5).map((shipment, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${cardInner} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        shipment.status === 'Normal' ? 'bg-green-400' :
                        shipment.status === 'Under Review' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{shipment.route}</p>
                        <p className={`text-xs ${textMuted}`}>{shipment.volume.toLocaleString()} units • {shipment.deviation > 0 ? '+' : ''}{shipment.deviation.toFixed(1)}% variance</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      shipment.status === 'Normal' ? 'bg-green-500/20 text-green-400' :
                      shipment.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {shipment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sources Tab */}
        {/* Logistics Tab */}
        {activeTab === 'logistics' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Logistics & Supply Chain</h2>
              <p className={`${textMuted} mt-2`}>Port congestion, border delays, fuel prices, and transport updates.</p>
            </div>

            {/* Logistics Alerts */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Active Logistics Alerts</h3>
              <div className="space-y-3">
                {logisticsAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedLogistics(alert)}
                    className={`p-4 rounded-xl ${cardInner} cursor-pointer hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'High' ? 'bg-red-400' :
                          alert.severity === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{alert.title}</p>
                          <p className={`text-xs ${textMuted} mt-1 line-clamp-2`}>{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              alert.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                              alert.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>{alert.severity}</span>
                            <span className={`text-xs ${textMuted}`}>{alert.location}</span>
                            <span className={`text-xs ${textMuted}`}>•</span>
                            <span className={`text-xs ${textMuted}`}>{new Date(alert.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${textMuted}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Routes */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Shipment Route Status</h3>
              <div className="space-y-3">
                {shipmentData.map((shipment) => (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className={`p-4 rounded-xl ${cardInner} cursor-pointer hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className={`w-5 h-5 ${
                          shipment.status === 'Normal' ? 'text-green-400' :
                          shipment.status === 'Under Review' ? 'text-yellow-400' : 'text-red-400'
                        }`} />
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{shipment.route}</p>
                          <p className={`text-xs ${textMuted}`}>
                            {shipment.volume.toLocaleString()} units • {shipment.deviation > 0 ? '+' : ''}{shipment.deviation.toFixed(1)}% variance
                            <span className="ml-2">• {new Date(shipment.lastShipment).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          shipment.status === 'Normal' ? 'bg-green-500/20 text-green-400' :
                          shipment.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{shipment.status}</span>
                        <ChevronRight className={`w-5 h-5 ${textMuted}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geopolitical Risks */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Geopolitical Risks</h3>
              <div className="space-y-3">
                {geopoliticalRisks.map((risk) => (
                  <div
                    key={risk.id}
                    onClick={() => setSelectedGeopolitical(risk)}
                    className={`p-4 rounded-xl ${cardInner} cursor-pointer hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className={`w-5 h-5 mt-0.5 ${
                        risk.severity === 'High' ? 'text-red-400' :
                        risk.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${textPrimary}`}>{risk.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            risk.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                            risk.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>{risk.severity}</span>
                        </div>
                        <p className={`text-sm ${textMuted} mt-1 line-clamp-2`}>{risk.description}</p>
                        <p className={`text-xs ${textMuted} mt-2`}>{new Date(risk.date).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${textMuted}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Competitor Intelligence</h2>
              <p className={`${textMuted} mt-2`}>Price changes, promotions, new products, and trade incentives.</p>
            </div>

            {/* Competitor Actions */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Recent Competitor Actions</h3>
              <div className="space-y-3">
                {competitorActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => setSelectedCompetitor(action)}
                    className={`p-4 rounded-xl ${cardInner} cursor-pointer hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          action.priority === 'High' ? 'bg-red-500/20' :
                          action.priority === 'Medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                        }`}>
                          <Target className={`w-5 h-5 ${
                            action.priority === 'High' ? 'text-red-400' :
                            action.priority === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              action.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>{action.priority}</span>
                            <span className={`text-xs ${textMuted}`}>{action.country} • {action.actionType}</span>
                            <span className={`text-xs ${textMuted}`}>•</span>
                            <span className={`text-xs ${textMuted}`}>{new Date(action.date).toLocaleDateString()}</span>
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{action.title}</p>
                          <p className={`text-sm ${textMuted} mt-1 line-clamp-2`}>{action.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${textMuted} flex-shrink-0`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retail Updates */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Retail & Trade Environment</h3>
              <div className="space-y-3">
                {retailUpdates.map((update) => (
                  <div
                    key={update.id}
                    onClick={() => setSelectedRetail(update)}
                    className={`p-4 rounded-xl ${cardInner} cursor-pointer hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <ShoppingCart className={`w-5 h-5 mt-0.5 ${
                          update.impact === 'High' ? 'text-red-400' :
                          update.impact === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${cardInner}`}>{update.type}</span>
                            <span className={`text-xs ${textMuted}`}>{update.country}</span>
                            <span className={`text-xs ${textMuted}`}>•</span>
                            <span className={`text-xs ${textMuted}`}>{new Date(update.date).toLocaleDateString()}</span>
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{update.title}</p>
                          <p className={`text-sm ${textMuted} mt-1 line-clamp-2`}>{update.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${textMuted} flex-shrink-0`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consumer Trends */}
            <div className={`${bgCard} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Consumer Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consumerTrends.map((trend) => (
                  <a
                    key={trend.id}
                    href={trend.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-xl ${cardInner} hover:scale-[1.02] transition-all block`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {trend.trend === 'Up' ? <TrendingUp className="w-4 h-4 text-green-400" /> :
                         trend.trend === 'Down' ? <TrendingDown className="w-4 h-4 text-red-400" /> :
                         <Activity className="w-4 h-4 text-blue-400" />}
                        <span className={`text-xs px-2 py-0.5 rounded ${cardInner}`}>{trend.category}</span>
                        <span className={`text-xs ${textMuted}`}>{trend.country}</span>
                      </div>
                      <span className={`text-xs ${textMuted}`}>{new Date(trend.date).toLocaleDateString()}</span>
                    </div>
                    <p className={`font-medium ${textPrimary} text-sm`}>{trend.title}</p>
                    <p className={`text-xs ${textMuted} mt-1 line-clamp-2`}>{trend.description}</p>
                    {trend.change && (
                      <p className={`text-sm font-medium mt-2 ${
                        trend.trend === 'Up' ? 'text-green-400' :
                        trend.trend === 'Down' ? 'text-red-400' : 'text-blue-400'
                      }`}>{trend.change}</p>
                    )}
                    <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {trend.source}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Data Sources</h2>
              <p className={`${textMuted} mt-2`}>All data is aggregated from official government and verified sources.</p>
            </div>

            {/* Live RSS Feeds Section */}
            {liveFeeds && liveFeeds.sources.length > 0 && (
              <div className={`${bgCard} rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>Live RSS Feeds</h3>
                  </div>
                  <span className={`text-xs ${textMuted}`}>
                    Updated: {new Date(liveFeeds.lastUpdated).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm ${textMuted} mb-4`}>
                  Real-time news aggregated from {liveFeeds.totalItems} articles across {liveFeeds.sources.length} sources.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {liveFeeds.sources.map((source, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-xl ${cardInner} text-center`}
                    >
                      <p className={`text-sm font-medium ${textPrimary}`}>{source.name}</p>
                      <p className={`text-xs ${textMuted}`}>{source.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(DATA_SOURCES).map(([key, source]) => (
                <a
                  key={key}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${bgCard} rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${textPrimary}`}>{source.name}</h3>
                      <p className={`text-sm ${textMuted} mt-1`}>{source.description}</p>
                      <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {source.url}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {lastUpdate && (
              <p className={`text-center ${textMuted} text-sm`}>
                Data last refreshed: {lastUpdate.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </main>

      {/* Alert Modal */}
      <Modal isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="" theme={theme}>
        {selectedAlert && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`text-sm px-3 py-1 rounded-xl ${
                  selectedAlert.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                  selectedAlert.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {selectedAlert.priority} Priority
                </span>
                <span className={`text-sm ${textMuted}`}>{selectedAlert.country} • {selectedAlert.category}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedAlert.title}</h2>
            </div>

            {selectedAlert.deadline && (
              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                <p className="text-yellow-500 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4" />
                  Deadline: {selectedAlert.deadline} ({getDaysUntil(selectedAlert.deadline)} days)
                </p>
              </div>
            )}

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Summary</h4>
              <p className={textSecondary}>{selectedAlert.fullDescription}</p>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Impact Assessment</h4>
              <p className={textSecondary}>{selectedAlert.impactAssessment}</p>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-3`}>Recommended Actions</h4>
              <div className="space-y-2">
                {selectedAlert.recommendedActions.map((action, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${cardInner}`}>
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${textSecondary}`}>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-slate-100'}`}>
              <h4 className={`text-sm font-semibold ${textMuted} mb-3`}>Source</h4>
              <a
                href={selectedAlert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-4 rounded-2xl ${cardInner} ${bgCardHover} transition-colors`}
              >
                <Building2 className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className={`font-medium ${textPrimary}`}>{selectedAlert.source}</p>
                  <p className={`text-xs ${textMuted}`}>{selectedAlert.sourceUrl}</p>
                </div>
                <ExternalLink className={`w-4 h-4 ${textMuted}`} />
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* News Modal */}
      <Modal isOpen={!!selectedNews} onClose={() => setSelectedNews(null)} title="" theme={theme}>
        {selectedNews && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  selectedNews.country === 'Georgia' ? 'bg-red-500/20 text-red-400' :
                  selectedNews.country === 'Armenia' ? 'bg-orange-500/20 text-orange-400' :
                  selectedNews.country === 'Azerbaijan' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedNews.country}
                </span>
                <span className={`text-xs ${textMuted}`}>{selectedNews.category}</span>
                <span className={`text-xs ${textMuted}`}>{formatTimeAgo(selectedNews.publishedAt)}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedNews.title}</h2>
            </div>

            <p className={textSecondary}>{selectedNews.description}</p>

            <a
              href={selectedNews.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-colors"
            >
              <Building2 className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-400">{selectedNews.source}</p>
                <p className={`text-xs ${textMuted}`}>Visit official source</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </a>
          </div>
        )}
      </Modal>

      {/* Market Modal */}
      <Modal isOpen={!!selectedMarket} onClose={() => setSelectedMarket(null)} title={`${selectedMarket?.country || ''} Market`} theme={theme}>
        {selectedMarket && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Total Volume</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{(selectedMarket.volume / 1000000).toFixed(1)}M</p>
                <p className={`text-xs ${textMuted}`}>units</p>
              </div>
              <div className={`p-4 rounded-2xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Tax Burden</p>
                <p className={`text-2xl font-bold text-blue-400`}>~{taxRates.find(t => t.country === selectedMarket.country)?.totalBurden || 0}%</p>
                <p className={`text-xs ${textMuted}`}>total</p>
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-3`}>Market Share by Company</h4>
              <div className="space-y-3">
                {selectedMarket.competitors.map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textSecondary}>{c.name}</span>
                      <span className={`font-medium ${textPrimary}`}>{c.share}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-200'}`}>
                      <div
                        className={`h-2 rounded-full ${
                          c.name === 'PMI' ? 'bg-red-500' :
                          c.name === 'BAT' ? 'bg-yellow-500' :
                          c.name === 'JTI' ? 'bg-blue-500' :
                          c.name === 'Imperial' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${c.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Market Insights</h4>
              <p className={textSecondary}>{selectedMarket.marketInsights}</p>
            </div>

            <a
              href={selectedMarket.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 rounded-2xl ${cardInner} ${bgCardHover} transition-colors`}
            >
              <Globe className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className={`font-medium ${textPrimary}`}>{selectedMarket.source.name}</p>
                <p className={`text-xs ${textMuted}`}>{selectedMarket.source.url}</p>
              </div>
              <ExternalLink className={`w-4 h-4 ${textMuted}`} />
            </a>
          </div>
        )}
      </Modal>

      {/* Risk Detail Modal */}
      <Modal
        isOpen={!!selectedRisk}
        onClose={() => setSelectedRisk(null)}
        title={`${selectedRisk?.country || ''} - ${selectedRisk?.category || ''}`}
        theme={theme}
      >
        {selectedRisk && (
          <div className="space-y-6">
            {(() => {
              const level = getRiskLevel(selectedRisk.country, selectedRisk.category);
              const desc = riskDescriptions[level];
              return (
                <>
                  <div className={`p-4 rounded-2xl ${
                    level === 'high' ? 'bg-red-500/10' :
                    level === 'medium' ? 'bg-yellow-500/10' :
                    cardInner
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl ${desc.bg} flex items-center justify-center`}>
                        {React.createElement(desc.icon, { className: 'w-5 h-5 text-white' })}
                      </div>
                      <div>
                        <p className={`font-semibold ${desc.color}`}>{desc.label}</p>
                        <p className={`text-xs ${textMuted}`}>{selectedRisk.country} • {selectedRisk.category}</p>
                      </div>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-3`}>{desc.description}</p>
                  </div>

                  {selectedRisk.alert ? (
                    <>
                      <div>
                        <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Active Alert</h4>
                        <div
                          onClick={() => {
                            setSelectedAlert(selectedRisk.alert);
                            setSelectedRisk(null);
                          }}
                          className={`p-4 rounded-2xl cursor-pointer ${cardInner} ${bgCardHover}`}
                        >
                          <p className={`font-medium ${textPrimary}`}>{selectedRisk.alert.title}</p>
                          <p className={`text-sm ${textSecondary} mt-2`}>{selectedRisk.alert.summary}</p>
                          {selectedRisk.alert.deadline && (
                            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Deadline: {selectedRisk.alert.deadline}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={selectedRisk.alert.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-4 rounded-2xl ${cardInner} ${bgCardHover} transition-colors`}
                      >
                        <Building2 className="w-5 h-5 text-blue-400" />
                        <div className="flex-1">
                          <p className={`font-medium ${textPrimary}`}>{selectedRisk.alert.source}</p>
                          <p className={`text-xs ${textMuted}`}>View source</p>
                        </div>
                        <ExternalLink className={`w-4 h-4 ${textMuted}`} />
                      </a>
                    </>
                  ) : (
                    <div className={`p-4 rounded-2xl ${cardInner} text-center`}>
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                      <p className={textPrimary}>No active regulatory concerns</p>
                      <p className={`text-sm ${textMuted} mt-1`}>Continue routine monitoring</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Competitor Action Modal */}
      <Modal isOpen={!!selectedCompetitor} onClose={() => setSelectedCompetitor(null)} title="Competitor Intelligence" theme={theme}>
        {selectedCompetitor && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm px-3 py-1 rounded-xl ${
                  selectedCompetitor.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                  selectedCompetitor.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>{selectedCompetitor.priority} Priority</span>
                <span className={`text-sm ${textMuted}`}>{selectedCompetitor.country} • {selectedCompetitor.actionType}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedCompetitor.title}</h2>
              <p className={`text-xs ${textMuted} mt-2`}>{new Date(selectedCompetitor.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Competitor</h4>
              <div className={`p-3 rounded-xl ${cardInner} flex items-center gap-3`}>
                <Target className="w-5 h-5 text-blue-400" />
                <span className={textPrimary}>{selectedCompetitor.competitor}</span>
                {selectedCompetitor.competitorUrl && (
                  <a href={selectedCompetitor.competitorUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 ml-auto flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Website
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Description</h4>
              <p className={textSecondary}>{selectedCompetitor.description}</p>
            </div>

            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
              <h4 className={`text-sm font-semibold text-orange-400 mb-2`}>Business Impact</h4>
              <p className={textSecondary}>{selectedCompetitor.impact}</p>
            </div>

            <a
              href={selectedCompetitor.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-colors"
            >
              <Newspaper className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-400">View Source</p>
                <p className={`text-xs ${textMuted}`}>{selectedCompetitor.source}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </a>
          </div>
        )}
      </Modal>

      {/* Logistics Alert Modal */}
      <Modal isOpen={!!selectedLogistics} onClose={() => setSelectedLogistics(null)} title="Logistics Alert" theme={theme}>
        {selectedLogistics && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm px-3 py-1 rounded-xl ${
                  selectedLogistics.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                  selectedLogistics.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>{selectedLogistics.severity} Severity</span>
                <span className={`text-sm ${textMuted}`}>{selectedLogistics.type}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedLogistics.title}</h2>
              <p className={`text-xs ${textMuted} mt-2`}>{new Date(selectedLogistics.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div className={`p-3 rounded-xl ${cardInner} flex items-center gap-3`}>
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <p className={`font-medium ${textPrimary}`}>{selectedLogistics.location}</p>
                <p className={`text-xs ${textMuted}`}>{selectedLogistics.country}</p>
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Description</h4>
              <p className={textSecondary}>{selectedLogistics.description}</p>
            </div>

            {selectedLogistics.estimatedDelay && (
              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                <p className="text-yellow-500 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4" />
                  Estimated Delay: {selectedLogistics.estimatedDelay}
                </p>
              </div>
            )}

            {selectedLogistics.affectedRoutes.length > 0 && (
              <div>
                <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Affected Routes</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLogistics.affectedRoutes.map((route, idx) => (
                    <span key={idx} className={`text-xs px-3 py-1 rounded-lg ${cardInner}`}>{route}</span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={selectedLogistics.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-colors"
            >
              <Newspaper className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-400">View Source</p>
                <p className={`text-xs ${textMuted}`}>{selectedLogistics.source}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </a>
          </div>
        )}
      </Modal>

      {/* Retail Update Modal */}
      <Modal isOpen={!!selectedRetail} onClose={() => setSelectedRetail(null)} title="Retail & Trade Update" theme={theme}>
        {selectedRetail && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm px-3 py-1 rounded-xl ${
                  selectedRetail.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                  selectedRetail.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>{selectedRetail.impact} Impact</span>
                <span className={`text-sm px-3 py-1 rounded-xl ${cardInner}`}>{selectedRetail.type}</span>
                <span className={`text-sm ${textMuted}`}>{selectedRetail.country}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedRetail.title}</h2>
              <p className={`text-xs ${textMuted} mt-2`}>{new Date(selectedRetail.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Description</h4>
              <p className={textSecondary}>{selectedRetail.description}</p>
            </div>

            <a
              href={selectedRetail.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-colors"
            >
              <Newspaper className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-400">View Source</p>
                <p className={`text-xs ${textMuted}`}>{selectedRetail.source}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </a>
          </div>
        )}
      </Modal>

      {/* Geopolitical Risk Modal */}
      <Modal isOpen={!!selectedGeopolitical} onClose={() => setSelectedGeopolitical(null)} title="Geopolitical Risk" theme={theme}>
        {selectedGeopolitical && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm px-3 py-1 rounded-xl ${
                  selectedGeopolitical.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                  selectedGeopolitical.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>{selectedGeopolitical.severity} Severity</span>
                <span className={`text-sm px-3 py-1 rounded-xl ${cardInner}`}>{selectedGeopolitical.riskType}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedGeopolitical.title}</h2>
              <p className={`text-xs ${textMuted} mt-2`}>{new Date(selectedGeopolitical.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div className={`p-3 rounded-xl ${cardInner}`}>
              <p className={`text-sm ${textMuted} mb-1`}>Affected Region</p>
              <p className={textPrimary}>{selectedGeopolitical.region}</p>
              <div className="flex gap-2 mt-2">
                {selectedGeopolitical.countries.map((c) => (
                  <span key={c} className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                    {c === 'Georgia' ? '🇬🇪' : c === 'Armenia' ? '🇦🇲' : '🇦🇿'} {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Description</h4>
              <p className={textSecondary}>{selectedGeopolitical.description}</p>
            </div>

            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
              <h4 className={`text-sm font-semibold text-orange-400 mb-2`}>Business Impact</h4>
              <p className={textSecondary}>{selectedGeopolitical.businessImpact}</p>
            </div>

            <a
              href={selectedGeopolitical.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 transition-colors"
            >
              <Newspaper className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-400">View Source</p>
                <p className={`text-xs ${textMuted}`}>{selectedGeopolitical.source}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </a>
          </div>
        )}
      </Modal>

      {/* Shipment Detail Modal */}
      <Modal isOpen={!!selectedShipment} onClose={() => setSelectedShipment(null)} title="Shipment Details" theme={theme}>
        {selectedShipment && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm px-3 py-1 rounded-xl ${
                  selectedShipment.status === 'Normal' ? 'bg-green-500/20 text-green-400' :
                  selectedShipment.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>{selectedShipment.status}</span>
                <span className={`text-sm ${textMuted}`}>Ref: {selectedShipment.customsRef}</span>
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>{selectedShipment.route}</h2>
              <p className={`text-xs ${textMuted} mt-2`}>Last shipment: {new Date(selectedShipment.lastShipment).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Origin</p>
                <p className={`font-medium ${textPrimary}`}>{selectedShipment.origin}</p>
              </div>
              <div className={`p-4 rounded-xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Destination</p>
                <p className={`font-medium ${textPrimary}`}>{selectedShipment.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Actual Volume</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{selectedShipment.volume.toLocaleString()}</p>
                <p className={`text-xs ${textMuted}`}>units</p>
              </div>
              <div className={`p-4 rounded-xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Expected Volume</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{selectedShipment.expectedVolume.toLocaleString()}</p>
                <p className={`text-xs ${textMuted}`}>units</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${
              selectedShipment.status === 'Normal' ? 'bg-green-500/10' :
              selectedShipment.status === 'Under Review' ? 'bg-yellow-500/10' :
              'bg-red-500/10'
            }`}>
              <div className="flex items-center justify-between">
                <span className={textMuted}>Variance</span>
                <span className={`text-lg font-bold ${
                  Math.abs(selectedShipment.deviation) < 5 ? 'text-green-400' :
                  Math.abs(selectedShipment.deviation) < 10 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>{selectedShipment.deviation > 0 ? '+' : ''}{selectedShipment.deviation.toFixed(1)}%</span>
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${textMuted} mb-2`}>Details</h4>
              <p className={textSecondary}>{selectedShipment.details}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Excise Paid</p>
                <p className={`font-medium ${textPrimary}`}>{selectedShipment.excisePaid.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-xl ${cardInner}`}>
                <p className={`text-xs ${textMuted}`}>Excise Expected</p>
                <p className={`font-medium ${textPrimary}`}>{selectedShipment.exciseExpected.toLocaleString()}</p>
              </div>
            </div>

            <a
              href={selectedShipment.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 rounded-2xl ${cardInner} ${bgCardHover} transition-colors`}
            >
              <Building2 className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className={`font-medium ${textPrimary}`}>{selectedShipment.source.name}</p>
                <p className={`text-xs ${textMuted}`}>View customs data</p>
              </div>
              <ExternalLink className={`w-4 h-4 ${textMuted}`} />
            </a>
          </div>
        )}
      </Modal>

      {/* Risk Info Modal */}
      <Modal isOpen={!!showRiskInfo} onClose={() => setShowRiskInfo(null)} title="Risk Level Information" theme={theme}>
        {showRiskInfo && (
          <div className="space-y-4">
            {Object.entries(riskDescriptions).map(([level, desc]) => (
              <div key={level} className={`p-4 rounded-2xl ${showRiskInfo === level ? desc.bg.replace('bg-gradient-to-br', 'bg-opacity-20') : cardInner}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${desc.bg} flex items-center justify-center`}>
                    <desc.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold ${desc.color}`}>{desc.label}</p>
                  </div>
                </div>
                <p className={`text-sm ${textSecondary}`}>{desc.description}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
