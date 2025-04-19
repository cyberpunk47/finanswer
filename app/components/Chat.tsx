'use client'

import { useState, useRef, useEffect } from 'react'
import { generateResponse } from '../utils/gemini'
import {
    Bot, User, Send, Plus, Trash2, Sparkles, Lightbulb, TrendingUp,
    Wallet, X, Menu, MessageSquare, Zap, AlertTriangle, Moon, Sun
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

// Create a custom ChatInput component
function ChatInput({ onSendMessage, loading, darkMode }: {
    onSendMessage: (message: string) => void,
    loading: boolean,
    darkMode: boolean
}) {
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }, [message])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || loading) return
        onSendMessage(message)
        setMessage('')
    }

    return (
        <div className={`border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 md:p-4`}>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={darkMode ? "Message FinAnswer..." : "Ask about investing, stocks, ETFs, apps..."}
                        className={`w-full p-3 pr-12 rounded-lg resize-none min-h-[48px] max-h-[150px] ${darkMode
                                ? 'bg-gray-700 text-white border-transparent focus:border-transparent focus:ring-2 focus:ring-blue-500'
                                : 'border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                if (!message.trim() || loading) return
                                handleSubmit(e)
                            }
                        }}
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || loading}
                        className={`absolute right-3 bottom-3 p-2 rounded-full ${!message.trim() || loading
                                ? darkMode ? 'text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } transition-colors`}
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-center`}>
                    FinAnswer provides general investing information, not financial advice.
                </div>
            </form>
        </div>
    )
}

// MessageContent component with fixed ReactMarkdown implementation
function MessageContent({ content }: { content: string, isUserMessage?: boolean }) {
    return (
        <div className="prose prose-sm max-w-none break-words">
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-md font-bold mb-2 mt-3">{children}</h3>,
                    code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">{children}</code>,
                    pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded my-2 overflow-auto">{children}</pre>
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default function Chat() {
    const [conversations, setConversations] = useState([
        {
            id: '1',
            title: 'New chat',
            messages: [
                {
                    id: '0',
                    text: "Welcome to FinAnswer! I'm your AI investing guide. How can I help with your financial questions today?",
                    isUser: false,
                    timestamp: new Date()
                }
            ]
        }
    ])
    const [currentConversationId, setCurrentConversationId] = useState('1')
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const messageContainerRef = useRef<HTMLDivElement>(null)

    const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentConversation?.messages])

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && sidebarOpen) {
                setSidebarOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [sidebarOpen])

    const handleNewChat = () => {
        const newId = Date.now().toString()
        setConversations(prev => [
            {
                id: newId,
                title: 'New chat',
                messages: [
                    {
                        id: '0',
                        text: "Welcome to FinAnswer! I'm your AI investing guide. How can I help with your financial questions today?",
                        isUser: false,
                        timestamp: new Date()
                    }
                ]
            },
            ...prev
        ])
        setCurrentConversationId(newId)
        setSidebarOpen(false)
    }

    const handleDeleteChat = (id: string) => {
        if (conversations.length <= 1) return

        setConversations(prev => prev.filter(c => c.id !== id))
        if (currentConversationId === id) {
            setCurrentConversationId(conversations.find(c => c.id !== id)?.id || '')
        }
    }

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || loading) return

        // Add user message
        setConversations(prev => prev.map(c =>
            c.id === currentConversationId
                ? {
                    ...c,
                    messages: [...c.messages, {
                        id: Date.now().toString(),
                        text: message,
                        isUser: true,
                        timestamp: new Date()
                    }],
                    title: c.title === 'New chat' ? message.slice(0, 30) : c.title
                }
                : c
        ))

        setLoading(true)

        try {
            const response = await generateResponse(message)

            // Add AI response
            setConversations(prev => prev.map(c =>
                c.id === currentConversationId
                    ? {
                        ...c,
                        messages: [...c.messages, {
                            id: Date.now().toString(),
                            text: response,
                            isUser: false,
                            timestamp: new Date()
                        }]
                    }
                    : c
            ))
        } catch (error) {
            console.error('Error:', error)
            setConversations(prev => prev.map(c =>
                c.id === currentConversationId
                    ? {
                        ...c,
                        messages: [...c.messages, {
                            id: Date.now().toString(),
                            text: "Sorry, I'm having trouble connecting. Please try again later.",
                            isUser: false,
                            timestamp: new Date()
                        }]
                    }
                    : c
            ))
        } finally {
            setLoading(false)
        }
    }

    const financialExamples = [
        {
            icon: <TrendingUp className="w-4 h-4" />,
            text: "How should I start investing with ₹500?" // Direct Unicode character instead of (U+20B9)
        },
        {
            icon: <Wallet className="w-4 h-4" />,
            text: "What are the best index funds for beginners?"
        },
        {
            icon: <Lightbulb className="w-4 h-4" />,
            text: "How can I build an emergency fund?"
        }
    ];

    const financialCapabilities = [
        "Analyzes market trends and economic indicators",
        "Explains complex financial terms simply",
        "Provides diversified investment strategies"
    ]

    const financialLimitations = [
        "Not a substitute for professional financial advice",
        "Market data may be delayed or incomplete",
        "Can't predict future market performance"
    ]

    return (
        <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Mobile overlay when sidebar is open */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 z-10 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar - Claude-inspired with collapsible behavior */}
            <div
                ref={sidebarRef}
                className={`
                    fixed md:relative inset-y-0 left-0 z-20 w-72 md:w-64 
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-r border-gray-200'} 
                    shadow-lg md:shadow-none 
                    transform transition-transform duration-300 ease-in-out h-full
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                            <Sparkles className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div>
                                <h2 className="text-lg font-semibold">FinAnswer</h2>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI Investment Guide</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`p-1.5 rounded-md ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <button
                                className={`md:hidden p-1.5 rounded-md ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Close sidebar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <button
                            onClick={handleNewChat}
                            className={`flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium ${darkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-md'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white rounded-md'
                                } transition-colors`}
                            aria-label="Start new chat"
                        >
                            <Plus className="w-4 h-4" />
                            New chat
                        </button>
                    </div>

                    <div className="px-4 py-2 text-xs text-gray-400 uppercase font-semibold">Recent Chats</div>

                    <div className={`flex-1 overflow-y-auto ${darkMode ? 'px-2' : 'px-2'}`}>
                        {conversations.length === 0 ? (
                            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map(conversation => (
                                <motion.div
                                    key={conversation.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`group flex items-center justify-between px-4 py-3 mx-2 my-1 text-sm cursor-pointer rounded-md transition-colors ${currentConversationId === conversation.id
                                            ? darkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-600 font-medium'
                                            : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    onClick={() => {
                                        setCurrentConversationId(conversation.id)
                                        setSidebarOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-gray-400' : ''}`} />
                                        <span className="truncate">{conversation.title}</span>
                                    </div>
                                    {conversations.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteChat(conversation.id)
                                            }}
                                            className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-gray-200'} opacity-0 group-hover:opacity-100 focus:opacity-100`}
                                            aria-label={`Delete conversation: ${conversation.title}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className={`p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        FinAnswer v1.0 · Financial AI Assistant
                    </div>
                </div>
            </div>

            {/* Main content area - Claude-inspired */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header */}
                <header className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} md:hidden ${darkMode ? 'text-white' : 'text-gray-600'}`}
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentConversation.title === 'New chat' ? 'New Chat' : currentConversation.title}
                    </h1>
                    <div className="w-5"></div> {/* Spacer for balance */}
                </header>

                {/* Messages */}
                <div
                    ref={messageContainerRef}
                    className={`flex-1 overflow-y-auto p-4 md:p-6 ${darkMode ? 'bg-gray-900' : 'bg-white md:bg-gray-50'}`}
                >
                    {currentConversation.messages.length <= 1 && currentConversation.messages[0]?.isUser === false ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center p-4">
                            {darkMode ? (
                                // Dark mode welcome screen with 3-column layout
                                <div className="text-center max-w-4xl mx-auto">
                                    <h1 className="text-4xl font-bold mb-10">FinAnswer</h1>

                                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                                        <div className="flex flex-col items-center">
                                            <Zap className="w-6 h-6 mb-4 text-blue-400" />
                                            <h3 className="mb-4">Examples</h3>
                                            {financialExamples.map((example, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(example.text)}
                                                    className="w-full p-4 mb-3 text-sm bg-gray-700 rounded-md hover:bg-gray-600 text-left"
                                                    aria-label={`Ask example question: ${example.text}`}
                                                >
                                                    &quot;{example.text}&quot; →
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <MessageSquare className="w-6 h-6 mb-4 text-green-400" />
                                            <h3 className="mb-4">Capabilities</h3>
                                            {financialCapabilities.map((capability, i) => (
                                                <div key={i} className="w-full p-4 mb-3 text-sm bg-gray-700 rounded-md text-left">
                                                    {capability}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <AlertTriangle className="w-6 h-6 mb-4 text-yellow-400" />
                                            <h3 className="mb-4">Limitations</h3>
                                            {financialLimitations.map((limitation, i) => (
                                                <div key={i} className="w-full p-4 mb-3 text-sm bg-gray-700 rounded-md text-left">
                                                    {limitation}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Light mode welcome screen
                                <>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="mb-6"
                                    >
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
                                            <Sparkles className="w-8 h-8" />
                                        </div>
                                    </motion.div>
                                    <motion.h2
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="text-2xl font-bold mb-2"
                                    >
                                        Welcome to FinAnswer
                                    </motion.h2>
                                    <motion.p
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="text-gray-500 mb-8"
                                    >
                                        Your AI assistant for micro-investing and personal finance
                                    </motion.p>

                                    <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                                        {financialExamples.map((q, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.3 + (i * 0.1) }}
                                                onClick={() => handleSendMessage(q.text)}
                                                className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                                                aria-label={`Ask question: ${q.text}`}
                                            >
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
                                                    {q.icon}
                                                </div>
                                                <span>{q.text}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-4">
                            {/* Claude-inspired message bubbles */}
                            {currentConversation.messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`group flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start space-x-2 max-w-[85%] md:max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                        }`}>
                                        <div className={`flex-shrink-0 p-2 rounded-full ${message.isUser
                                                ? darkMode ? 'bg-blue-800' : 'bg-blue-100'
                                                : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}>
                                            {message.isUser
                                                ? <User className={`w-4 h-4 ${darkMode ? 'text-blue-200' : 'text-blue-600'}`} />
                                                : <Bot className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                            }
                                        </div>

                                        <div className={`relative rounded-lg px-4 py-3 ${message.isUser
                                                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                                                : darkMode ? 'bg-gray-800 border border-gray-700 text-gray-200'
                                                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                            }`}>
                                            <MessageContent
                                                content={message.text}
                                                isUserMessage={message.isUser}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-start space-x-2">
                                        <div className={`flex-shrink-0 p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}>
                                            <Bot className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                        </div>

                                        <div className={`relative rounded-lg px-4 py-3 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
                                            }`}>
                                            <div className="flex space-x-2">
                                                <motion.div
                                                    animate={{ y: [0, -3, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.3 }}
                                                    className="w-2 h-2 rounded-full bg-gray-400"
                                                ></motion.div>
                                                <motion.div
                                                    animate={{ y: [0, -3, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.3, delay: 0.2 }}
                                                    className="w-2 h-2 rounded-full bg-gray-400"
                                                ></motion.div>
                                                <motion.div
                                                    animate={{ y: [0, -3, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.3, delay: 0.4 }}
                                                    className="w-2 h-2 rounded-full bg-gray-400"
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input area */}
                <ChatInput onSendMessage={handleSendMessage} loading={loading} darkMode={darkMode} />
            </div>
        </div>
    )
}