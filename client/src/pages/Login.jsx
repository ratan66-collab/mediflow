import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Minus } from 'lucide-react';
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
        <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex font-sans">
            {/* Background Image */}
            <img 
                src="/login-bg.jpg" 
                alt="Dashboard Background"
                className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
            />
            
            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Main Layout mirroring the inspiration image */}
            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row justify-between p-8 lg:p-16 min-h-screen">
                
                {/* LEFT SIDE: Big Typography anchored at bottom */}
                <div className="flex flex-col justify-end lg:w-1/2 h-full text-[#ccff00] pb-8 pt-12 lg:pt-0">
                    <div className="flex-1"></div> {/* Spacer to push to bottom */}
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-end gap-x-8 gap-y-4">
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-none">
                            MEDI<br/>FLOW
                        </h1>
                    </div>
                </div>

                {/* RIGHT SIDE: Floating Black Cards Container */}
                <div className="flex flex-col gap-4 lg:w-[420px] justify-center mt-12 lg:mt-0">
                    
                    {/* Card 1: Header/Mode Selection */}
                    <div className="bg-[#050805]/95 backdrop-blur-xl rounded-2xl p-5 border border-[#ccff00]/10">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setMode('signin')}
                                className={`text-[11px] font-bold tracking-widest uppercase pb-2 border-b-2 transition-all block ${mode === 'signin' ? 'text-[#ccff00] border-[#ccff00]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Existing User
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`text-[11px] font-bold tracking-widest uppercase pb-2 border-b-2 transition-all block ${mode === 'signup' ? 'text-[#ccff00] border-[#ccff00]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                New Account
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Functional Form */}
                    <div className="bg-[#050805]/95 backdrop-blur-xl rounded-2xl p-6 border border-[#ccff00]/10 shadow-[0_0_40px_rgba(204,255,0,0.03)]">
                        <div className="flex justify-between items-center mb-6 border-b border-[#ccff00]/10 pb-4">
                            <h3 className="text-[#ccff00] text-xs font-bold tracking-widest uppercase">
                                {mode === 'signin' ? 'SECURE LOGIN' : 'ACCESS REGISTRATION'}
                            </h3>
                            <ArrowRight size={16} className="text-[#ccff00]" />
                        </div>

                        {message && (
                            <div className={`mb-6 text-[10px] font-bold tracking-widest p-3 rounded uppercase ${message.type === 'error' ? 'text-red-500 bg-red-500/10' : 'text-[#ccff00] bg-[#ccff00]/10'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-6">
                            {mode === 'signup' && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold tracking-widest text-[#ccff00]/50 uppercase">Operative Name</label>
                                    <input 
                                        type="text" 
                                        value={name} onChange={e => setName(e.target.value)} required={mode === 'signup'}
                                        className="w-full bg-transparent border-b border-[#ccff00]/20 py-2 text-white text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold tracking-widest text-[#ccff00]/50 uppercase">Secure Email</label>
                                <input 
                                    type="email" 
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                    className="w-full bg-transparent border-b border-[#ccff00]/20 py-2 text-white text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold tracking-widest text-[#ccff00]/50 uppercase">Passkey</label>
                                <input 
                                    type="password" 
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                    className="w-full bg-transparent border-b border-[#ccff00]/20 py-2 text-white text-sm tracking-widest focus:outline-none focus:border-[#ccff00] transition-colors"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#050805] font-black text-[11px] tracking-widest uppercase py-4 px-5 rounded transition-all flex items-center justify-between"
                                >
                                    {loading ? 'Authenticating...' : (mode === 'signin' ? 'Verify & Enter' : 'Initialize Account')}
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
