import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Activity, Calendar as CalendarIcon, Trophy, HeartPulse, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { endpoints } from '../config';

export default function Physio() {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Active Timer State
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [currentExercise, setCurrentExercise] = useState(null);

    // Chat History (Stores the Plan)
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`physio_chat_${user?.email}`);
        return saved ? JSON.parse(saved) : [{
            role: 'ai',
            content: "Hello! I'm your AI Physiotherapist. Describe your pain or goal, and I'll generate a professional 7-Day Rehabilitation Plan for you."
        }];
    });

    // Workout History (For Calendar & Graphs)
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem(`physio_history_${user?.email}`);
        return saved ? JSON.parse(saved) : [];
    });

    // Save Data
    useEffect(() => {
        if (user?.email) {
            localStorage.setItem(`physio_chat_${user.email}`, JSON.stringify(messages));
            localStorage.setItem(`physio_history_${user.email}`, JSON.stringify(history));
        }
    }, [messages, history, user]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isTimerActive) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        } else if (!isTimerActive && timerSeconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timerSeconds]);

    // Format Timer
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Chat Handler
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(endpoints.consult, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content }),
            });
            const data = await res.json();

            if (data.weekly_plan) {
                const aiMsg = {
                    role: 'ai',
                    type: 'weekly_plan',
                    content: data.diagnosis_note,
                    plan: data.weekly_plan
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "I couldn't generate a plan. Please try again." }]);
            }

        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "Connection Error." }]);
        } finally {
            setLoading(false);
        }
    };

    // Start Session
    const startSession = (exercise) => {
        setCurrentExercise(exercise);
        setTimerSeconds(0);
        setIsTimerActive(true);
    };

    // Stop Session & Log
    const stopSession = () => {
        setIsTimerActive(false);
        if (currentExercise) {
            const durationMins = Math.ceil(timerSeconds / 60);
            const entry = {
                date: new Date().toLocaleDateString(), // e.g. "1/23/2026"
                exercise: currentExercise.name,
                duration: durationMins,
                timestamp: Date.now()
            };
            setHistory(prev => [...prev, entry]);
            alert(`Session Complete! Logged ${durationMins} mins.`);
            setTimerSeconds(0);
            setCurrentExercise(null);
        }
    };

    // Calendar Helper: Get last 14 days and check active status
    const getCalendarDays = () => {
        const days = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            const isActive = history.some(h => h.date === dateStr);
            days.push({ date: d, isActive, dayNum: d.getDate() });
        }
        return days;
    };

    return (
        <div className="h-[calc(100vh-6rem)] max-w-5xl mx-auto w-full relative drop-shadow-xl">

            {/* Active Session Overlay (Stopwatch) */}
            {isTimerActive && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="animate-pulse bg-emerald-500/20 p-2 rounded-full">
                        <Clock className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">Current Session</div>
                        <div className="text-2xl font-mono font-bold text-white">{formatTime(timerSeconds)}</div>
                        <div className="text-xs text-emerald-400 trunc max-w-[150px] truncate">{currentExercise?.name}</div>
                    </div>
                    <button onClick={stopSession} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
                        STOP & LOG
                    </button>
                </div>
            )}

            {/* Main Chat & Weekly Plan */}
            <div className="h-full flex flex-col bg-racing-card rounded-3xl border border-[#2a2a2a] overflow-hidden">
                <div className="p-6 flex items-center gap-3 bg-[#111111]">
                    <HeartPulse className="text-racing-accent w-8 h-8" />
                    <h2 className="text-white font-display text-4xl tracking-wider uppercase m-0">Physio Plan Generator</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-racing-accent text-[#111111]' : 'bg-[#222222] border border-[#333] text-gray-200'}`}>
                                <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>

                                {/* WEEKLY PLAN DISPLAY */}
                                {msg.type === 'weekly_plan' && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {msg.plan.map((day, i) => (
                                            <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-bold text-emerald-400 text-sm">{day.day}</h4>
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{day.focus}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {(day.exercises || []).map((ex, j) => (
                                                        <div key={j} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800 hover:border-blue-500/50 transition-colors group">
                                                            <div>
                                                                <div className="text-xs text-slate-300 font-medium">{ex.name}</div>
                                                                <div className="text-[10px] text-slate-500">{ex.reps} x {ex.sets} {ex.duration_minutes ? `• ${ex.duration_minutes}m` : ''}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => startSession(ex)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 bg-emerald-600 rounded text-white hover:bg-emerald-500 transition-all"
                                                                title="Start Session Timer"
                                                            >
                                                                <Clock size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="text-slate-500 text-xs ml-4">Generating plan...</div>}
                </div>

                <form onSubmit={handleSend} className="p-4 bg-[#111111] flex gap-3">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="E.g., I sprained my ankle..."
                        className="flex-1 bg-[#222222] border-2 border-[#333] rounded-full px-6 text-white focus:outline-none focus:border-racing-accent transition-colors"
                    />
                    <button type="submit" disabled={loading} className="p-4 bg-racing-accent hover:bg-racing-accentHover text-[#111111] rounded-full transition-colors flex shadow-xl shadow-racing-accent/20">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </form>
            </div>


        </div>
    );
}
