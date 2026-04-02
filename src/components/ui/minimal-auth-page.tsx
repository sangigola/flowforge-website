'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2, User, Bot, Home, MessageSquare, Plus, Menu, ChevronLeft, Globe, Briefcase } from 'lucide-react';
import { Particles } from '@/components/ui/particles';
import { AIChatInput } from '@/components/ui/ai-chat-input';
import { VerticalTabs } from '@/components/ui/vertical-tabs';
import { getOrCreateSessionId } from '@/lib/fingerprint';

type ModalType = 'google' | 'github' | 'signin' | null;
type Language = 'en' | 'ka';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatHistoryItem {
    id: string;
    title: string;
    lastActive: string;
    messageCount: number;
}

const translations = {
    en: {
        signIn: 'Sign In',
        signInOrJoin: 'Sign In or Join Now!',
        loginOrCreate: 'Login or create your Flowforge account.',
        continueGoogle: 'Continue with Google',
        continueGithub: 'Continue with GitHub',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        byClicking: 'By clicking continue, you agree to our',
        and: 'and',
        home: 'Home',
        services: 'Services',
        newChat: 'New Chat',
        chatHistory: 'Chat History',
        noPreviousChats: 'No previous chats',
        gmailAddress: 'Gmail Address',
        githubUsername: 'GitHub Username',
        phoneNumber: 'Phone Number',
        send: 'Send',
        sending: 'Sending...',
    },
    ka: {
        signIn: 'შესვლა',
        signInOrJoin: 'შესვლა ან რეგისტრაცია!',
        loginOrCreate: 'შედით ან შექმენით Flowforge ანგარიში.',
        continueGoogle: 'გაგრძელება Google-ით',
        continueGithub: 'გაგრძელება GitHub-ით',
        terms: 'მომსახურების პირობები',
        privacy: 'კონფიდენციალურობის პოლიტიკა',
        byClicking: 'გაგრძელებაზე დაწკაპუნებით თქვენ ეთანხმებით ჩვენს',
        and: 'და',
        home: 'მთავარი',
        services: 'სერვისები',
        newChat: 'ახალი ჩატი',
        chatHistory: 'ჩატის ისტორია',
        noPreviousChats: 'წინა ჩატები არ არის',
        gmailAddress: 'Gmail მისამართი',
        githubUsername: 'GitHub მომხმარებელი',
        phoneNumber: 'ტელეფონის ნომერი',
        send: 'გაგზავნა',
        sending: 'იგზავნება...',
    }
};

