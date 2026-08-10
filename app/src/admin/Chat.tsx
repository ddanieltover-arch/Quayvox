import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const quickReplies = [
  'Track shipment SH-2026-7842',
  'Show delayed shipments',
  'Calculate shipping cost',
  'Export monthly report',
];

const botResponses: Record<string, string> = {
  'track': 'I found your shipment! **SH-2026-7842** is currently **In Transit** from Shanghai to Los Angeles with **68%** progress. ETA: June 15, 2026.',
  'delayed': 'I found **1 delayed shipment**: SH-2026-7847 (Mumbai → Nairobi) is currently in Exception status due to port congestion. I recommend contacting the carrier for updates.',
  'cost': 'For a 1000kg shipment from Shanghai to Los Angeles:\n\n**Ocean:** $1,500 - $2,100 (12-22 days)\n**Air:** $11,800 - $14,200 (2-5 days)\n**Rail:** $3,500 - $4,500 (10-16 days)',
  'export': 'I\'ve generated your monthly report for May 2026:\n\n- Total Shipments: 10\n- Delivered: 2\n- In Transit: 5\n- Revenue: $26,650\n\nThe report has been sent to your email.',
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', content: 'Hello! I\'m Quayvox AI Assistant. How can I help you today?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let response = 'I can help you with tracking shipments, calculating costs, viewing analytics, and more. What would you like to know?';
      const lower = text.toLowerCase();
      if (lower.includes('track') || lower.includes('shipment')) response = botResponses['track'];
      else if (lower.includes('delay') || lower.includes('late')) response = botResponses['delayed'];
      else if (lower.includes('cost') || lower.includes('price') || lower.includes('calculate')) response = botResponses['cost'];
      else if (lower.includes('export') || lower.includes('report')) response = botResponses['export'];

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">AI Assistant</h1>
        <p className="text-sm text-text-secondary mt-1">Ask me anything about your shipments</p>
      </div>

      <div className="flex-1 card-surface mt-4 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'bot' ? 'bg-cobalt/20' : 'bg-emerald-500/20'
              }`}>
                {msg.role === 'bot' ? <Bot className="w-4 h-4 text-cobalt" /> : <User className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'bot'
                  ? 'bg-navy-900/60 border border-white/5 rounded-tl-none'
                  : 'bg-cobalt/20 border border-cobalt/20 rounded-tr-none'
              }`}>
                <p className="text-sm text-text-primary whitespace-pre-line">{msg.content}</p>
                <span className="text-[10px] text-text-secondary mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cobalt/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cobalt" />
              </div>
              <div className="bg-navy-900/60 border border-white/5 rounded-2xl rounded-tl-none p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length < 3 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickReplies.map(reply => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="px-3 py-1.5 rounded-full text-xs bg-navy-900 border border-white/5 text-text-secondary hover:text-cobalt hover:border-cobalt/30 transition-all"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about shipments, costs, reports..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-cobalt text-white disabled:opacity-30 hover:bg-cobalt-light transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
