import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Calendar, ClipboardCheck, ChevronRight } from 'lucide-react';
import { endpoints } from '../config';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Physio-AI, your digital physiotherapist. Tell me about your pain or injury, and I will create a tailored 7-day recovery plan for you.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "I have lower back pain",
    "Shoulder stiffness from sitting",
    "Knee pain after running",
    "Wrist pain from typing"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(endpoints.consult, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          plan: data.weekly_plan,
          diagnosis: data.diagnosis_note,
          tips: data.recovery_tips,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get consultation');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting to my knowledge base. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      content: "Hello! I'm Physio-AI, your digital physiotherapist. Tell me about your pain or injury, and I will create a tailored 7-day recovery plan for you.",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-full flex flex-col pt-0">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#222]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ccff00] rounded-xl flex items-center justify-center text-[#111] flex-shrink-0 shadow-lg shadow-[#ccff00]/10">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest uppercase text-white m-0 leading-tight">PHYSIO-AI</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></div>
                <span className="text-[10px] text-gray-400 hover:text-gray-300 transition-colors uppercase tracking-widest font-semibold cursor-default">Specialist Online</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all" title="Clear Chat">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto space-y-8 py-6 scrollbar-none pb-20 px-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex flex-col gap-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-start gap-4 ${message.type === 'user' ? 'max-w-[70%] flex-row-reverse' : 'max-w-[95%]'}`}>
                {message.type === 'bot' && (
                  <div className="w-10 h-10 bg-[#ccff00] rounded-xl mt-1 flex items-center justify-center flex-shrink-0 text-[#111] shadow-lg shadow-[#ccff00]/10">
                    <Bot size={22} />
                  </div>
                )}
                
                <div className={`flex flex-col gap-1.5 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${message.type === 'bot' ? 'text-[#ccff00] ml-1' : 'text-gray-500 mr-1'}`}>
                    {message.type === 'bot' ? 'Physio-AI' : 'You'}
                  </span>
                  
                  {message.plan ? (
                    <div className="space-y-4">
                      {/* Diagnosis Note */}
                      <div className="bg-[#1a1a1a] border border-[#ccff00]/20 rounded-xl p-5 text-gray-300 text-[15px] leading-relaxed tracking-wide border-l-4 border-l-[#ccff00]">
                         <p className="font-semibold text-[#ccff00] mb-2 uppercase text-[11px] tracking-widest">Initial Assessment</p>
                         {message.diagnosis}
                      </div>

                      {/* 7-Day Plan Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {message.plan.map((day, dIdx) => (
                          <div key={dIdx} className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#ccff00]/30 transition-all group">
                             <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-[#2a2a2a]">
                                <span className="text-[#ccff00] font-bold text-xs uppercase tracking-widest">{day.day}</span>
                                <span className="text-gray-500 text-[10px] uppercase font-bold">{day.focus}</span>
                             </div>
                             <div className="p-4 space-y-3">
                                {day.exercises.map((ex, eIdx) => (
                                  <div key={eIdx} className="flex items-start gap-3">
                                     <div className="w-5 h-5 bg-[#ccff00]/10 rounded flex items-center justify-center mt-0.5 shrink-0">
                                        <ChevronRight size={12} className="text-[#ccff00]" />
                                     </div>
                                     <div>
                                        <p className="text-xs text-white font-bold tracking-wide">{ex.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                                          {ex.sets} Sets × {ex.reps} Reps • {ex.duration_minutes}m
                                        </p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        ))}
                      </div>

                      {/* Recovery Tips */}
                      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <ClipboardCheck size={16} className="text-[#ccff00]" />
                          <h4 className="text-white font-bold text-xs uppercase tracking-widest">Recovery Tips</h4>
                        </div>
                        <ul className="space-y-2">
                           {message.tips.map((tip, tIdx) => (
                             <li key={tIdx} className="text-xs text-gray-400 flex gap-2">
                               <span className="text-[#ccff00]">•</span> {tip}
                             </li>
                           ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-xl p-5 text-[15px] font-medium leading-relaxed tracking-wide shadow-xl ${
                      message.type === 'user'
                        ? 'bg-[#222222] text-white rounded-tr-sm border border-[#333]'
                        : 'bg-[#1a1a1a] text-gray-300 rounded-tl-sm border border-[#2a2a2a]'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-[#222] border border-[#333] rounded-xl mt-1 flex items-center justify-center flex-shrink-0 text-gray-400 shadow-md">
                    <User size={22} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center text-[#111]">
                 <Bot size={22} />
               </div>
               <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-xl rounded-tl-sm flex items-center gap-2 h-14">
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
             </div>
          )}

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-3 pl-[3.5rem] pt-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#ccff00]/40 rounded-full text-[11px] font-black tracking-widest uppercase text-gray-400 hover:text-[#ccff00] transition-all shadow-sm active:scale-95"
                >
                  <Sparkles size={14} className="text-[#ccff00]" />
                  {q}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="pt-4 border-t border-[#222] mt-auto pb-4">
          <div className="relative flex items-center bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-2xl p-2 transition-all focus-within:border-[#ccff00]/50 shadow-2xl">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your pain or injury (e.g. Lower back pain for 3 days)..."
              className="w-full bg-transparent text-white px-5 py-4 resize-none font-medium focus:outline-none placeholder-gray-600 text-[15px] tracking-wide"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '150px' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className={`p-4 ml-3 rounded-xl transition-all flex-shrink-0 ${
                inputMessage.trim() && !isTyping
                  ? 'bg-[#ccff00] hover:bg-[#b3e600] text-[#111] shadow-lg shadow-[#ccff00]/20 active:scale-95'
                  : 'bg-[#222] text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={22} />
            </button>
          </div>
          
          <div className="text-center mt-5">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black ">
              AI Physiotherapy plans are for guidance only. See a professional if pain persists.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
