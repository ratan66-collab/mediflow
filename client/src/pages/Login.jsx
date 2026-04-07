import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        let error;
        if (mode === 'signup') {
            const result = await signUp(email, password, name);
            error = result.error;
        } else {
            const result = await signIn(email, password);
            error = result.error;
        }

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111111] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#bef264]/10 via-[#111111] to-[#111111] pointer-events-none" />

            <div className="md:w-96 w-full p-8 bg-[#1a0f0f]/80 backdrop-blur-md rounded-3xl border border-[#bef264]/20 shadow-2xl shadow-[#bef264]/5 z-10 transition-all font-display">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#bef264]/10 rounded-2xl mx-auto mb-4 flex items-center justify-center p-3 border border-[#bef264]/20">
                        <img src="/logo-new.png" alt="MediFlow" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest">MediFlow</h1>
                    <p className="text-[#bef264] text-xs font-bold tracking-widest uppercase">Health Intelligence</p>
                </div>

                {/* Toggle Sign In / Sign Up */}
                <div className="flex p-1 bg-[#000000]/40 rounded-xl mb-6 border border-[#2a2a2a]">
                    <button
                        onClick={() => { setMode('signin'); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'signin' ? 'bg-[#bef264] text-[#111111] shadow-lg shadow-[#bef264]/20' : 'text-slate-500 hover:text-[#bef264]'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'signup' ? 'bg-[#bef264] text-[#111111] shadow-lg shadow-[#bef264]/20' : 'text-slate-500 hover:text-[#bef264]'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {message && (
                    <div className={`text-center p-4 rounded-xl mb-6 text-sm font-bold tracking-wider uppercase ${message.type === 'error'
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                        : 'bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264]'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-5">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-all font-sans"
                                        required={mode === 'signup'}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-all font-sans"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-all font-sans"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-2 bg-[#bef264] hover:bg-[#a3d83b] text-[#111111] rounded-xl font-bold tracking-widest uppercase transition-all shadow-lg shadow-[#bef264]/20 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin w-5 h-5" />}
                            {loading ? "Processing..." : (mode === 'signin' ? "Sign In" : "Create Account")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
