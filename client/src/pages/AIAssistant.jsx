import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Rasputin, your AI health assistant. I can help you understand lab results, answer health questions, and provide general wellness guidance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What does high cholesterol mean?",
    "How can I lower my blood pressure?",
    "Explain my glucose levels",
    "What foods improve heart health?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('cholesterol')) {
      return "High cholesterol means you have too much LDL (bad) cholesterol in your blood, which can increase your risk of heart disease and stroke. Consider eating more fiber, reducing saturated fats, and exercising regularly. Consult your doctor for personalized advice.";
    } else if (message.includes('blood pressure')) {
      return "To lower blood pressure naturally: reduce sodium intake, exercise regularly (30 mins daily), maintain healthy weight, limit alcohol, manage stress through meditation or yoga, and eat potassium-rich foods like bananas and leafy greens. Monitor your BP regularly and follow your doctor's treatment plan.";
    } else if (message.includes('glucose') || message.includes('blood sugar')) {
      return "Normal fasting glucose is 70-100 mg/dL. Higher levels may indicate prediabetes or diabetes. Manage glucose levels through: balanced diet low in refined carbs, regular exercise, stress management, adequate sleep, and maintaining healthy weight. Regular monitoring is essential.";
    } else if (message.includes('heart health') || message.includes('heart')) {
      return "Heart-healthy foods include: fatty fish (salmon, mackerel), nuts, seeds, olive oil, berries, leafy greens, whole grains, and beans. Limit processed foods, excess sugar, and saturated fats. Combine with regular aerobic exercise for optimal heart health.";
    } else if (message.includes('exercise') || message.includes('fitness')) {
      return "The CDC recommends 150 minutes of moderate exercise weekly (like brisk walking) or 75 minutes of vigorous exercise. Include strength training twice weekly. Start slow and gradually increase intensity. Always consult your doctor before starting a new exercise program.";
    } else if (message.includes('sleep')) {
      return "Adults need 7-9 hours of quality sleep nightly. Improve sleep by: maintaining consistent schedule, creating dark/cool environment, avoiding screens before bed, limiting caffeine after 2pm, and establishing relaxing bedtime routine. Poor sleep affects immunity, weight, and mental health.";
    } else if (message.includes('stress')) {
      return "Manage stress through: deep breathing exercises, meditation, regular physical activity, adequate sleep, limiting caffeine/alcohol, connecting with friends/family, and seeking professional help if needed. Chronic stress can impact physical and mental health.";
    } else {
      return "I'm here to help with health-related questions. I can provide information about nutrition, exercise, sleep, stress management, preventive care, medications, lab results, and symptoms. For specific medical advice, please consult your healthcare provider. What specific health topic would you like to know more about?";
    }
  };

  const handleSendMessage = (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: generateBotResponse(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
      content: "Hello! I'm Rasputin, your AI health assistant. I can help you understand lab results, answer health questions, and provide general wellness guidance. How can I help you today?",
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
              <h1 className="text-xl font-bold tracking-widest uppercase text-white m-0 leading-tight">RASPUTIN</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></div>
                <span className="text-[10px] text-gray-400 hover:text-gray-300 transition-colors uppercase tracking-widest font-semibold cursor-default">Online</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all" title="Clear Chat">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto space-y-6 py-6 scrollbar-none pb-20">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start flex-col gap-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
              
              <div className="flex items-start gap-4 max-w-[85%]">
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-[#ccff00] rounded-lg mt-1 flex items-center justify-center flex-shrink-0 text-[#111]">
                    <Bot size={18} />
                  </div>
                )}
                
                <div className={`flex flex-col gap-1.5 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  {message.type === 'bot' ? (
                    <span className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest ml-1">Rasputin</span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-1">You</span>
                  )}
                  <div className={`rounded-xl p-5 text-[15px] font-medium leading-relaxed tracking-wide ${
                    message.type === 'user'
                      ? 'bg-[#222222] text-white rounded-tr-sm border border-[#333]'
                      : 'bg-[#1a1a1a] text-gray-300 rounded-tl-sm border border-[#2a2a2a]'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-[#222] border border-[#333] rounded-lg mt-1 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <User size={18} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex items-start gap-4">
               <div className="w-8 h-8 bg-[#ccff00] rounded-lg mt-1 flex items-center justify-center text-[#111]">
                 <Bot size={18} />
               </div>
               <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-xl rounded-tl-sm flex items-center gap-2 h-14">
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
             </div>
          )}

          {/* Suggested Prompts - Only show right after the initial bot message */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-3 pl-[3.25rem] pt-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#ccff00]/40 rounded-full text-xs font-bold tracking-wider uppercase text-gray-400 hover:text-[#ccff00] transition-all shadow-sm"
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
          <div className="relative flex items-center bg-[#1a1a1a] border border-[#333] hover:border-[#444] rounded-2xl p-2 transition-all focus-within:border-[#ccff00]/50 shadow-lg">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health..."
              className="w-full bg-transparent text-white px-4 py-3 resize-none font-medium focus:outline-none placeholder-gray-600 text-[15px] tracking-wide"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className={`p-3.5 ml-2 rounded-xl transition-all flex-shrink-0 ${
                inputMessage.trim() && !isTyping
                  ? 'bg-[#ccff00] hover:bg-[#b3e600] text-[#111] shadow-lg shadow-[#ccff00]/20'
                  : 'bg-[#222] text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              AI responses are for informational purposes only. Consult a doctor for medical advice.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
