import { useState, useEffect } from 'react';
import { Upload, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RangeBar from '../components/visualizations/RangeBar';
import BodyMap from '../components/visualizations/BodyMap';
import InsightCard from '../components/visualizations/InsightCard';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../config';

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Initialize from localStorage if available
    const [result, setResult] = useState(() => {
        return null; // Start null, let useEffect sync with user
    });

    const [error, setError] = useState(null);

    // Initialize/Load Result when User changes
    useEffect(() => {
        if (user?.email) {
            const key = `dashboard_analysis_${user.email}`;
            try {
                const saved = localStorage.getItem(key);
                if (saved) {
                    setResult(JSON.parse(saved));
                } else {
                    setResult(null);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [user]);

    // Auto-save whenever result changes
    useEffect(() => {
        if (result && user?.email) {
            const key = `dashboard_analysis_${user.email}`;
            localStorage.setItem(key, JSON.stringify(result));
        }
    }, [result, user]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(endpoints.analyze, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to analyze report');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for chart
    const chartData = result?.metrics?.map(m => ({
        name: m.name,
        value: typeof m.value === 'number' ? m.value : parseFloat(m.value) || 0,
        status: m.status,
        unit: m.unit
    })).filter(d => !isNaN(d.value)) || [];

    // Placeholder to avoid replacement error before verifying
    // Collect all affected organs
    const allAffectedOrgans = result?.metrics?.flatMap(m => m.insights?.affected_organs || []).filter(Boolean) || [];
    const uniqueOrgans = [...new Set(allAffectedOrgans)];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#bef264] p-8 rounded-3xl shadow-xl shadow-[#bef264]/10 border border-[#bef264]/50">
                <div>
                    <h2 className="text-5xl font-display font-bold text-[#111111] tracking-wide uppercase">Health Overview</h2>
                    <div className="inline-block mt-2 bg-[#111111]/10 border border-[#111111]/20 px-3 py-1 rounded-full text-sm font-bold text-[#111111]">
                        LATEST REPORT ANALYSIS
                    </div>
                </div>

                {/* Quick Upload Widget */}
                <div className="flex items-center gap-3 bg-[#000000]/10 p-3 rounded-2xl">
                    <input
                        type="file"
                        id="dash-upload"
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        className="hidden"
                    />
                    <label
                        htmlFor="dash-upload"
                        className="px-6 py-3 bg-[#111111] hover:bg-[#222222] text-[#bef264] font-bold tracking-wide rounded-xl cursor-pointer transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <Upload size={18} />
                        {file ? file.name.substring(0, 15) + "..." : "Upload PDF"}
                    </label>
                    {file && (
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="px-8 py-3 bg-[#ffffff] hover:bg-gray-100 text-[#111111] font-display tracking-widest text-lg rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Activity size={20} />}
                            ANALYZE
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Dynamic Stat Cards with Range Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Explicitly check for key metrics first, or fallback to first 3 items */}
                {(['Blood Pressure', 'Hemoglobin', 'Blood Sugar']).map((key, i) => {
                    const metric = result?.metrics?.find(m => m.name.toLowerCase().includes(key.toLowerCase()))
                        || (result?.metrics && result.metrics[i]);

                    return (
                        <div key={i} className="p-6 rounded-3xl bg-racing-card border border-[#2a2a2a] relative overflow-hidden group">
                            {/* Decorative racing line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-racing-dark via-racing-accent to-racing-dark opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-racing-text font-display text-2xl tracking-wide uppercase">{metric ? metric.name : key}</h3>
                                {metric && (
                                    <span className={`text-xs px-3 py-1 font-bold tracking-wider rounded-md border ${metric.status === 'Normal' ? 'bg-[#1a2f22] text-[#4ade80] border-[#22c55e]' :
                                        'bg-red-500/10 text-red-400 border-red-500/30'
                                        }`}>{metric.status.toUpperCase()}</span>
                                )}
                            </div>

                            {metric ? (
                                <RangeBar
                                    value={typeof metric.value === 'number' ? metric.value : parseFloat(metric.value) || 0}
                                    unit={metric.unit}
                                    status={metric.status}
                                    max={metric.name.includes('Sugar') ? 200 : metric.name.includes('Pressure') ? 180 : 20}
                                />
                            ) : (
                                <div className="text-slate-600 text-sm py-4">No data available</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Detailed Insights List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl border border-[#2a2a2a] bg-racing-card p-6 relative overflow-hidden">
                        {/* Header styled like a massive sports banner block */}
                        <div className="bg-racing-accent -m-6 mb-6 p-6 flex justify-between items-center text-[#111111]">
                            <h3 className="text-4xl font-display tracking-wide uppercase m-0">Detailed Insights</h3>
                            <Activity size={28} />
                        </div>

                        {result?.metrics?.length > 0 ? (
                            <div className="space-y-4">
                                {result.metrics.map((metric, idx) => (
                                    <InsightCard key={idx} metric={metric} />
                                ))}
                            </div>
                        ) : result ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                <AlertCircle className="w-12 h-12 mb-4 text-slate-700" />
                                <h4 className="text-lg font-semibold text-slate-300 mb-2">No Specific Metrics Found</h4>
                                <p className="max-w-md mx-auto text-sm">
                                    The AI couldn't extract standard numerical metrics (like BP or Sugar).
                                    Please check the doctor's note for the summary.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                <Activity className="w-12 h-12 mb-4 opacity-20" />
                                <p>Upload a report to see visualizations</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-1 space-y-6">

                    {/* AI Summary */}
                    <div className="rounded-3xl border border-[#2a2a2a] bg-racing-card p-6 relative">
                        <h3 className="text-2xl font-display tracking-widest text-racing-accent mb-4 uppercase">AI Assessment</h3>
                        {result?.overall_summary ? (
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {result.overall_summary}
                            </p>
                        ) : (
                            <p className="text-slate-500 text-sm italic">
                                Summary will appear here.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
