'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AskChefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AskChefModal({ isOpen, onClose }: AskChefModalProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${profile?.firstName || 'Chef'}! I'm your personal sous-chef. Ask me anything about cooking, conversions, substitutions, pairings, or recipes!`,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !chatSession) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          console.error('Gemini API key is missing');
          return;
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: 'You are a helpful, expert personal chef. You give advice and information about all things cooking, including conversions, substitutions, pairings, recipes, and techniques. Keep your answers EXTREMELY concise and to the point to save time and tokens. Use short sentences, brief explanations, and bullet points where possible. Format nicely using markdown.',
          }
        });
        setChatSession(chat);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    }
  }, [isOpen, chatSession]);

  // Scroll to bottom when messages change or modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || !chatSession || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMessage,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    
    try {
      const response = await chatSession.sendMessage({ message: userMessage });
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'Sorry, I could not process that request.',
      };
      
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error while trying to respond. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-card-bg shadow-2xl z-[1010] flex flex-col animate-in slide-in-from-right duration-300 border-l border-border-color">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-color bg-card-bg z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-serif text-xl m-0 text-text-main">Ask Chef</h2>
              <p className="text-xs text-text-light">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-hover-bg flex items-center justify-center text-text-main border-none cursor-pointer hover:bg-border-color transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-border-color text-text-main' : 'bg-primary text-white'}`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div 
                className={`p-3.5 rounded-2xl text-[0.95rem] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-hover-bg text-text-main rounded-tr-sm' 
                    : 'bg-primary/10 text-text-main rounded-tl-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="markdown-body prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mt-1">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-primary/10 text-primary rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Chef is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-color bg-card-bg">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-hover-bg rounded-2xl p-2 border border-border-color focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about substitutions, pairings..."
              className="flex-1 bg-transparent border-none resize-none max-h-32 min-h-[44px] py-2.5 px-3 text-[0.95rem] text-text-main focus:outline-none"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
          <p className="text-center text-[0.7rem] text-text-light mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}
