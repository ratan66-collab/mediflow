import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Activity, FileText, Accessibility, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const isActive = (path) => location.pathname === path;

    // Calculate Health Score
    const [score, setScore] = useState(100);

    useEffect(() => {
        if (!user?.email) return;

        const saved = localStorage.getItem(`dashboard_analysis_${user.email} `);
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
    }, [user, location.pathname]);

    return (
        <div className="flex h-screen bg-racing-dark text-racing-text font-sans overflow-hidden">
            {/* Left Sidebar (Desktop) */}
            <aside className="w-64 bg-[#111] border-r border-[#222] hidden md:flex flex-col">
                <div className="p-6 border-b border-[#222] flex items-center gap-3">
                    <div className="w-10 h-10 bg-racing-accent/10 rounded-xl flex items-center justify-center">
                        <Activity className="text-racing-accent w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-display tracking-widest uppercase text-white m-0">
                        MediFlow
                    </h1>
                </div>

                <nav className="flex-1 p-6 space-y-4">
                    <SidebarNavLink to="/" icon={<Activity />} label="DASHBOARD" active={isActive('/')} />
                    <SidebarNavLink to="/reports" icon={<FileText />} label="DOCUMENTS" active={isActive('/reports')} />
                    <SidebarNavLink to="/physio" icon={<Accessibility />} label="PHYSIO AI" active={isActive('/physio')} />
                </nav>

                <div className="p-6 border-t border-[#222]">
                    <div className="p-5 rounded-2xl bg-racing-card border-2 border-[#2a2a2a] relative overflow-hidden">
                        <h3 className="text-racing-textMuted font-display tracking-widest text-lg uppercase mb-2">Health Rating</h3>
                        <div className={`font - display text - 5xl tracking - widest ${score < 70 ? 'text-[#ff4b22]' : 'text-[#4ade80]'} `}>
                            {score}<span className="text-2xl text-gray-500">%</span>
                        </div>
                        <div className="w-full bg-[#111] h-3 mt-4 rounded-full overflow-hidden border border-[#333]">
                            <div
                                className={`h - full transition - all duration - 1000 ${score < 70 ? 'bg-[#ff4b22]' : 'bg-[#4ade80]'} `}
                                style={{ width: `${score}% ` }}
                            />
                        </div>
                        <p className="text-xs text-racing-textMuted mt-3 font-medium">Based on recent analysis.</p>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header - mimicking the reference "Become Pro" area */}
                <div className="flex justify-between items-center px-6 pt-6 pb-4 bg-[#111111] border-b border-[#222]">
                    <div className="flex gap-4">
                        <div className="flex bg-[#222222] rounded-full p-1 border border-[#333]">
                            <button className="px-3 py-1 bg-[#1a1a1a] rounded-full shadow-md">
                                <Activity size={18} className="text-gray-500" />
                            </button>
                            <button className="px-3 py-1">
                                <FileText size={18} className="text-[#bef264]" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="px-6 py-2 border border-[#bef264] rounded-full text-white font-display text-lg tracking-widest hover:bg-[#bef26411] transition-colors"
                    >
                        SIGN OUT
                    </button>
                </div>

                {/* Main Content Area (scrollable) */}
                <main className="flex-1 overflow-auto px-6 pb-32 scrollbar-none">
                    <Outlet />
                </main>

                {/* Floating Bottom Nav Pill (Mobile Only) */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-full py-3 px-6 shadow-2xl flex md:hidden justify-between items-center z-50">
                    <BottomNavLink to="/" icon={<Activity size={24} />} active={isActive('/')} />
                    <BottomNavLink to="/reports" icon={<FileText size={24} />} active={isActive('/reports')} />
                    <BottomNavLink to="/physio" icon={<Accessibility size={24} />} active={isActive('/physio')} />
                    <div className="w-10 h-10 rounded-full bg-racing-dark flex items-center justify-center overflow-hidden border-2 border-white">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarNavLink({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-display tracking-wide text-2xl uppercase ${active
                ? 'bg-racing-accent text-[#111111] shadow-lg shadow-racing-accent/20'
                : 'text-gray-400 hover:bg-[#222] hover:text-white'
                }`}
        >
            <div className={`${active ? 'text-[#111111]' : 'text-gray-500'} `}>
                {icon}
            </div>
            <span>{label}</span>
        </Link>
    );
}

function BottomNavLink({ to, icon, active }) {
    return (
        <Link
            to={to}
            className={`relative p - 2 rounded - xl transition - all duration - 300 ${active ? 'bg-racing-dark text-racing-accent' : 'text-gray-900 hover:text-racing-accent'} `}
        >
            {icon}
            {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-racing-accent rounded-full" />
            )}
        </Link>
    );
}
