import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, Search, Stethoscope, Bot, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const isActive = (path) => location.pathname === path;

    // Calculate Health Score
    const [score, setScore] = useState(0); 

    useEffect(() => {
        if (!user?.email) return;

        const calculateScore = () => {
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
                        setScore(Math.max(0, calculated)); 
                    }
                } catch (e) {
                    console.error("Score calc error", e);
                }
            }
        };

        calculateScore();
        window.addEventListener('analysisUpdated', calculateScore);
        
        return () => window.removeEventListener('analysisUpdated', calculateScore);
    }, [user, location.pathname]);

    return (
        <div className="flex h-screen bg-[#111111] text-gray-200 font-sans overflow-hidden">
            {/* Left Sidebar (Desktop) */}
            <aside className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 mt-2">
                    <Activity className="text-[#ccff00] w-7 h-7" />
                    <h1 className="text-xl font-bold tracking-widest uppercase text-white m-0">
                        MEDIFLOW
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 mt-4 text-sm font-semibold tracking-wide">
                    <SidebarNavLink to="/" icon={<LayoutDashboard size={20} />} label="DASHBOARD" active={isActive('/')} />
                    <SidebarNavLink to="/reports" icon={<FileText size={20} />} label="SAVED REPORTS" active={isActive('/reports')} />
                    <SidebarNavLink to="/ai-assistant" icon={<Bot size={20} />} label="AI ASSISTANT" active={isActive('/ai-assistant')} />
                </nav>

                <div className="p-4">
                    <div className="px-4 py-5 rounded-2xl bg-[#222222] border border-[#333333] relative overflow-hidden">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Health Score</h3>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-bold text-[#ccff00]">{score}</span>
                            <span className="text-xl text-gray-400 font-normal pb-0.5">%</span>
                        </div>
                        <div className="w-full bg-[#111111] h-2 mt-3 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#ccff00] transition-all duration-1000"
                                style={{ width: `${score}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Based on recent analysis.</p>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#111111]">
                {/* Main Content Area (scrollable) */}
                <main className="flex-1 overflow-auto p-8 scrollbar-none">
                    <Outlet />
                </main>

                {/* Floating Bottom Nav Pill (Mobile Only) */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#222] rounded-full py-3 px-6 shadow-2xl flex md:hidden justify-between items-center z-50">
                    <BottomNavLink to="/" icon={<LayoutDashboard size={24} />} active={isActive('/')} />
                    <BottomNavLink to="/reports" icon={<FileText size={24} />} active={isActive('/reports')} />
                    <BottomNavLink to="/ai-assistant" icon={<Bot size={24} />} active={isActive('/ai-assistant')} />
                </div>
            </div>
        </div>
    );
}

function SidebarNavLink({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                ? 'bg-[#ccff00] text-[#111111] shadow-lg'
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
            className={`relative p-2 rounded-xl transition-all duration-300 ${active ? 'text-[#ccff00]' : 'text-gray-500 hover:text-[#ccff00]'} `}
        >
            {icon}
            {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-[#ccff00] rounded-full" />
            )}
        </Link>
    );
}

