import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Activity, FileText, User, Menu, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
    const location = useLocation();
    const { user, signOut } = useAuth();

    const isActive = (path) => location.pathname === path;

    // Calculate Health Score
    const [score, setScore] = useState(100);

    useEffect(() => {
        if (!user?.email) return;

        const saved = localStorage.getItem(`dashboard_analysis_${user.email}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.metrics) {
                    let calculated = 100;
                    const deduction = 10;

                    data.metrics.forEach(m => {
                        if (m.status !== 'Normal') {
                            calculated -= deduction;
                        }
                    });

                    setScore(Math.max(0, calculated)); // floor at 0
                }
            } catch (e) {
                console.error("Score calc error", e);
            }
        }
    }, [user, location.pathname]); // Re-calc on nav change in case analysis updated

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/50 border-r border-slate-800 hidden md:flex flex-col backdrop-blur-xl">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <img src="/logo-new.png" alt="MediFlow Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        MediFlow
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink to="/" icon={<Activity />} label="Dashboard" active={isActive('/')} />
                    <NavLink to="/reports" icon={<FileText />} label="Documents" active={isActive('/reports')} />
                    <NavLink to="/physio" icon={<User />} label="Physio AI" active={isActive('/physio')} />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-200 mb-1">Health Score</p>
                        <div className={`text-2xl font-bold ${score < 70 ? 'text-red-400' : 'text-blue-400'}`}>
                            {score}%
                        </div>
                        <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${score < 70 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${score}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Based on your latest report analysis.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md z-10">
                    <button className="md:hidden text-slate-400 hover:text-white">
                        <Menu />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-slate-200">{user?.email || 'Guest User'}</div>
                            <div className="text-xs text-slate-500">Patient ID: #8392</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-800 shadow-lg flex items-center justify-center text-white font-bold">
                            {user?.email?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <button
                            onClick={signOut}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg transition-colors border border-slate-700"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavLink({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-lg shadow-blue-500/5'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
        >
            <div className={`${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {icon}
            </div>
            <span className="font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />}
        </Link>
    );
}
