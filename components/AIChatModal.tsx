import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, UserProfile } from '../types';
import { X, Send, Sparkles, BrainCircuit } from 'lucide-react';

interface AIChatModalProps {
  onClose: () => void;
  users: User[];
  myProfile: UserProfile;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ onClose, users, myProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm your AI Concierge. I've analyzed the people around you. Ask me anything! e.g., 'Who is best for networking?' or 'Write an icebreaker for Alice'." }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct context about the environment
      const context = `
        You are an intelligent social assistant for the app 'Time Connect'.
        
        MY PROFILE:
        Name: ${myProfile.name}
        Interest: ${myProfile.interest}
        Bio: ${myProfile.bio}
        
        NEARBY USERS (Data):
        ${JSON.stringify(users.map(u => ({ name: u.name, interest: u.interest, bio: u.bio, status: u.status, distance: 'nearby' })))}
        
        INSTRUCTIONS:
        1. Use the User Data to answer questions accurately.
        2. If asked for recommendations, cross-reference my profile with theirs.
        3. Be friendly, concise, and helpful.
        4. You are using a high-reasoning model, so feel free to analyze complex compatibility.
      `;

      // Using gemini-3-pro-preview with Thinking Budget as requested
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            { role: 'user', parts: [{ text: context }] }, // System/Context priming
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), // History
            { role: 'user', parts: [{ text: userMessage }] } // Current message
        ],
        config: {
          thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget
          // Note: maxOutputTokens is intentionally omitted per instructions
        },
      });

      const text = response.text || "I couldn't think of a response. Please try again.";
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the neural network right now." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="bg-white/95 w-full h-[80vh] sm:h-[600px] sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden relative flex flex-col pointer-events-auto border border-white/40">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x p-4 flex justify-between items-center text-white shadow-lg z-10">
            <div className="flex items-center gap-2">
                <BrainCircuit size={20} className="text-indigo-200" />
                <div>
                    <h2 className="font-bold text-sm tracking-wide">AI Concierge</h2>
                    <p className="text-[10px] text-indigo-200 font-medium">Powered by Gemini 3.0 Pro</p>
                </div>
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            
            {isThinking && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-500 animate-spin" />
                        <span className="text-xs text-slate-500 font-medium animate-pulse">Thinking deeply...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about matches..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    disabled={isThinking}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AIChatModal;