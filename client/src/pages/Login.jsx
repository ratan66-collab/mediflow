import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Apple, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const { signIn, signInWithOAuth } = useAuth();
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await signIn(email);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            if (localStorage.getItem('demo_user')) {
                navigate('/');
            } else {
                setMessage({ type: 'success', text: 'Check your email for the magic link!' });
            }
        }
        setLoading(false);
    };

    const handleSocialLogin = async (provider) => {
        setLoading(true);
        const { error } = await signInWithOAuth(provider);
        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
        // If successful, supabase redirects, or demo mode navigates immediately
        if (localStorage.getItem('demo_user')) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="md:w-96 w-full p-8 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl z-10 transition-all">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl mx-auto mb-4 flex items-center justify-center p-3">
                        <img src="/logo-new.png" alt="MediFlow" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">MediFlow</h1>
                    <p className="text-slate-400 text-sm">Your Personal Health Intelligence</p>
                </div>

                {/* Toggle Sign In / Sign Up */}
                <div className="flex p-1 bg-slate-950 rounded-lg mb-6 border border-slate-800">
                    <button
                        onClick={() => setMode('signin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signin' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {message && (
                    <div className={`text-center p-3 border rounded-xl mb-6 text-sm ${message.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                {!message?.text?.includes('magic link') && (
                    <div className="space-y-4">
                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                <Chrome size={18} className="text-red-500" /> Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('apple')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                <Apple size={18} /> Apple
                            </button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-800"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase">Or continue with</span>
                            <div className="flex-grow border-t border-slate-800"></div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                {loading ? "Please wait..." : (mode === 'signin' ? "Sign In with Email" : "Create Account")}
                            </button>
                        </form>
                    </div>
                )}

                <div className="mt-8 text-center text-xs text-slate-600">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    );
}
