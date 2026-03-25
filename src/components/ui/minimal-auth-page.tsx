'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2, User, Bot, Home } from 'lucide-react';
import { Particles } from '@/components/ui/particles';
import { AIChatInput } from '@/components/ui/ai-chat-input';

type ModalType = 'google' | 'github' | 'signin' | null;

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function MinimalAuthPage() {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        phone: '',
    });

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatStarted, setChatStarted] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [focusTrigger, setFocusTrigger] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
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
        if (!message.trim()) return;

        // Start chat mode
        if (!chatStarted) {
            setChatStarted(true);
        }

        // Add user message
        const newMessages: Message[] = [...messages, { role: 'user', content: message }];
        setMessages(newMessages);
        setIsAiTyping(true);

        try {
            // Call the AI chat API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setMessages([...newMessages, {
                role: 'assistant',
                content: data.message
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            // Fallback message if API fails
            setMessages([...newMessages, {
                role: 'assistant',
                content: 'I apologize, but I\'m having trouble connecting right now. Please try again or contact us at contact@flowforge.systems for assistance.'
            }]);
        }

        setIsAiTyping(false);
        setFocusTrigger(prev => prev + 1);
    };

    const handleGoHome = () => {
        setChatStarted(false);
        setMessages([]);
        setActiveModal(null);
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
            <Particles
                color="#666666"
                quantity={120}
                ease={20}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Sign In Button - Top Right (when chat is active) */}
            {chatStarted && (
                <div className="fixed top-4 right-4 z-40">
                    <Button
                        onClick={() => setActiveModal('signin')}
                        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 shadow-lg"
                    >
                        <FlowforgeIcon className="size-4" />
                        Sign In
                    </Button>
                </div>
            )}

            {/* Home Button - Bottom Right aligned with chat input (when chat is active) */}
            {chatStarted && (
                <div className="fixed bottom-10 right-4 z-40">
                    <Button
                        onClick={handleGoHome}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 shadow-lg"
                    >
                        <Home className="size-4" />
                        Home
                    </Button>
                </div>
            )}

            {/* Auth Section - Centered (only when chat not started) */}
            {!chatStarted && (
                <div className="relative flex-1 flex flex-col justify-center items-center px-4 pb-8" style={{ paddingTop: '8vh' }}>
                    <div className="w-full max-w-sm space-y-4 -mt-16">
                        <div className="flex items-center gap-2">
                            <FlowforgeIcon className="size-6" />
                            <p className="text-xl font-semibold">Flowforge.systems</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <h1 className="font-heading text-2xl font-bold tracking-wide">
                                Sign In or Join Now!
                            </h1>
                            <p className="text-muted-foreground text-base">
                                Login or create your Flowforge account.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Button
                                type="button"
                                size="lg"
                                className="w-full"
                                onClick={() => setActiveModal('google')}
                            >
                                <GoogleIcon className="me-2 size-4" />
                                Continue with Google
                            </Button>
                            <Button
                                type="button"
                                size="lg"
                                className="w-full"
                                onClick={() => setActiveModal('github')}
                            >
                                <GitHubIcon className="me-2 size-4" />
                                Continue with GitHub
                            </Button>
                        </div>
                        <p className="text-muted-foreground mt-8 text-sm">
                            By clicking continue, you agree to our{' '}
                            <a
                                href="/terms"
                                className="hover:text-primary underline underline-offset-4"
                            >
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a
                                href="/privacy"
                                className="hover:text-primary underline underline-offset-4"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
            )}

            {/* Chat Messages Area - Messages grow from bottom */}
            {chatStarted && (
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-4 flex flex-col"
                >
                    <div className="flex-1" /> {/* Spacer to push messages to bottom */}
                    <div className="max-w-3xl mx-auto w-full space-y-4 pb-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex-shrink-0 size-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Bot className="size-4 text-zinc-300" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'bg-white text-black'
                                            : 'bg-zinc-800 text-zinc-100'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <div className="flex-shrink-0 size-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                        <User className="size-4 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* AI Typing Indicator */}
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

            {/* Chat Input Section */}
            <div className="relative w-full pb-8">
                <AIChatInput onSendMessage={handleSendMessage} disabled={isAiTyping} focusTrigger={focusTrigger} />
            </div>

            {/* Modal Overlay - For Sign In (popup in center) */}
            {(activeModal === 'signin' || activeModal === 'google' || activeModal === 'github') && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="relative w-full max-w-md mx-4 bg-background border border-border rounded-lg shadow-xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="size-5" />
                        </button>

                        {activeModal === 'signin' ? (
                            // Sign In Options Modal
                            <>
                                <div className="flex items-center gap-2 mb-6">
                                    <FlowforgeIcon className="size-6" />
                                    <h2 className="text-xl font-semibold">Sign In or Join Now!</h2>
                                </div>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Login or create your Flowforge account.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        type="button"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => setActiveModal('google')}
                                    >
                                        <GoogleIcon className="me-2 size-4" />
                                        Continue with Google
                                    </Button>
                                    <Button
                                        type="button"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => setActiveModal('github')}
                                    >
                                        <GitHubIcon className="me-2 size-4" />
                                        Continue with GitHub
                                    </Button>
                                </div>
                                <p className="text-muted-foreground mt-6 text-sm">
                                    By clicking continue, you agree to our{' '}
                                    <a href="/terms" className="hover:text-primary underline underline-offset-4">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="/privacy" className="hover:text-primary underline underline-offset-4">
                                        Privacy Policy
                                    </a>
                                    .
                                </p>
                            </>
                        ) : (
                            // Google/GitHub Form Modal
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    {activeModal === 'google' ? (
                                        <GoogleIcon className="size-6" />
                                    ) : (
                                        <GitHubIcon className="size-6" />
                                    )}
                                    <h2 className="text-xl font-semibold">
                                        {activeModal === 'google' ? 'Continue with Google' : 'Continue with GitHub'}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {activeModal === 'google' ? (
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                Gmail Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                                GitHub Username
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                required
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full mt-6"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="me-2 size-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send'
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const FlowforgeIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 3v18" />
        <path d="M8 7l4-4 4 4" />
        <path d="M8 12h8" />
        <path d="M6 17h12" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <g>
            <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
        </g>
    </svg>
);

const GitHubIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);