export function MinimalAuthPage() {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        phone: '',
    });
    const [language, setLanguage] = useState<Language>('en');

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatStarted, setChatStarted] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [focusTrigger, setFocusTrigger] = useState(0);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const t = translations[language];

    // Load language preference
    useEffect(() => {
        const savedLang = localStorage.getItem('flowforge_language') as Language;
        if (savedLang) setLanguage(savedLang);
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ka' : 'en';
        setLanguage(newLang);
        localStorage.setItem('flowforge_language', newLang);
    };

    // Initialize session
    useEffect(() => {
        const initSession = async () => {
            try {
                const id = await getOrCreateSessionId();
                setVisitorId(id);
                await loadChatHistory(id);

                const storedSessionId = localStorage.getItem('flowforge_current_session');
                if (storedSessionId) {
                    setSessionId(storedSessionId);
                    await loadSessionMessages(storedSessionId);
                }
            } catch (error) {
                console.error('Error initializing session:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        initSession();
    }, []);

    const loadChatHistory = async (visitorId: string) => {
        try {
            const response = await fetch(`/api/agent/sessions?visitorId=${visitorId}`);
            if (response.ok) {
                const data = await response.json();
                setChatHistory(data.sessions || []);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const loadSessionMessages = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/agent/history?sessionId=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages.map((m: { role: string; content: string }) => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content
                    })));
                    setChatStarted(true);
                } else {
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error loading session messages:', error);
        }
    };

    const startNewChat = () => {
        if (!visitorId) return;
        const newSessionId = `${visitorId}_${Date.now()}`;
        setSessionId(newSessionId);
        localStorage.setItem('flowforge_current_session', newSessionId);
        setMessages([]);
        setChatStarted(false);
    };

    const selectChat = async (chatId: string) => {
        setSessionId(chatId);
        localStorage.setItem('flowforge_current_session', chatId);
        await loadSessionMessages(chatId);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAiTyping]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeModal,
                    ...(activeModal === 'google'
                        ? { email: formData.email, phone: formData.phone }
                        : { username: formData.username, phone: formData.phone }
                    ),
                }),
            });

            if (response.ok) {
                setActiveModal(null);
                setFormData({ email: '', username: '', phone: '' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setFormData({ email: '', username: '', phone: '' });
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !visitorId) return;

        let currentSessionId = sessionId;
        if (!currentSessionId) {
            currentSessionId = `${visitorId}_${Date.now()}`;
            setSessionId(currentSessionId);
            localStorage.setItem('flowforge_current_session', currentSessionId);
        }

        if (!chatStarted) {
            setChatStarted(true);
        }

        const newMessages: Message[] = [...messages, { role: 'user', content: message }];
        setMessages(newMessages);
        setIsAiTyping(true);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sessionId: currentSessionId, visitorId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            setMessages([...newMessages, { role: 'assistant', content: data.message }]);
            await loadChatHistory(visitorId);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessages([...newMessages, {
                role: 'assistant',
                content: errorMessage.includes('busy') || errorMessage.includes('try again')
                    ? errorMessage
                    : 'I apologize, but I\'m having trouble connecting right now. Please try again or contact us at contact@flowforge.systems for assistance.'
            }]);
        }

        setIsAiTyping(false);
        setFocusTrigger(prev => prev + 1);
    };

    const handleGoHome = () => {
        setChatStarted(false);
        setMessages([]);
        setSessionId(null);
        localStorage.removeItem('flowforge_current_session');
        setActiveModal(null);
    };

    if (isLoadingHistory) {
        return (
            <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <Particles color="#666666" quantity={120} ease={20} className="absolute inset-0 pointer-events-none" />
                <div className="flex items-center gap-3 text-zinc-400">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex overflow-hidden">
            <Particles color="#666666" quantity={120} ease={20} className="absolute inset-0 pointer-events-none" />

            {/* Mobile menu toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-800 rounded-lg border border-zinc-700"
            >
                {sidebarOpen ? <ChevronLeft className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Left Sidebar - Always Visible */}
            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-72 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300`}>
                {/* Logo */}
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <FlowforgeIcon className="size-6" />
                        <span className="text-lg font-semibold">Flowforge</span>
                    </div>
                </div>

                {/* Language Toggle */}
                <div className="p-3 border-b border-zinc-800">
                    <Button
                        onClick={toggleLanguage}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 bg-transparent border-zinc-700 hover:bg-zinc-800"
                    >
                        <Globe className="size-4" />
                        {language === 'en' ? 'ქართული' : 'English'}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-3 border-b border-zinc-800">
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={handleGoHome}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${!chatStarted ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
                            >
                                <Home className="size-4" />
                                <span>{t.home}</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleGoHome}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
                            >
                                <Briefcase className="size-4" />
                                <span>{t.services}</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* New Chat Button */}
                <div className="p-3">
                    <Button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                    >
                        <Plus className="size-4" />
                        {t.newChat}
                    </Button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-2">{t.chatHistory}</p>
                    <ul className="space-y-1">
                        {chatHistory.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-zinc-500">{t.noPreviousChats}</li>
                        ) : (
                            chatHistory.map((chat) => (
                                <li key={chat.id}>
                                    <button
                                        onClick={() => selectChat(chat.id)}
                                        className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                            sessionId === chat.id && chatStarted
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                        }`}
                                    >
                                        <MessageSquare className="size-4 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm truncate">{chat.title}</span>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Sign In Button */}
                <div className="p-3 border-t border-zinc-800">
                    <Button
                        onClick={() => setActiveModal('signin')}
                        variant="outline"
                        className="w-full bg-transparent border-zinc-700 hover:bg-zinc-800"
                    >
                        {t.signIn}
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ==================== HOME VIEW (Services Slideshow) ==================== */}
                {!chatStarted && (
                    <div className="flex-1 flex flex-col px-4 pb-8 pt-16 lg:pt-6 overflow-y-auto">
                        {/* Two Column Layout */}
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto w-full">
                            {/* Left: Services Slideshow */}
                            <div className="order-2 lg:order-1">
                                <VerticalTabs />
                            </div>

                            {/* Right: Auth Section */}
                            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                                <div className="w-full max-w-sm space-y-4">
                                    <div className="flex flex-col space-y-1">
                                        <h1 className="font-heading text-2xl font-bold tracking-wide">
                                            {t.signInOrJoin}
                                        </h1>
                                        <p className="text-muted-foreground text-base">
                                            {t.loginOrCreate}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Button type="button" size="lg" className="w-full" onClick={() => setActiveModal('google')}>
                                            <GoogleIcon className="me-2 size-4" />
                                            {t.continueGoogle}
                                        </Button>
                                        <Button type="button" size="lg" className="w-full" onClick={() => setActiveModal('github')}>
                                            <GitHubIcon className="me-2 size-4" />
                                            {t.continueGithub}
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground mt-8 text-sm">
                                        {t.byClicking}{' '}
                                        <a href="/terms" className="hover:text-primary underline underline-offset-4">{t.terms}</a>{' '}
                                        {t.and}{' '}
                                        <a href="/privacy" className="hover:text-primary underline underline-offset-4">{t.privacy}</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== CHAT VIEW ==================== */}
                {chatStarted && (
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 flex flex-col">
                        <div className="flex-1" />
                        <div className="max-w-3xl mx-auto w-full space-y-4 pb-4 pt-16 lg:pt-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {message.role === 'assistant' && (
                                        <div className="flex-shrink-0 size-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <Bot className="size-4 text-zinc-300" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-100'}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="flex-shrink-0 size-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                            <User className="size-4 text-zinc-300" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isAiTyping && (
                                <div className="flex gap-3 justify-start">
                                    <div className="flex-shrink-0 size-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Bot className="size-4 text-zinc-300" />
                                    </div>
                                    <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className="size-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="size-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="size-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

                {/* Chat Input - Always at Bottom */}
                <div className="relative w-full pb-8 px-4">
                    <div className="max-w-3xl mx-auto">
                        <AIChatInput onSendMessage={handleSendMessage} disabled={isAiTyping} focusTrigger={focusTrigger} />
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sign In Modal */}
            {activeModal === 'signin' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
                            <X className="size-5" />
                        </button>
                        <div className="flex items-center gap-2 mb-6">
                            <FlowforgeIcon className="size-6" />
                            <h2 className="text-xl font-semibold">{t.signInOrJoin}</h2>
                        </div>
                        <p className="text-zinc-400 text-sm mb-6">{t.loginOrCreate}</p>
                        <div className="space-y-2">
                            <Button type="button" size="lg" className="w-full" onClick={() => setActiveModal('google')}>
                                <GoogleIcon className="me-2 size-4" />
                                {t.continueGoogle}
                            </Button>
                            <Button type="button" size="lg" className="w-full" onClick={() => setActiveModal('github')}>
                                <GitHubIcon className="me-2 size-4" />
                                {t.continueGithub}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Google/GitHub Form Modal */}
            {(activeModal === 'google' || activeModal === 'github') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
                            <X className="size-5" />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            {activeModal === 'google' ? <GoogleIcon className="size-6" /> : <GitHubIcon className="size-6" />}
                            <h2 className="text-xl font-semibold">{activeModal === 'google' ? t.continueGoogle : t.continueGithub}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeModal === 'google' ? (
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">{t.gmailAddress}</label>
                                    <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium mb-2">{t.githubUsername}</label>
                                    <input type="text" id="username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                                </div>
                            )}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-2">{t.phoneNumber}</label>
                                <input type="tel" id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                            </div>
                            <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="me-2 size-4 animate-spin" />{t.sending}</> : t.send}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const FlowforgeIcon = (props: React.ComponentProps<'svg'>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M8 12h8" /><path d="M6 17h12" /><circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </svg>
);

const GitHubIcon = (props: React.ComponentProps<'svg'>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);
